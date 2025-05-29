// src/hooks/useStoreSettings.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getStoreInfo } from "~/network";
import { StoreInfoResponse } from "~/network/types/online-store-settings";
import {
  useOnlineStoreSettings,
  useStoreInfo,
  useStoreManager,
} from "~/store/useStore";

import { queryKeys } from "../queryClient";

// New hook: Complete store data management
export function useStoreData() {
  const queryClient = useQueryClient();
  const { updateAllStoreData } = useStoreManager();

  // Get data from individual hooks
  const settings = useOnlineStoreSettings((state) => state.settings);
  const storeInfo = useStoreInfo((state) => ({
    isOpen: state.isOpen,
    phone: state.phone,
    profilePic: state.profilePic,
    rating: state.rating,
    storeName: state.storeName,
  }));

  const query = useQuery<StoreInfoResponse>({
    queryFn: async () => {
      console.log("Fetching complete store data...");
      const response = await getStoreInfo();
      console.log("Fetched complete store data:", response);
      return response.data;
    },
    queryKey: queryKeys.storeSettings,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      console.log("Updating all store data with:", query.data);
      updateAllStoreData(query.data);
    }
  }, [query.data]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.storeSettings });
  };

  return {
    ...query,
    completeData: query.data,
    refreshData,
    settings,
    storeInfo,
  };
}

export function useStoreSettings() {
  const queryClient = useQueryClient();
  const { settings } = useOnlineStoreSettings();
  const { updateAllStoreData } = useStoreManager();

  const query = useQuery<StoreInfoResponse>({
    queryFn: async () => {
      console.log("Fetching store info...");
      const response = await getStoreInfo();
      console.log("Fetched store data:", response);
      return response.data;
    },
    queryKey: queryKeys.storeSettings,
    staleTime: 5 * 60 * 1000,
  });

  console.log("Query state:", {
    dataExists: !!query.data,
    dataShape: query.data ? typeof query.data : null,
    isError: query.isError,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    settings: settings,
  });

  console.log("query.data structure:", JSON.stringify(query.data, null, 2));

  useEffect(() => {
    if (query.data) {
      console.log("Updating all store data with:", query.data);
      updateAllStoreData(query.data);
    }
  }, [query.data]);

  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.storeSettings });
  };

  return {
    ...query,
    refreshSettings,
    settings: settings,
    storeData: query.data,
  };
}

export function useStoreSettingsOnly() {
  const queryClient = useQueryClient();
  const { settings, updateSettings } = useOnlineStoreSettings();

  const query = useQuery<StoreInfoResponse>({
    queryFn: async () => {
      const response = await getStoreInfo();
      return response.data;
    },
    queryKey: queryKeys.storeSettings,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data?.onlineStoreSettings) {
      console.log(
        "Updating only settings with:",
        query.data.onlineStoreSettings
      );
      updateSettings(query.data.onlineStoreSettings);
    }
  }, [query.data?.onlineStoreSettings]);

  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.storeSettings });
  };

  return {
    ...query,
    refreshSettings,
    settings: settings,
  };
}
