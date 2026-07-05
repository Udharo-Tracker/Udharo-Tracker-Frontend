import type { CreditRiskLevel } from "./credit-score";

export interface CustomerBalanceSummary {
  id: string;
  name: string;
  phone: string;
  total_udharo: number;
  total_paid: number;
  outstanding_balance: number;
  last_transaction: string | null;
  risk: CreditRiskLevel;
}

export interface DashboardSummary {
  total_credit_given: number;
  total_recovered: number;
  total_pending: number;
  todays_udharo: number;
  top_5_debtors: CustomerBalanceSummary[];
}

export interface LedgerSummary {
  total_outstanding: number;
  customers_summary: CustomerBalanceSummary[];
}

export interface MonthlyBreakdown {
  month: number;
  month_name: string;
  total_udharo: number;
  total_payments: number;
  net: number;
  entry_count: number;
  payment_count: number;
}

export interface YearlyReport {
  year: number;
  months: MonthlyBreakdown[];
  yearly_totals: {
    total_udharo: number;
    total_payments: number;
    net: number;
  };
}

export interface DailyBreakdown {
  date: string;
  total_udharo: number;
  total_payments: number;
  net: number;
  entry_count: number;
  payment_count: number;
}

export interface MonthlyDetailReport {
  year: number;
  month: number;
  month_name: string;
  daily_breakdown: DailyBreakdown[];
  totals: {
    total_udharo: number;
    total_payments: number;
    net: number;
  };
}

export type MonthlyReport = YearlyReport | MonthlyDetailReport;

export interface MonthlyReportParams {
  year: number;
  month?: number;
}
