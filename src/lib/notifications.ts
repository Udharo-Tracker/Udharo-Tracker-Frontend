import {
  UserPlus,
  ClipboardList,
  Wallet,
  Send,
  AlertTriangle,
  ShieldAlert,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { StatusTagTone } from "@/components/shared/StatusTag";

interface NotifTypeMeta {
  label: string;
  icon: LucideIcon;
  tone: StatusTagTone;
}

export const NOTIF_TYPE_META: Record<NotifType, NotifTypeMeta> = {
  customer_added: { label: "Customer added", icon: UserPlus, tone: "primary" },
  udharo_created: {
    label: "Udharo created",
    icon: ClipboardList,
    tone: "warning",
  },
  payment_received: {
    label: "Payment received",
    icon: Wallet,
    tone: "success",
  },
  reminder_sent: { label: "Reminder sent", icon: Send, tone: "primary" },
  credit_risk_red: {
    label: "Credit risk",
    icon: AlertTriangle,
    tone: "danger",
  },
  credit_limit_exceeded: {
    label: "Credit limit exceeded",
    icon: ShieldAlert,
    tone: "danger",
  },
};

export function getNotifTypeMeta(type: NotifType): NotifTypeMeta {
  return NOTIF_TYPE_META[type] ?? { label: type, icon: Bell, tone: "muted" };
}

// Icon-chip background/foreground per tone — mirrors CustomerAvatar's
// bg-{tone}-soft treatment. Kept as literal class strings (not built with
// template interpolation) so Tailwind's scanner picks them up.
export const NOTIF_TONE_CHIP_CLASS: Record<StatusTagTone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-foreground",
  danger: "bg-danger-soft text-danger",
  muted: "bg-muted text-muted-foreground",
};

export const NOTIF_TYPE_OPTIONS: { value: NotifType; label: string }[] = (
  Object.keys(NOTIF_TYPE_META) as NotifType[]
).map((value) => ({ value, label: NOTIF_TYPE_META[value].label }));
