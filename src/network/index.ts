import axios, { AxiosResponse, isAxiosError } from "axios";

const BASE_URL = "http://localhost:3000";

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

export const getStoreInfo = async (
  storeId: string
): Promise<AxiosResponse<any>> => {
  return backendInstance("v1").get(`/online/store/${storeId}`);
};
