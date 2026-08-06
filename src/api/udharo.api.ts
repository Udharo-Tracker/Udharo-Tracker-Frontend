import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { customersQueryKeys } from "./customers.api";
import { transactionsQueryKeys } from "./transactions.api";
import { ledgerQueryKeys } from "./ledger.api";

export const udharoQueryKeys = {
  all: ["udharo"] as const,
  lists: () => [...udharoQueryKeys.all, "list"] as const,
  details: () => [...udharoQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...udharoQueryKeys.details(), id] as const,
};

export function getUdharoEntries() {
  return apiClient.get<UdharoEntry[]>("/udharo/");
}

export function getUdharoEntry(id: string) {
  return apiClient.get<UdharoEntry>(`/udharo/${id}/`);
}

export function createUdharoEntry(input: UdharoEntryInput) {
  return apiClient.post<UdharoEntry>("/udharo/", input);
}

export function updateUdharoEntry(id: string, input: UdharoEntryInput) {
  return apiClient.put<UdharoEntry>(`/udharo/${id}/`, input);
}

export function patchUdharoEntry(id: string, input: UdharoEntryUpdateInput) {
  return apiClient.patch<UdharoEntry>(`/udharo/${id}/`, input);
}

export function deleteUdharoEntry(id: string) {
  return apiClient.delete<void>(`/udharo/${id}/`);
}

export function useUdharoEntries() {
  return useQuery({
    queryKey: udharoQueryKeys.lists(),
    queryFn: getUdharoEntries,
  });
}

export function useUdharoEntry(id: string) {
  return useQuery({
    queryKey: udharoQueryKeys.detail(id),
    queryFn: () => getUdharoEntry(id),
    enabled: !!id,
  });
}

// Adding an udharo entry also moves the affected customer's outstanding
// balance, the ledger transaction list, and the dashboard/summary totals —
// all of those caches need to be invalidated alongside the udharo list, or
// screens showing them keep stale data until a manual reload.
function invalidateAffectedByUdharo(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: udharoQueryKeys.lists() });
  queryClient.invalidateQueries({ queryKey: customersQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: transactionsQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.dashboard });
  queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.summary });
}

export function useCreateUdharoEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUdharoEntry,
    onSuccess: () => invalidateAffectedByUdharo(queryClient),
  });
}

export function useUpdateUdharoEntry(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UdharoEntryInput) => updateUdharoEntry(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(udharoQueryKeys.detail(id), data);
      invalidateAffectedByUdharo(queryClient);
    },
  });
}

export function usePatchUdharoEntry(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UdharoEntryUpdateInput) => patchUdharoEntry(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(udharoQueryKeys.detail(id), data);
      invalidateAffectedByUdharo(queryClient);
    },
  });
}

export function useDeleteUdharoEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUdharoEntry,
    onSuccess: () => invalidateAffectedByUdharo(queryClient),
  });
}
