import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  Address,
  OnlineStoreSettings,
  StoreInfoResponse,
  StorePartyMember,
} from "~/network/types/online-store-settings";

interface StoreInfoState {
  agreementDateTime: null | string;
  averagePrepTime: null | number;
  banner: null | string;
  bio: null | string;
  customColor: null | string;
  deliveryMethods: string[];
  id: null | string;
  ipAddress: null | string;
  isOpen: boolean;
  lastUpdated: null | number;
  maxDeliveryFee: null | number;
  minDeliveryFee: null | number;
  phone: null | string;
  profilePic: null | string;
  projectId: null | string;
  rating: null | number;
  resetStoreInfo: () => void;
  slug: null | string;
  storeLink: null | string;
  storeName: null | string;

  subscriptionPackage: null | string;
  updateStoreInfo: (
    storeInfo: Omit<StoreInfoResponse, "onlineStoreSettings" | "party">
  ) => void;
}

export const useStoreInfo = create<StoreInfoState>()(
  persist(
    (set) => ({
      agreementDateTime: null,
      averagePrepTime: null,
      banner: null,
      bio: null,
      customColor: null,
      deliveryMethods: [],
      id: null,
      ipAddress: null,
      isOpen: false,
      lastUpdated: null,
      maxDeliveryFee: null,
      minDeliveryFee: null,
      phone: null,
      profilePic: null,
      projectId: null,
      rating: null,
      resetStoreInfo: () => {
        set({
          agreementDateTime: null,
          averagePrepTime: null,
          banner: null,
          bio: null,
          customColor: null,
          deliveryMethods: [],
          id: null,
          ipAddress: null,
          isOpen: false,
          lastUpdated: null,
          maxDeliveryFee: null,
          minDeliveryFee: null,
          phone: null,
          profilePic: null,
          projectId: null,
          rating: null,
          slug: null,
          storeLink: null,
          storeName: null,
          subscriptionPackage: null,
        });
      },
      slug: null,
      storeLink: null,
      storeName: null,

      subscriptionPackage: null,

      updateStoreInfo: (storeInfo) => {
        set({
          ...storeInfo,
          lastUpdated: Date.now(),
        });
      },
    }),
    {
      name: "store-info-storage",
    }
  )
);

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
        set({
          lastUpdated: null,
          settings: null,
        });
      },

      settings: null,

      updateSettings: (settings) => {
        set({
          lastUpdated: Date.now(),
          settings,
        });
      },
    }),
    {
      name: "online-store-settings-storage",
    }
  )
);

interface StoreAddressState {
  address: Address | null;
  lastUpdated: null | number;

  resetAddress: () => void;
  updateAddress: (address: Address) => void;
}

export const useStoreAddress = create<StoreAddressState>()(
  persist(
    (set) => ({
      address: null,
      lastUpdated: null,

      resetAddress: () => {
        set({
          address: null,
          lastUpdated: null,
        });
      },

      updateAddress: (address) => {
        set({
          address,
          lastUpdated: Date.now(),
        });
      },
    }),
    {
      name: "store-address-storage",
    }
  )
);

// 4. Store Party Hook
interface StorePartyState {
  getMainPartyMember: () => null | StorePartyMember;
  lastUpdated: null | number;

  party: StorePartyMember[];
  resetParty: () => void;
  updateParty: (party: StorePartyMember[]) => void;
}

export const useStoreParty = create<StorePartyState>()(
  persist(
    (set, get) => ({
      getMainPartyMember: () => {
        const { party } = get();
        return party.length > 0 ? party[0] : null;
      },
      lastUpdated: null,

      party: [],

      resetParty: () => {
        set({
          lastUpdated: null,
          party: [],
        });
      },

      updateParty: (party) => {
        set({
          lastUpdated: Date.now(),
          party,
        });
      },
    }),
    {
      name: "store-party-storage",
    }
  )
);

export const useStoreManager = () => {
  const updateStoreInfo = useStoreInfo((state) => state.updateStoreInfo);
  const updateSettings = useOnlineStoreSettings(
    (state) => state.updateSettings
  );
  const updateAddress = useStoreAddress((state) => state.updateAddress);
  const updateParty = useStoreParty((state) => state.updateParty);

  const resetStoreInfo = useStoreInfo((state) => state.resetStoreInfo);
  const resetSettings = useOnlineStoreSettings((state) => state.resetSettings);
  const resetAddress = useStoreAddress((state) => state.resetAddress);
  const resetParty = useStoreParty((state) => state.resetParty);

  const updateAllStoreData = (apiResponse: StoreInfoResponse) => {
    const { onlineStoreSettings, party, ...storeInfo } = apiResponse;
    updateStoreInfo(storeInfo);

    updateSettings(onlineStoreSettings);

    updateParty(party);

    if (party.length > 0 && party[0].address) {
      updateAddress(party[0].address);
    }
  };

  const resetAllStoreData = () => {
    resetStoreInfo();
    resetSettings();
    resetAddress();
    resetParty();
  };

  return {
    resetAllStoreData,
    updateAllStoreData,
  };
};

// 6. Convenience hooks for common operations
export const useStoreStatus = () => {
  const isOpen = useStoreInfo((state) => state.isOpen);
  const storeName = useStoreInfo((state) => state.storeName);
  const rating = useStoreInfo((state) => state.rating);

  return { isOpen, rating, storeName };
};

export const useStoreDeliveryInfo = () => {
  const address = useStoreAddress((state) => state.address);
  const deliveryMethods = useStoreInfo((state) => state.deliveryMethods);
  const minDeliveryFee = useStoreInfo((state) => state.minDeliveryFee);
  const maxDeliveryFee = useStoreInfo((state) => state.maxDeliveryFee);

  return {
    address,
    deliveryFee: address?.delivery_fee || 0,
    deliveryMethods,
    maxDeliveryFee,
    maxRadius: address?.max_radius || 0,
    minDeliveryFee,
  };
};
