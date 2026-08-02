import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { App, Modal, Button } from "antd";
import { CustomerCombobox } from "@/components/shared/CustomerCombobox";
import { Check } from "lucide-react";
import { Textarea } from "@/components/shared/Textarea";
import { Label } from "@/components/shared/Label";
import { useCreatePayment } from "@/api/payments.api";
import { useLedgerSummary } from "@/api/ledger.api";
import { npr } from "@/lib/currency";

interface Props {
  open: boolean;
  customerId?: string;
  onClose: () => void;
}

export function CreatePaymentModal({ open, customerId: preset, onClose }: Props) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Record payment" destroyOnHidden width={520}>
      {open && <CreatePaymentForm preset={preset} onClose={onClose} />}
    </Modal>
  );
}

function CreatePaymentForm({ preset, onClose }: { preset?: string; onClose: () => void }) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const createPayment = useCreatePayment();
  const ledgerSummary = useLedgerSummary();

  const [customerId, setCustomerId] = useState(preset ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);
  const cust = ledgerSummary.data?.customers_summary.find((c) => c.id === customerId);

  useEffect(() => {
    if (customerId) amountRef.current?.focus();
  }, [customerId]);

  const value = parseFloat(amount) || 0;
  const valid = customerId && value > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    createPayment.mutate(
      { customer_id: customerId, amount_paid: amount, note: note || undefined },
      {
        onSuccess: () => {
          message.success(`${npr(value)} received${cust ? ` from ${cust.name}` : ""}`);
          onClose();
          navigate(`/customers/${customerId}`);
        },
        onError: (error) => message.error(error.message),
      }
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5 pt-2">
      <div>
        <Label className="mb-2 block">Customer</Label>
        <CustomerCombobox value={customerId} onChange={setCustomerId} autoFocus={!preset} />
      </div>

      {cust && (
        <div className="rounded-2xl bg-primary-soft p-4 flex items-center justify-between">
          <span className="text-sm text-primary font-medium">Current outstanding</span>
          <span className="text-lg font-bold text-primary">{npr(cust.outstanding_balance)}</span>
        </div>
      )}

      <div>
        <Label className="mb-2 block">Amount received</Label>
        <input
          ref={amountRef}
          inputMode="numeric"
          pattern="[0-9]*"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          required
          className="w-full h-16 rounded-2xl bg-muted/60 border border-input px-5 text-3xl font-bold outline-none focus:ring-2 focus:ring-ring"
        />
        {cust && value > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            New balance: <span className="font-semibold text-foreground">{npr(Math.max(0, cust.outstanding_balance - value))}</span>
          </div>
        )}
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
        loading={createPayment.isPending}
        size="large"
        className="w-full rounded-2xl h-14 text-base disabled:opacity-50"
      >
        <Check className="size-4" /> Confirm payment
      </Button>
    </form>
  );
}
