import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { App, Card, Button } from "antd";
import { CustomerCombobox } from "../../components/shared/CustomerCombobox";
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreatePayment } from "@/api/payments.api";
import { useLedgerSummary } from "@/api/ledger.api";
import { npr } from "@/lib/currency";

export function RecordPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preset = searchParams.get("customerId") ?? undefined;
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
      { customer: customerId, amount_paid: amount, note: note || undefined },
      {
        onSuccess: () => {
          message.success(`${npr(value)} received${cust ? ` from ${cust.name}` : ""}`);
          navigate(`/customers/${customerId}`);
        },
        onError: (error) => {
          message.error(error.message);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-bold">Record payment</h1>
        <p className="text-sm text-muted-foreground mt-1">3 taps: customer → amount → confirm.</p>
      </header>

      <form onSubmit={submit} className="space-y-5">
        <Card className="p-6 rounded-3xl border-none shadow-sm space-y-5">
          <div>
            <Label className="mb-2 block">1. Customer</Label>
            <CustomerCombobox value={customerId} onChange={setCustomerId} autoFocus={!preset} />
          </div>

          {cust && (
            <div className="rounded-2xl bg-primary-soft p-4 flex items-center justify-between">
              <span className="text-sm text-primary font-medium">Current outstanding</span>
              <span className="text-lg font-bold text-primary">{npr(cust.outstanding_balance)}</span>
            </div>
          )}

          <div>
            <Label className="mb-2 block">2. Amount received</Label>
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
        </Card>

        <Button
          htmlType="submit"
          disabled={!valid}
          loading={createPayment.isPending}
          size="large"
          className="w-full rounded-2xl h-14 text-base disabled:opacity-50"
        >
          <Check className="size-4" /> 3. Confirm payment
        </Button>
      </form>
    </div>
  );
}
