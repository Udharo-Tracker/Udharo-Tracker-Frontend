export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  credit_limit: string;
  credit_term_days: number;
  loyalty_discount: string;
  opening_balance: string;
  created_at: string;
}

export type CustomerInput = Omit<Customer, "id" | "created_at">;
export type CustomerUpdateInput = Partial<CustomerInput>;
