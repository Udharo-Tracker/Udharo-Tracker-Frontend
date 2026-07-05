export interface Customer {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export type CustomerInput = Omit<Customer, "id" | "created_at">;
export type CustomerUpdateInput = Partial<CustomerInput>;
