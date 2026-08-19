type ReminderChannel = "note" | "sms" | "whatsapp" | "auto";

interface ReminderLog {
  id: string;
  customer: string;
  sent_at: string;
  note: string;
  outstanding_balance: string;
  channel: ReminderChannel;
  delivery_status: string;
}

interface CreateReminderInput {
  note?: string;
}

interface ReminderListParams {
  channel?: ReminderChannel;
}
