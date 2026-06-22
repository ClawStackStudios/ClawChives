import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";
import type { AppearanceSettings } from "@/services/types";

export const APPEARANCE_SETTINGS_QUERY_KEY = ["settings", "appearance"];

export function useAppearanceSettings() {
  const db = useDatabaseAdapter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: APPEARANCE_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      if (!db) return null;
      return db.getAppearanceSettings();
    },
    enabled: !!db,
  });

  const mutation = useMutation({
    mutationFn: async (settings: AppearanceSettings) => {
      if (!db) throw new Error("DB not available");
      await db.saveAppearanceSettings(settings);
      return settings;
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: APPEARANCE_SETTINGS_QUERY_KEY });
      const previousSettings = queryClient.getQueryData(APPEARANCE_SETTINGS_QUERY_KEY);
      queryClient.setQueryData(APPEARANCE_SETTINGS_QUERY_KEY, newSettings);
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      queryClient.setQueryData(APPEARANCE_SETTINGS_QUERY_KEY, context?.previousSettings);
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData(APPEARANCE_SETTINGS_QUERY_KEY, newSettings);
    },
  });

  return {
    ...query,
    saveSettings: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
