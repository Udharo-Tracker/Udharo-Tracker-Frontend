import type { Customer } from "./customer";

export interface Payment {
  id: string;
  customer: Customer;
  amount_paid: string;
  note?: string;
  created_at: string;
}

export interface PaymentInput {
  customer_id: string;
  amount_paid: string;
  note?: string;
}
export type PaymentUpdateInput = Partial<PaymentInput>;
