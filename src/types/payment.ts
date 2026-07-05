export interface Payment {
  id: string;
  customer: string;
  amount_paid: string;
  note?: string;
  created_at: string;
}

export type PaymentInput = Omit<Payment, "id" | "created_at">;
export type PaymentUpdateInput = Partial<PaymentInput>;
