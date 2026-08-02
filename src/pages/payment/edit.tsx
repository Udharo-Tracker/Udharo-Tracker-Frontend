import { useState } from "react";
import { App, Modal, Button, Skeleton } from "antd";
import { Check } from "lucide-react";
import { Textarea } from "@/components/shared/Textarea";
import { Label } from "@/components/shared/Label";
import { usePayment, useUpdatePayment } from "@/api/payments.api";
import { npr } from "@/lib/currency";
import type { Payment } from "@/types/payment";

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export function EditPaymentModal({ open, id, onClose }: Props) {
  const payment = usePayment(id);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Edit payment" destroyOnHidden width={520}>
      {open &&
        (payment.data ? (
          <EditPaymentForm key={id} id={id} initial={payment.data} onClose={onClose} />
        ) : (
          <Skeleton active paragraph={{ rows: 4 }} />
        ))}
    </Modal>
  );
}

function EditPaymentForm({ id, initial, onClose }: { id: string; initial: Payment; onClose: () => void }) {
  const { message } = App.useApp();
  const updatePayment = useUpdatePayment(id);

  const [amount, setAmount] = useState(initial.amount_paid);
  const [note, setNote] = useState(initial.note ?? "");

  const value = parseFloat(amount) || 0;
  const valid = value > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    updatePayment.mutate(
      { customer_id: initial.customer.id, amount_paid: amount, note: note || undefined },
      {
        onSuccess: () => {
          message.success("Payment updated");
          onClose();
        },
        onError: (error) => message.error(error.message),
      }
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5 pt-2">
      <p className="text-sm text-muted-foreground -mt-2">From {initial.customer.name}</p>
      <div>
        <Label className="mb-2 block">Amount received</Label>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          required
          autoFocus
          className="w-full h-16 rounded-2xl bg-muted/60 border border-input px-5 text-3xl font-bold outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <Label className="mb-2 block">Note (optional)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. partial payment, salary day…"
          className="rounded-2xl bg-muted/60 border-input min-h-20"
        />
      </div>

      <Button
        htmlType="submit"
        disabled={!valid}
        loading={updatePayment.isPending}
        size="large"
        className="w-full rounded-2xl h-14 text-base disabled:opacity-50"
      >
        <Check className="size-4" /> Save changes ({npr(value)})
      </Button>
    </form>
  );
}
