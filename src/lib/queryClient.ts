import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

export const getQueryClient = cache(() => new QueryClient());

export const queryKeys = {
  storeInfo: ["storeInfo"] as const,
  storeSettings: ["storeSettings"] as const,
};
