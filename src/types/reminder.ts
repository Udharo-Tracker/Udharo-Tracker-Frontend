export interface ReminderLog {
  id: string;
  customer: string;
  sent_at: string;
  note: string;
  outstanding_balance: string;
}

export interface CreateReminderInput {
  note?: string;
}
