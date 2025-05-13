import { create } from "zustand";
import { persist } from "zustand/middleware";

import { OnlineStoreSettings } from "~/network/types/online-store-settings";

interface OnlineStoreSettingsState {
  lastUpdated: null | number;
  resetSettings: () => void;
  settings: null | OnlineStoreSettings;
  updateSettings: (settings: OnlineStoreSettings) => void;
}

export const useOnlineStoreSettings = create<OnlineStoreSettingsState>()(
  persist(
    (set) => ({
      lastUpdated: null,
      resetSettings: () => {
        console.log("Resetting settings");
        set({
          lastUpdated: null,
          settings: null,
        });
      },

      settings: null,

      updateSettings: (settings) => {
        console.log("Zustand updateSettings called with:", settings);
        set({
          lastUpdated: Date.now(),
          settings,
        });
        console.log("Zustand store updated");
      },
    }),
    {
      name: "online-store-settings-storage",
    }
  )
);
