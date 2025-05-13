// src/hooks/useStoreSettings.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useEffect } from "react";

import { getStoreSettings } from "~/network";
import { OnlineStoreSettings } from "~/network/types/online-store-settings";
import { useOnlineStoreSettings } from "~/store/useStoreSettingsStore";

import { queryKeys } from "../queryClient";

export function useStoreSettings() {
  const queryClient = useQueryClient();
  const { settings, updateSettings } = useOnlineStoreSettings();

  const query = useQuery<AxiosResponse<OnlineStoreSettings>>({
    queryFn: async () => {
      console.log("Fetching store settings...");
      const response = await getStoreSettings();
      console.log("Fetched data:", response);
      return response;
    },
    queryKey: queryKeys.storeSettings,
    staleTime: 5 * 60 * 1000,
  });

  // Add debug logging
  console.log("Query state:", {
    dataExists: !!query.data,
    dataShape: query.data ? typeof query.data : null,
    isError: query.isError,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    settings: settings,
  });

  console.log("query.data structure:", JSON.stringify(query.data));

  useEffect(() => {
    // Check if we have query.data first
    if (query.data) {
      console.log("query.data exists, type:", typeof query.data);

      // Check if query.data.data exists (for Axios response)
      if ("data" in query.data) {
        console.log("Updating with query.data.data:", query.data.data);
        updateSettings(query.data.data);
      } else {
        // If query.data is the settings object directly
        console.log("Updating with query.data directly:", query.data);
        updateSettings(query.data as unknown as OnlineStoreSettings);
      }
    }
  }, [query.data, updateSettings]);

  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.storeSettings });
  };

  return {
    ...query,
    refreshSettings,
    // Make sure to extract the data property from the Axios response
    settings: query.data?.data || settings,
  };
}
