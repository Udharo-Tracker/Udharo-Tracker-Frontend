interface UdharoEntryItem {
  id: string;
  item_name: string;
  amount: string;
}

type UdharoEntryItemInput = Omit<UdharoEntryItem, "id">;

interface UdharoEntry {
  id: string;
  customer: Customer;
  items: UdharoEntryItem[];
  total_amount: string;
  note?: string;
  is_settled: boolean;
  created_at: string;
  settled_at: string | null;
}

interface UdharoEntryInput {
  customer_id: string;
  items: UdharoEntryItemInput[];
  note?: string;
}

type UdharoEntryUpdateInput = Partial<UdharoEntryInput>;

interface UdharoEntryListParams {
  ordering?: string;
}
