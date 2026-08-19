import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, requestBlob, saveBlob } from "./client";

export const statementQueryKeys = {
  detail: (customerId: string) =>
    ["customers", "detail", customerId, "statement"] as const,
};

export function getCustomerStatement(customerId: string) {
  return apiClient.get<CustomerStatement>(
    `/customers/${customerId}/statement/`,
  );
}

export function useCustomerStatement(customerId: string) {
  return useQuery({
    queryKey: statementQueryKeys.detail(customerId),
    queryFn: () => getCustomerStatement(customerId),
    enabled: !!customerId,
  });
}

// Downloads and saves the PDF twin of getCustomerStatement — same rows,
// same running balances, safe to offer next to the on-screen statement
// without re-fetching anything else.
export async function downloadCustomerStatementPdf(
  customerId: string,
  customerName?: string,
) {
  const { blob, filename } = await requestBlob(
    `/customers/${customerId}/statement/pdf/`,
    `statement-${customerName ?? customerId}.pdf`,
  );
  saveBlob(blob, filename);
}

export function useDownloadCustomerStatementPdf() {
  return useMutation({
    mutationFn: ({
      customerId,
      customerName,
    }: {
      customerId: string;
      customerName?: string;
    }) => downloadCustomerStatementPdf(customerId, customerName),
  });
}
