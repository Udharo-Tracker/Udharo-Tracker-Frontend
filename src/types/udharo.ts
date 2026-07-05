export interface UdharoEntryItem {
  id: string;
  item_name: string;
  amount: string;
}

export type UdharoEntryItemInput = Omit<UdharoEntryItem, "id">;

export interface UdharoEntry {
  id: string;
  customer: string;
  items: UdharoEntryItem[];
  total_amount: string;
  note?: string;
  is_settled: boolean;
  created_at: string;
  settled_at: string | null;
}

export interface UdharoEntryInput {
  customer: string;
  items: UdharoEntryItemInput[];
  note?: string;
}

export type UdharoEntryUpdateInput = Partial<UdharoEntryInput>;
