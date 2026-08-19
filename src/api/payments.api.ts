import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { customersQueryKeys } from "./customers.api";
import { transactionsQueryKeys } from "./transactions.api";
import { ledgerQueryKeys } from "./ledger.api";

export const paymentsQueryKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentsQueryKeys.all, "list"] as const,
  list: (params: PaymentListParams) =>
    [...paymentsQueryKeys.lists(), params] as const,
  details: () => [...paymentsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentsQueryKeys.details(), id] as const,
};

// Sortable via `ordering`: amount_paid, transaction_date, created_at.
// Prefix with "-" to descend; defaults to -created_at server-side.
export function getPayments(params: PaymentListParams = {}) {
  const search = new URLSearchParams();
  if (params.ordering) search.set("ordering", params.ordering);
  const query = search.toString();
  return apiClient.get<Payment[]>(`/payments/${query ? `?${query}` : ""}`);
}

export function getPayment(id: string) {
  return apiClient.get<Payment>(`/payments/${id}/`);
}

export function createPayment(input: PaymentInput) {
  return apiClient.post<Payment>("/payments/", input);
}

export function updatePayment(id: string, input: PaymentInput) {
  return apiClient.put<Payment>(`/payments/${id}/`, input);
}

export function patchPayment(id: string, input: PaymentUpdateInput) {
  return apiClient.patch<Payment>(`/payments/${id}/`, input);
}

export function deletePayment(id: string) {
  return apiClient.delete<void>(`/payments/${id}/`);
}

export function usePayments(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: paymentsQueryKeys.list(params),
    queryFn: () => getPayments(params),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentsQueryKeys.detail(id),
    queryFn: () => getPayment(id),
    enabled: !!id,
  });
}

// Recording a payment also moves the affected customer's outstanding
// balance, the ledger transaction list, and the dashboard/summary totals —
// all of those caches need to be invalidated alongside the payments list,
// or screens showing them keep stale data until a manual reload.
function invalidateAffectedByPayment(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.lists() });
  queryClient.invalidateQueries({ queryKey: customersQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: transactionsQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.dashboard });
  queryClient.invalidateQueries({ queryKey: ledgerQueryKeys.summary });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => invalidateAffectedByPayment(queryClient),
  });
}

export function useUpdatePayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentInput) => updatePayment(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(paymentsQueryKeys.detail(id), data);
      invalidateAffectedByPayment(queryClient);
    },
  });
}

export function usePatchPayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentUpdateInput) => patchPayment(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(paymentsQueryKeys.detail(id), data);
      invalidateAffectedByPayment(queryClient);
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePayment,
    onSuccess: () => invalidateAffectedByPayment(queryClient),
  });
}
