import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { CustomerCombobox } from "@/components/shared/CustomerCombobox";
import { Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button, Modal } from "antd";
import { Textarea } from "@/components/shared/Textarea";
import { Label } from "@/components/shared/Label";
import { useCreateUdharoEntry } from "@/api/udharo.api";
import { npr } from "@/lib/currency";

interface Props {
  open: boolean;
  customerId?: string;
  onClose: () => void;
}

export function CreateUdharoModal({ open, customerId: preset, onClose }: Props) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Add udharo entry" destroyOnHidden width={560}>
      {open && <CreateUdharoForm preset={preset} onClose={onClose} />}
    </Modal>
  );
}

function CreateUdharoForm({ preset, onClose }: { preset?: string; onClose: () => void }) {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(preset ?? "");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([{ name: "", amount: "" }]);
  const firstAmountRef = useRef<HTMLInputElement>(null);
  const createUdharoEntry = useCreateUdharoEntry();

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
    createUdharoEntry.mutate(
      {
        customer_id: customerId,
        note: note || undefined,
        items: items
          .filter((i) => i.name && parseFloat(i.amount) > 0)
          .map((i) => ({ item_name: i.name, amount: i.amount })),
      },
      {
        onSuccess: () => {
          toast.success("Udharo added", { description: `${npr(total)} recorded` });
          onClose();
          navigate(`/customers/${customerId}`);
        },
        onError: (error) => {
          toast.error("Couldn't add udharo", { description: error.message });
        },
      }
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5 pt-2">
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

      <div className="flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-3.5">
        <div>
          <div className="text-xs uppercase tracking-wider opacity-80">Total</div>
          <div className="text-xl font-bold">{npr(total)}</div>
        </div>
        <Button
          htmlType="submit"
          disabled={!valid}
          loading={createUdharoEntry.isPending}
          size="large"
          className="rounded-2xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-11 px-6 disabled:opacity-50"
        >
          <Check className="size-4" /> Save
        </Button>
      </div>
    </form>
  );
}
