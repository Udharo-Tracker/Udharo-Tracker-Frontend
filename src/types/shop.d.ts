interface Shop {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

type ShopInput = Omit<Shop, "id" | "created_at">;
type ShopUpdateInput = Partial<ShopInput>;
