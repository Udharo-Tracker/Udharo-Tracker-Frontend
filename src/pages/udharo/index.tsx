import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { customers, npr } from "../../lib/mock-data";
import { CustomerCombobox } from "../../components/shared/CustomerCombobox";
import { Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, } from "antd";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function AddUdharo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preset = searchParams.get("customerId") ?? undefined;
  const [customerId, setCustomerId] = useState(preset ?? "");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([{ name: "", amount: "" }]);
  const firstAmountRef = useRef<HTMLInputElement>(null);

  // When the first item row appears (e.g. customer just selected), focus its amount field
  useEffect(() => {
    if (customerId && items.length === 1 && !items[0].amount) {
      firstAmountRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const total = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const valid = customerId && total > 0;

  const addItem = () => setItems((s) => [...s, { name: "", amount: "" }]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const cust = customers.find((c) => c.id === customerId)!;
    toast.success("Udharo added", { description: `${npr(total)} to ${cust.name}` });
    navigate(`/customers/${customerId}`);
  };

  return (
    <div className="max-w-3xl space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-bold">Add udharo entry</h1>
        <p className="text-sm text-muted-foreground mt-1">Record items given on credit.</p>
      </header>

      <form onSubmit={submit} className="space-y-5">
        <Card className="p-6 rounded-3xl border-none shadow-sm space-y-5">
          <div>
            <Label className="mb-2 block">Customer</Label>
            <CustomerCombobox value={customerId} onChange={setCustomerId} autoFocus={!preset} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <span className="text-xs text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</span>
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    placeholder="Item name"
                    value={it.name}
                    onChange={(e) => {
                      const next = [...items]; next[idx].name = e.target.value; setItems(next);
                    }}
                    className="h-12 rounded-2xl bg-muted/60 border border-input flex-1 px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    ref={idx === 0 ? firstAmountRef : undefined}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Amount"
                    value={it.amount}
                    onChange={(e) => {
                      const next = [...items]; next[idx].amount = e.target.value.replace(/[^0-9.]/g, ""); setItems(next);
                    }}
                    className="h-12 rounded-2xl bg-muted/60 border border-input w-32 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="size-12 rounded-2xl bg-muted hover:bg-muted/80 grid place-items-center"
                      aria-label="Remove item"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 w-full h-12 rounded-2xl border-2 border-dashed border-input text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition inline-flex items-center justify-center gap-2"
            >
              <Plus className="size-4" /> Add another item
            </button>
          </div>

          <div>
            <Label className="mb-2 block">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any reference, promise date, etc."
              className="rounded-2xl bg-muted/60 border-input min-h-20"
            />
          </div>
        </Card>

        <div className="sticky bottom-4 flex items-center justify-between bg-primary text-primary-foreground rounded-3xl px-6 py-4 shadow-xl">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">Total</div>
            <div className="text-2xl font-bold">{npr(total)}</div>
          </div>
          <Button
            // type="submit"
            disabled={!valid}
            size="large"
            className="rounded-2xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 px-6 disabled:opacity-50"
          >
            <Check className="size-4" /> Save
          </Button>
        </div>
      </form>
    </div>
  );
}
