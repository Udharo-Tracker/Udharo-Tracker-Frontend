type TransactionType = "opening" | "udharo" | "payment";

// Flat, ledger-style row returned by GET /ledger/transactions/ — running
// debit/credit columns and cumulative closing balances computed
// server-side. No nested customer/remarks/allocations; fetch a single
// Transaction (below) to drill into one row.
interface TransactionListItem {
  id: string;
  created_at: string;
  transaction_date: string;
  txn_number: string;
  title: string;
  type: TransactionType;
  transaction_credit: string;
  transaction_debit: string;
  closing_balance_credit: string;
  closing_balance_debit: string;
}

interface TransactionRecordedBy {
  id: string;
  full_name: string;
}

interface TransactionPartyPayment {
  payment_mode: PaymentMode;
  reference: string;
  photos: PaymentPhoto[];
  amount: number;
  write_off_amount: number;
  // The transaction this payment was allocated from.
  allocated_from: {
    id: string;
    txn_number: string;
    transaction_date: string;
  } | null;
}

// One customer/supplier/staff side of a transaction and how much of it
// has been paid off so far.
interface TransactionParty {
  amount: number;
  customer: Customer | null;
  supplier: string | null;
  staff: string | null;
  paid_amount: number;
  unpaid_amount: number;
  status: string;
  payments: TransactionPartyPayment[];
}

// A slice of this transaction's amount allocated against an earlier,
// still-outstanding transaction (e.g. a payment settling an old udharo).
interface TransactionAllocation {
  id: string;
  total: number;
  amount: number;
  write_off_amount: number;
  transaction_date: string;
  due_date: string | null;
  transaction_id: string;
  txn_number: string;
}

// Full detail returned by GET /ledger/transactions/{id}/ — a different
// shape from TransactionListItem, not a superset of it.
interface Transaction {
  id: string;
  txn_number: string;
  type: string;
  title: string;
  amount: string;
  status: string;
  remarks: string;
  transaction_date: string;
  created_at: string;
  customer: Customer;
  recorded_by: TransactionRecordedBy | null;
  // Only set for the matching `type` — id of the linked udharo entry, so
  // the detail view can fetch its full breakdown.
  udharo_entry: string | null;
  parties: TransactionParty[];
  allocations: TransactionAllocation[] | null;
  balance_after: number;
}

interface TransactionListParams {
  customer_id?: string;
  type?: TransactionType;
  // Sortable fields: transaction_date, created_at, amount, txn_number.
  // Prefix with "-" to descend; defaults to -transaction_date,-created_at
  // server-side.
  ordering?: string;
}
