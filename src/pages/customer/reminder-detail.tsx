import { Drawer } from "antd";
import {
  Send,
  MessageSquareText,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { Panel } from "@/components/shared/Panel";
import { DetailRow } from "@/components/shared/DetailRow";
import { StatusTag } from "@/components/shared/StatusTag";
import { npr } from "@/lib/currency";
import { formatDate } from "@/utils/date";

const CHANNEL_META: Record<
  ReminderChannel,
  { label: string; icon: typeof Send }
> = {
  note: { label: "Note", icon: Send },
  sms: { label: "SMS", icon: MessageSquareText },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  auto: { label: "Automatic", icon: RefreshCw },
};

interface Props {
  open: boolean;
  reminder: ReminderLog | null;
  onClose: () => void;
}

export function ReminderDetailDrawer({ open, reminder, onClose }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Reminder details"
      destroyOnHidden
      size={480}
    >
      {reminder && <ReminderDetailBody reminder={reminder} />}
    </Drawer>
  );
}

function ReminderDetailBody({ reminder }: { reminder: ReminderLog }) {
  const channelMeta = CHANNEL_META[reminder.channel] ?? CHANNEL_META.note;
  const ChannelIcon = channelMeta.icon;
  const failed = reminder.delivery_status === "failed";

  return (
    <div className="space-y-5 pt-1">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-2xl grid place-items-center bg-primary-soft text-primary">
          <ChannelIcon className="size-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">
            {channelMeta.label} reminder
          </div>
          <div className="text-lg font-bold">
            {formatDate(reminder.sent_at)}
          </div>
        </div>
      </div>

      <Panel>
        <dl className="space-y-3 text-sm">
          <DetailRow label="Sent on" value={formatDate(reminder.sent_at)} />
          <DetailRow label="Channel" value={channelMeta.label} />
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Delivery status</dt>
            <dd>
              <StatusTag tone={failed ? "danger" : "success"}>
                {reminder.delivery_status}
              </StatusTag>
            </dd>
          </div>
          <DetailRow
            label="Outstanding balance"
            value={npr(reminder.outstanding_balance)}
          />
        </dl>
      </Panel>

      <Panel>
        <h3 className="font-semibold text-sm mb-3">Note</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {reminder.note || "No note was added for this reminder."}
        </p>
      </Panel>
    </div>
  );
}
