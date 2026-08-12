interface Shop {
  id: string;
  name: string;
  legal_name: string;
  tax_number: string;
  logo: string | null;
  phone: string;
  address: string;
  created_at: string;
}

type ShopInput = Partial<Omit<Shop, "id" | "created_at" | "logo">> &
  Pick<Shop, "name"> & {
    logo?: File | null;
  };
type ShopUpdateInput = Partial<ShopInput>;
