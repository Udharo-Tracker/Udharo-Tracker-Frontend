import type { UdharoEntry } from "./udharo";

export interface CustomerStatementSummary {
  total_udharo: number;
  total_paid: number;
  outstanding_balance: number;
}

export interface StatementTransaction {
  id: string;
  type: "udharo" | "payment";
  amount: number;
  note: string;
  date: string;
  balance: number;
}

export interface CustomerStatement {
  customer: {
    id: string;
    name: string;
    phone: string | null;
  };
  summary: CustomerStatementSummary;
  udharo_entries: UdharoEntry[];
  transactions: StatementTransaction[];
}
