export interface OnlineStoreSettings {
  headerImage: string;
  bannerHeading: string;
  tagLine: string;
  mode: "light" | "dark";
  bannerSettings: {
    bannerColor: string | null;
    bannerTextColor: string | null;
    buttonColor: string | null;
    buttonTextColor: string | null;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    x: string;
    google: string;
  };
  supportPhone: string;
  banner: string;
  logo: string;
  primaryColor: string;
}
