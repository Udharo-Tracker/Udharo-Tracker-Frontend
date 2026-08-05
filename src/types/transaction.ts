import type { Customer } from "./customer";

export type TransactionType = "opening" | "udharo" | "payment";

export interface Transaction {
  id: string;
  txn_number: string;
  type: TransactionType;
  title: string;
  amount: string;
  status: string;
  remarks: string;
  transaction_date: string;
  created_at: string;
  customer: Customer;
  recorded_by: string;
}

export interface TransactionListParams {
  customer_id?: string;
  type?: TransactionType;
}
