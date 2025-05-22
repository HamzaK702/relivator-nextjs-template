export enum MenuItemStatusEnum {
  AVAILABLE = 0,
  OUT_OF_STOCK = 1,
  UNAVAILABLE = 2,
}

export interface MenuItem {
  customizations: MenuItemCustomization[];
  description: string;
  hidden: boolean;
  image: string;
  menuItemId: string;
  name: string;
  price: number;
  sort_index: number;
  status: MenuItemStatusEnum;
}

export interface MenuItemCustomization {
  customizationId: string;
  customizationType: "ADDON" | "OTHER" | "VARIATION";
  isRequired: boolean;
  limit: number;
  options: MenuItemCustomizationOption[];
  selectionType: "MULTIPLE" | "SINGLE";
  title: string;
}

export interface MenuItemCustomizationOption {
  customizationOptionId: string;
  name: string;
  priceModifier: number;
}

export interface MenuItemResponse {
  categoryName: string;
  description: null | string;
  id: string;
  menuItems: MenuItem[];
  sorting_index: number;
}

export interface MenuItemsPaginatedResponse {
  data: MenuItemResponse[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
