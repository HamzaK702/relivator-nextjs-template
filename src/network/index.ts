import axios, { AxiosResponse } from "axios";

import { OnlineStoreSettings } from "./types/online-store-settings";

const BASE_URL = "http://localhost:3000";
const storeId = process.env.STORE_ID;

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

export const getStoreInfo = async (): Promise<AxiosResponse<any>> => {
  return backendInstance("v1").get(`/online/store/${storeId}`);
};

export const getStoreSettings = async (): Promise<
  AxiosResponse<OnlineStoreSettings>
> => {
  return await backendInstance("v1").get(`/online/store/settings/${storeId}`);
};
