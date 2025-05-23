// Address interface
export interface Address {
  allow_extended_delivery: boolean;
  card_tax: number;
  city: string;
  country: string;
  delivery_fee: number;
  id: number;
  latitude: string;
  longitude: string;
  max_radius: number;
  per_km_fee: number;
  postalCode: string;
  province: string;
  streetName: string;
  streetNumber: string;
  tax: number;
}

export interface OnlineStoreSettings {
  bannerHeading: string;
  bannerSettings: {
    bannerColor: null | string;
    bannerTextColor: null | string;
    buttonColor: null | string;
    buttonTextColor: null | string;
  };
  createdAt: string;
  headerImage: string;
  id: number;
  mode: "dark" | "light";
  socialLinks: {
    facebook: string;
    google: string;
    instagram: string;
    x: string;
  };
  supportPhone: string;
  tagLine: string;
  updatedAt: string;
}

// Main store info response interface
export interface StoreInfoResponse {
  agreementDateTime: null | string;
  averagePrepTime: null | number;
  banner: string;
  bio: string;
  customColor: string;
  deliveryMethods: string[];
  id: string;
  ipAddress: null | string;
  isOpen: boolean;
  maxDeliveryFee: null | number;
  minDeliveryFee: null | number;
  onlineStoreSettings: OnlineStoreSettings;
  party: StorePartyMember[];
  phone: string;
  profilePic: string;
  projectId: null | string;
  rating: null | number;
  slug: null | string;
  storeLink: string;
  storeName: string;
  subscriptionPackage: string;
}

// Store party member interface
export interface StorePartyMember {
  address: Address;
  auth_id: string;
  id: string;
  nextBillingDate: null | string;
  refreshToken: string;
  role: number;
}