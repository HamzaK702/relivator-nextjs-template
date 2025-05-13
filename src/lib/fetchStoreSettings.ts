import { dehydrate } from "@tanstack/react-query";

import { getStoreSettings } from "../network";
import { getQueryClient, queryKeys } from "./queryClient";

export async function prefetchStoreSettings() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryFn: async () => {
      const { data } = await getStoreSettings();
      return data;
    },
    queryKey: queryKeys.storeSettings,
  });

  return dehydrate(queryClient);
}
