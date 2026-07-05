import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { CustomerStatement } from "@/types/statement";

export const statementQueryKeys = {
  detail: (customerId: string) => ["customers", "detail", customerId, "statement"] as const,
};

export function getCustomerStatement(customerId: string) {
  return apiClient.get<CustomerStatement>(`/customers/${customerId}/statement/`);
}

export function useCustomerStatement(customerId: string) {
  return useQuery({
    queryKey: statementQueryKeys.detail(customerId),
    queryFn: () => getCustomerStatement(customerId),
    enabled: !!customerId,
  });
}
