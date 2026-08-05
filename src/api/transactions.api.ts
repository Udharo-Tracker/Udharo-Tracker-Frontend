import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Transaction, TransactionListParams } from "@/types/transaction";

export const transactionsQueryKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionsQueryKeys.all, "list"] as const,
  list: (params: TransactionListParams) =>
    [...transactionsQueryKeys.lists(), params] as const,
  details: () => [...transactionsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionsQueryKeys.details(), id] as const,
};

export function getTransactions(params: TransactionListParams = {}) {
  const search = new URLSearchParams();
  if (params.customer_id) search.set("customer_id", params.customer_id);
  if (params.type) search.set("type", params.type);
  const query = search.toString();
  return apiClient.get<Transaction[]>(
    `/ledger/transactions/${query ? `?${query}` : ""}`,
  );
}

export function getTransaction(id: string) {
  return apiClient.get<Transaction>(`/ledger/transactions/${id}/`);
}

export function useTransactions(params: TransactionListParams = {}) {
  return useQuery({
    queryKey: transactionsQueryKeys.list(params),
    queryFn: () => getTransactions(params),
  });
}

export function useCustomerTransactions(customerId: string) {
  return useQuery({
    queryKey: transactionsQueryKeys.list({ customer_id: customerId }),
    queryFn: () => getTransactions({ customer_id: customerId }),
    enabled: !!customerId,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionsQueryKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: !!id,
  });
}
