interface CustomerStatementSummary {
  total_udharo: number;
  total_paid: number;
  outstanding_balance: number;
}

interface StatementTransaction {
  id: string;
  type: "udharo" | "payment";
  amount: number;
  note: string;
  date: string;
  balance: number;
}

interface CustomerStatement {
  customer: Customer;
  summary: CustomerStatementSummary;
  udharo_entries: UdharoEntry[];
  transactions: StatementTransaction[];
}
