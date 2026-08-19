// Lean customer shape nested inside Payment/UdharoEntry/Transaction and
// returned by the customers list endpoint. No ledger_summary — the API
// deliberately keeps balance queries off this base shape so nesting it in a
// transaction/payment list doesn't N+1. See CustomerDetail for the full
// single-customer shape.
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  credit_limit: string;
  // Turns credit_limit from advisory into enforced — new udharo entries that
  // would push outstanding balance over the limit get rejected. Only takes
  // effect when credit_limit is also > 0.
  block_over_credit_limit: boolean;
  credit_term_days: number;
  loyalty_discount: string;
  opening_balance: string;
  created_at: string;
}

interface CustomerLedgerSummary {
  opening_balance: string;
  total_udharo: string;
  total_paid: string;
  outstanding_balance: string;
}

// Returned by GET/POST/PUT/PATCH on a single customer — adds ledger_summary
// on top of Customer.
interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  credit_limit: string;
  block_over_credit_limit: boolean;
  credit_term_days: number;
  loyalty_discount: string;
  created_at: string;
  ledger_summary: CustomerLedgerSummary;
}

interface CustomerInput {
  name: string;
  phone: string;
  email: string;
  address: string;
  credit_limit: string;
  block_over_credit_limit?: boolean;
  credit_term_days: number;
  loyalty_discount: string;
  opening_balance: string;
}

type CustomerUpdateInput = Partial<CustomerInput>;

interface CustomerListParams {
  ordering?: string;
}
