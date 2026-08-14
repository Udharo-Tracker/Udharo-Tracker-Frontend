type NotifType =
  | "customer_added"
  | "udharo_created"
  | "payment_received"
  | "reminder_sent"
  | "credit_risk_red"
  | "credit_limit_exceeded";

// Named AppNotification (not Notification) to avoid colliding with the
// DOM lib's global Notification (browser Notification API) interface.
interface AppNotification {
  id: string;
  notif_type: NotifType;
  title: string;
  message: string;
  customer: string | null;
  customer_name: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationListParams {
  is_read?: boolean;
  notif_type?: NotifType;
  created_after?: string;
  created_before?: string;
}
