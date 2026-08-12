import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export const shopsQueryKeys = {
  all: ["shops"] as const,
  lists: () => [...shopsQueryKeys.all, "list"] as const,
  details: () => [...shopsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...shopsQueryKeys.details(), id] as const,
};

// Shop writes go through FormData whenever a logo file is attached, since
// the API expects multipart for file uploads; plain JSON otherwise.
function toShopPayload(
  input: ShopInput | ShopUpdateInput,
): ShopInput | ShopUpdateInput | FormData {
  if (!(input.logo instanceof File)) return input;

  const formData = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === "logo") {
      formData.append("logo", value as File);
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

export function getShops() {
  return apiClient.get<Shop[]>("/shop/");
}

export function getShop(id: string) {
  return apiClient.get<Shop>(`/shop/${id}/`);
}

export function createShop(input: ShopInput) {
  return apiClient.post<Shop>("/shop/", toShopPayload(input));
}

export function updateShop(id: string, input: ShopInput) {
  return apiClient.put<Shop>(`/shop/${id}/`, toShopPayload(input));
}

export function patchShop(id: string, input: ShopUpdateInput) {
  return apiClient.patch<Shop>(`/shop/${id}/`, toShopPayload(input));
}

export function deleteShop(id: string) {
  return apiClient.delete<void>(`/shop/${id}/`);
}

export function useShops() {
  return useQuery({
    queryKey: shopsQueryKeys.lists(),
    queryFn: getShops,
  });
}

export function useShop(id: string) {
  return useQuery({
    queryKey: shopsQueryKeys.detail(id),
    queryFn: () => getShop(id),
    enabled: !!id,
  });
}

export function useCreateShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShop,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shopsQueryKeys.lists() }),
  });
}

export function useUpdateShop(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ShopInput) => updateShop(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(shopsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: shopsQueryKeys.lists() });
    },
  });
}

export function usePatchShop(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ShopUpdateInput) => patchShop(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(shopsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: shopsQueryKeys.lists() });
    },
  });
}

export function useDeleteShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteShop,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shopsQueryKeys.lists() }),
  });
}
