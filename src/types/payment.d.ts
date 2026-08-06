type PaymentMode = "cash" | "card" | "fonepay" | "nepal_pay" | "bank_transfer";

interface PaymentPhoto {
  id: string;
  image: string;
  uploaded_at: string;
}

interface Payment {
  id: string;
  customer: Customer;
  amount_paid: string;
  payment_mode?: PaymentMode;
  reference?: string;
  note?: string;
  created_at: string;
  photos?: PaymentPhoto[];
}

interface PaymentInput {
  customer_id: string;
  amount_paid: string;
  note?: string;
}

type PaymentUpdateInput = Partial<PaymentInput>;
