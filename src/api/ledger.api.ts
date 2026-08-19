import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, requestBlob, saveBlob } from "./client";

export const ledgerQueryKeys = {
  dashboard: ["ledger", "dashboard"] as const,
  summary: ["ledger", "summary"] as const,
  monthlyReport: (params: MonthlyReportParams) =>
    ["ledger", "monthly-report", params] as const,
};

export function getDashboard() {
  return apiClient.get<DashboardSummary>("/ledger/dashboard/");
}

export function getLedgerSummary() {
  return apiClient.get<LedgerSummary>("/ledger/summary/");
}

export function getMonthlyReport({ year, month }: MonthlyReportParams) {
  const search = new URLSearchParams({ year: String(year) });
  if (month !== undefined) search.set("month", String(month));
  return apiClient.get<MonthlyReport>(
    `/ledger/monthly-report/?${search.toString()}`,
  );
}

export function useDashboard() {
  return useQuery({
    queryKey: ledgerQueryKeys.dashboard,
    queryFn: getDashboard,
  });
}

export function useLedgerSummary() {
  return useQuery({
    queryKey: ledgerQueryKeys.summary,
    queryFn: getLedgerSummary,
  });
}

export function useMonthlyReport(params: MonthlyReportParams) {
  return useQuery({
    queryKey: ledgerQueryKeys.monthlyReport(params),
    queryFn: () => getMonthlyReport(params),
  });
}

// Downloads and saves the same data as getMonthlyReport, rendered as a PDF.
// A validation failure (missing year, bad month) surfaces as the usual
// ApiError rather than a corrupt file.
export async function downloadMonthlyReportPdf({
  year,
  month,
}: MonthlyReportParams) {
  const search = new URLSearchParams({ year: String(year) });
  if (month !== undefined) search.set("month", String(month));
  const { blob, filename } = await requestBlob(
    `/ledger/monthly-report/pdf/?${search.toString()}`,
    `monthly-report-${year}${month ? `-${String(month).padStart(2, "0")}` : ""}.pdf`,
  );
  saveBlob(blob, filename);
}

export function useDownloadMonthlyReportPdf() {
  return useMutation({ mutationFn: downloadMonthlyReportPdf });
}
