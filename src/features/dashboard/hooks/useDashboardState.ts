import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";
import { useInfiniteBookmarks } from "@/hooks/useInfiniteBookmarks";
import { useBookmarkStats } from "@/hooks/useBookmarkStats";
import { useTags } from "@/hooks/useTags";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { FOLDER_COUNTS_QUERY_KEY } from "@/hooks/useFolderCounts";
import { useSidebarSearch } from "@/hooks/useSidebarSearch";
import { useDebounce, sortBookmarks } from '@/shared/lib/utils';
import type { SortBy } from '@/shared/lib/utils';
import { generateUUID } from '@/shared/lib/crypto';
import type { Bookmark, Folder } from "@/services/types";

export type NavTab = "dashboard" | "all" | "starred" | "tags" | "archived" | "pinned";

export const useDashboardState = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(() => sessionStorage.getItem("cc_selected_folder"));
  const [activeTab, setActiveTab] = useState<NavTab>(() => (sessionStorage.getItem("cc_active_tab") as NavTab) || "dashboard");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState({
    starred: false,
    pinned: false,
    archived: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("cc_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; variant?: "info" | "error" } | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>(() => (sessionStorage.getItem("cc_sort_by") as SortBy) || "date-desc");
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem("cc_sidebar_width");
    return saved ? parseInt(saved, 10) : 256;
  });
  const [isResizable, setIsResizable] = useState<boolean>(() => {
    return localStorage.getItem("cc_is_resizable") === "true";
  });

  const db = useDatabaseAdapter();
  const queryClient = useQueryClient();

  const {
    flatBookmarks,
    updateBookmark,
    saveBookmark,
    deleteBookmark,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBookmarks();

  const { data: stats } = useBookmarkStats();
  const { data: allTags } = useTags();
  const { data: appearanceSettings, saveSettings } = useAppearanceSettings();
  
  const viewMode = appearanceSettings?.layout ?? "grid";
  const debouncedQuery = useDebounce(searchQuery, 300);
  const filteredFolders = useSidebarSearch(folders, searchQuery);

  const loadFolders = async () => {
    if (!db) return;
    try {
      const allFolders = await db.getFolders();
      setFolders(allFolders);
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("cc_sidebar_open", sidebarOpen.toString());
  }, [sidebarOpen]);

  useEffect(() => {
    loadFolders();
  }, [db]);

  useEffect(() => {
    if (!db) return;
    queryClient.prefetchQuery({
      queryKey: FOLDER_COUNTS_QUERY_KEY,
      queryFn: () => db.getFolderCounts(),
    });
  }, [db, queryClient]);

  // Sync sort by from database if not manually overridden in session
  useEffect(() => {
    if (appearanceSettings) {
      if (!sessionStorage.getItem("cc_sort_by") && appearanceSettings.sortBy) {
        setSortBy(appearanceSettings.sortBy === "title" ? "name-asc" : appearanceSettings.sortBy === "starred" ? "date-desc" : "date-desc");
      }
    }
  }, [appearanceSettings]);

  const handleSortChange = (sort: SortBy) => {
    setSortBy(sort);
    sessionStorage.setItem("cc_sort_by", sort);
  };

  const handleViewChange = (mode: "grid" | "list") => {
    if (appearanceSettings) {
      saveSettings({ ...appearanceSettings, layout: mode });
    }
  };

  const handleSidebarWidthChange = (width: number) => {
    // Enforce safety bounds: 200px - 600px
    const constrained = Math.min(Math.max(width, 200), 600);
    setSidebarWidth(constrained);
    localStorage.setItem("cc_sidebar_width", constrained.toString());
  };

  const handleResizableToggle = (val: boolean) => {
    setIsResizable(val);
    localStorage.setItem("cc_is_resizable", val ? "true" : "false");
  };

  const handleSaveBookmark = async (bookmark: Bookmark) => {
    try {
      const isExisting = flatBookmarks.some((b) => b.id === bookmark.id);
      if (isExisting) {
        updateBookmark(bookmark);
      } else {
        saveBookmark(bookmark);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save bookmark:", error);
      setAlertModal({ title: "Pinch Failed", message: "Failed to save Pinchmark.", variant: "error" });
    }
  };

  const handleSelectFolder = (id: string | null) => {
    setSelectedFolder(id);
    if (id) {
      sessionStorage.setItem("cc_selected_folder", id);
      setActiveTab("all");
      sessionStorage.setItem("cc_active_tab", "all");
    } else {
      sessionStorage.removeItem("cc_selected_folder");
    }
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    sessionStorage.setItem("cc_active_tab", tab);
    setSelectedFolder(null);
    sessionStorage.removeItem("cc_selected_folder");
    setTagFilter(null);
    setFilterStatus({ starred: false, pinned: false, archived: false });
  };

  const handleAddFolder = async (name: string, color: string = "#06b6d4") => {
    if (!db) return;
    try {
      await db.saveFolder({ id: generateUUID(), name, color, createdAt: new Date().toISOString() });
      queryClient.invalidateQueries({ queryKey: FOLDER_COUNTS_QUERY_KEY });
      await loadFolders();
      setIsFolderModalOpen(false);
    } catch (error) {
      console.error("Failed to add folder:", error);
      setAlertModal({ title: "Pod Failed", message: "Failed to create Pod.", variant: "error" });
    }
  };

  const handleEditFolder = async (id: string, data: { name: string; color: string }) => {
    if (!db) return;
    try {
      const existing = folders.find((f) => f.id === id);
      if (!existing) return;
      await db.updateFolder({ ...existing, name: data.name, color: data.color });
      queryClient.invalidateQueries({ queryKey: FOLDER_COUNTS_QUERY_KEY });
      await loadFolders();
      setIsFolderModalOpen(false);
      setEditingFolder(null);
    } catch (error) {
      console.error("Failed to update folder:", error);
      setAlertModal({ title: "Pod Failed", message: "Failed to update Pod.", variant: "error" });
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!db) return;
    try {
      await db.deleteFolder(id);
      queryClient.invalidateQueries({ queryKey: FOLDER_COUNTS_QUERY_KEY });
      if (selectedFolder === id) {
        setSelectedFolder(null);
        sessionStorage.removeItem("cc_selected_folder");
      }
      await loadFolders();
      setIsFolderModalOpen(false);
      setEditingFolder(null);
    } catch (error) {
      console.error("Failed to delete folder:", error);
      setAlertModal({ title: "Pod Failed", message: "Failed to delete Pod.", variant: "error" });
    }
  };

  const handleDeleteTag = async (tag: string) => {
    try {
      const attached = flatBookmarks.filter((b) => b.tags.includes(tag));
      await Promise.all(
        attached.map((b) =>
          updateBookmark({
            ...b,
            tags: b.tags.filter((t) => t !== tag),
            updatedAt: new Date().toISOString(),
          })
        )
      );
    } catch (error) {
      console.error("Failed to delete tag:", error);
      setAlertModal({ title: "Tag Delete Failed", message: "Failed to delete tag.", variant: "error" });
    }
  };

  const filteredBookmarks = useMemo(
    () =>
      sortBookmarks(
        flatBookmarks.filter((bookmark) => {
          const lowerQuery = debouncedQuery.toLowerCase();
          const matchesSearch =
            bookmark.title.toLowerCase().includes(lowerQuery) ||
            bookmark.url.toLowerCase().includes(lowerQuery) ||
            bookmark.description?.toLowerCase().includes(lowerQuery) ||
            bookmark.tags?.some((t) => t.toLowerCase().includes(lowerQuery));

          const matchesFolder = selectedFolder ? bookmark.folderId === selectedFolder : true;
          const matchesTag = tagFilter ? bookmark.tags.includes(tagFilter) : true;
          
          let matchesFilter = true;
          if (activeTab === "starred" && !bookmark.starred) matchesFilter = false;
          if (activeTab === "pinned" && !bookmark.pinned) matchesFilter = false;
          if (activeTab === "archived" && !bookmark.archived) matchesFilter = false;
          
          if (filterStatus.starred && !bookmark.starred) matchesFilter = false;
          if (filterStatus.pinned && !bookmark.pinned) matchesFilter = false;
          if (filterStatus.archived && !bookmark.archived) matchesFilter = false;

          // By default, hide archived pinchmarks unless explicitly viewing them
          if (bookmark.archived && activeTab !== "archived" && !filterStatus.archived) matchesFilter = false;

          return matchesSearch && matchesFolder && matchesTag && matchesFilter;
        }),
        sortBy
      ),
    [flatBookmarks, debouncedQuery, selectedFolder, activeTab, tagFilter, filterStatus, sortBy]
  );

  return {
    folders,
    selectedFolder,
    activeTab,
    tagFilter,
    filterStatus,
    searchQuery,
    isModalOpen,
    editingBookmark,
    sidebarOpen,
    alertModal,
    sortBy,
    viewMode,
    flatBookmarks,
    filteredFolders,
    filteredBookmarks,
    appearanceSettings,
    stats,
    allTags,
    tagsCount: allTags?.length ?? 0,
    hasNextPage,
    isFetchingNextPage,
    setSearchQuery,
    setSidebarOpen,
    setTagFilter,
    setFilterStatus,
    setIsModalOpen,
    setEditingBookmark,
    setAlertModal,
    handleSortChange,
    handleViewChange,
    handleSaveBookmark,
    handleSelectFolder,
    handleTabChange,
    handleAddFolder,
    handleEditFolder,
    handleDeleteFolder,
    handleDeleteTag,
    fetchNextPage,
    deleteBookmark,
    updateBookmark,
    loadFolders,
    sidebarWidth,
    setSidebarWidth: handleSidebarWidthChange,
    isResizable,
    setIsResizable: handleResizableToggle,
    isFolderModalOpen,
    setIsFolderModalOpen,
    editingFolder,
    setEditingFolder
  };
};
