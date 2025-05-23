import axios, { AxiosResponse } from "axios";

import {
  MenuItem,
  MenuItemResponse,
  StoreMenuResponse,
} from "./types/menu-item-response";
import { OnlineStoreSettings, StoreInfoResponse } from "./types/online-store-settings";
import { StoreCategoryResponse } from "./types/store-category-response";

const BASE_URL = "http://localhost:3000";
const storeId = process.env.STORE_ID || "5df5796d-bacf-46ba-a4b3-fe308854d703";

const BACKEND_BASE_URL = {
  v1: `${BASE_URL}`,
};

const backendInstance = (version: keyof typeof BACKEND_BASE_URL) => {
  const instance = axios.create({
    baseURL: BACKEND_BASE_URL[version],
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  });

  return instance;
};

export const getStoreInfo = async (): Promise<AxiosResponse<StoreInfoResponse>> => {
  return await backendInstance("v1").get(`/online/store/${storeId}`);
};

export const getStoreSettings = async (): Promise<
  AxiosResponse<OnlineStoreSettings>
> => {
  return await backendInstance("v1").get(`/online/store/settings/${storeId}`);
};

export const getPopularItems = async (
  limit = 4
): Promise<AxiosResponse<MenuItemResponse[]>> => {
  return await backendInstance("v1").get(
    `/online/store/${storeId}/popular-items?limit=${limit}`
  );
};

export const getStoreMenu = async (): Promise<
  AxiosResponse<StoreMenuResponse[]>
> => {
  return await backendInstance("v1").get(`/online/store/${storeId}/menu`);
};

export const getStoreCategories = async (): Promise<
  AxiosResponse<StoreCategoryResponse[]>
> => {
  return await backendInstance("v1").get(`/online/store/${storeId}/categories`);
};

export const getMenuByCategory = async (
  categoryId: string
): Promise<AxiosResponse<MenuItem[]>> => {
  return await backendInstance("v1").get(
    `/online/store/${storeId}/menu/${categoryId}`
  );
};
