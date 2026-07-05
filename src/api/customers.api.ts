import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "./client";
import type { Customer, CustomerInput, CustomerUpdateInput } from "@/types/customer";
import type { CreditScore } from "@/types/credit-score";

export const customersQueryKeys = {
  all: ["customers"] as const,
  lists: () => [...customersQueryKeys.all, "list"] as const,
  details: () => [...customersQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...customersQueryKeys.details(), id] as const,
  creditScore: (id: string) => [...customersQueryKeys.detail(id), "credit-score"] as const,
  creditScoreHistory: (id: string) =>
    [...customersQueryKeys.detail(id), "credit-score", "history"] as const,
};

export function getCustomers() {
  return apiClient.get<Customer[]>("/customers/");
}

export function getCustomer(id: string) {
  return apiClient.get<Customer>(`/customers/${id}/`);
}

export function createCustomer(input: CustomerInput) {
  return apiClient.post<Customer>("/customers/", input);
}

export function updateCustomer(id: string, input: CustomerInput) {
  return apiClient.put<Customer>(`/customers/${id}/`, input);
}

export function patchCustomer(id: string, input: CustomerUpdateInput) {
  return apiClient.patch<Customer>(`/customers/${id}/`, input);
}

export function deleteCustomer(id: string) {
  return apiClient.delete<void>(`/customers/${id}/`);
}

export function getCustomerCreditScore(customerId: string) {
  return apiClient.get<CreditScore>(`/customers/${customerId}/credit-score/`);
}

export function getCustomerCreditScoreHistory(customerId: string) {
  return apiClient.get<CreditScore[]>(`/customers/${customerId}/credit-score/history/`);
}

export function useCustomers() {
  return useQuery({
    queryKey: customersQueryKeys.lists(),
    queryFn: getCustomers,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customersQueryKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
}

export function useCustomerCreditScore(customerId: string) {
  return useQuery({
    queryKey: customersQueryKeys.creditScore(customerId),
    queryFn: () => getCustomerCreditScore(customerId),
    enabled: !!customerId,
    // A 404 means no score has been calculated yet — not worth retrying.
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 404) && failureCount < 3,
  });
}

export function useCustomerCreditScoreHistory(customerId: string) {
  return useQuery({
    queryKey: customersQueryKeys.creditScoreHistory(customerId),
    queryFn: () => getCustomerCreditScoreHistory(customerId),
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() }),
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) => updateCustomer(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(customersQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() });
    },
  });
}

export function usePatchCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerUpdateInput) => patchCustomer(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(customersQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() }),
  });
}
