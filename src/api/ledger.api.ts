import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

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
