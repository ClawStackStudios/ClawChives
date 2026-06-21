import { useState } from "react";
import { Plus, Tag, X, Settings2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { ModalContainer } from "@/shared/ui/modals/ModalContainer";
import { getTagColorClasses } from "@/shared/lib/lobsterColorRNG";


interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export function TagInput({ tags, setTags }: TagInputProps) {
  const [tagInput, setTagInput] = useState("");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    if (newTags.length === 0) {
      setIsManageModalOpen(false);
    }
  };

  return (
    <div>
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Tags</Label>
      <div className="flex gap-2 mt-1">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Add tags..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="pl-10 dark:bg-slate-800 dark:border-slate-600 dark:text-white h-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddTag}
          className="px-3 dark:border-slate-600 text-slate-700 dark:text-slate-300 h-10"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tag Display Area */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.length <= 2 ? (
            tags.map((tag) => {
              const colorClasses = getTagColorClasses(tag);
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-tight ${colorClasses}`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-75 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })
          ) : (
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-black border border-slate-200 dark:border-slate-700 uppercase tracking-widest hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Tags ({tags.length})
            </button>
          )}
        </div>
      )}

      {/* Manage Tags Sub-Modal */}
      {isManageModalOpen && (
        <ModalContainer
          onClose={() => setIsManageModalOpen(false)}
          borderColor="border-cyan-500/50"
          maxWidth="max-w-xs"
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                Manage Tags
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsManageModalOpen(false)}
                className="h-8 w-8 p-0 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
              {tags.map((tag) => {
                const colorClasses = getTagColorClasses(tag);
                return (
                  <div
                    key={tag}
                    className={`flex items-center justify-between p-2.5 rounded-xl border animate-in fade-in slide-in-from-left-2 duration-200 ${colorClasses}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <Button
                onClick={() => setIsManageModalOpen(false)}
                className="w-full h-10 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px]"
              >
                Done
              </Button>
            </div>
          </div>
        </ModalContainer>
      )}
    </div>
  );
}
