export interface Shop {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export type ShopInput = Omit<Shop, "id" | "created_at">;
export type ShopUpdateInput = Partial<ShopInput>;
