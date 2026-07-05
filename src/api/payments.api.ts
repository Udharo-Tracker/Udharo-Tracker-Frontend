import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Payment, PaymentInput, PaymentUpdateInput } from "@/types/payment";

export const paymentsQueryKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentsQueryKeys.all, "list"] as const,
  details: () => [...paymentsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentsQueryKeys.details(), id] as const,
};

export function getPayments() {
  return apiClient.get<Payment[]>("/payments/");
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

export function usePayments() {
  return useQuery({
    queryKey: paymentsQueryKeys.lists(),
    queryFn: getPayments,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentsQueryKeys.detail(id),
    queryFn: () => getPayment(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.lists() }),
  });
}

export function useUpdatePayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentInput) => updatePayment(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(paymentsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.lists() });
    },
  });
}

export function usePatchPayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentUpdateInput) => patchPayment(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(paymentsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.lists() });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.lists() }),
  });
}
