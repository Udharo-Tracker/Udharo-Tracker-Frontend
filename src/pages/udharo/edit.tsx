import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { App, Button, Modal, Skeleton } from "antd";
import { Textarea } from "@/components/shared/Textarea";
import { Label } from "@/components/shared/Label";
import { useUdharoEntry, useUpdateUdharoEntry } from "@/api/udharo.api";
import { npr } from "@/lib/currency";
import type { UdharoEntry } from "@/types/udharo";

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export function EditUdharoModal({ open, id, onClose }: Props) {
  const entry = useUdharoEntry(id);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Edit udharo entry" destroyOnHidden width={560}>
      {open &&
        (entry.data ? (
          <EditUdharoForm key={id} id={id} initial={entry.data} onClose={onClose} />
        ) : (
          <Skeleton active paragraph={{ rows: 6 }} />
        ))}
    </Modal>
  );
}

function EditUdharoForm({ id, initial, onClose }: { id: string; initial: UdharoEntry; onClose: () => void }) {
  const { message } = App.useApp();
  const updateUdharoEntry = useUpdateUdharoEntry(id);

  const [note, setNote] = useState(initial.note ?? "");
  const [items, setItems] = useState(
    initial.items.length
      ? initial.items.map((i) => ({ name: i.item_name, amount: i.amount }))
      : [{ name: "", amount: "" }]
  );

  const total = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const valid = total > 0;

  const addItem = () => setItems((s) => [...s, { name: "", amount: "" }]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    updateUdharoEntry.mutate(
      {
        customer_id: initial.customer.id,
        note: note || undefined,
        items: items
          .filter((i) => i.name && parseFloat(i.amount) > 0)
          .map((i) => ({ item_name: i.name, amount: i.amount })),
      },
      {
        onSuccess: () => {
          message.success("Udharo entry updated");
          onClose();
        },
        onError: (error) => message.error(error.message),
      }
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5 pt-2">
      <p className="text-sm text-muted-foreground -mt-2">For {initial.customer.name}</p>
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
          loading={updateUdharoEntry.isPending}
          size="large"
          className="rounded-2xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-11 px-6 disabled:opacity-50"
        >
          <Check className="size-4" /> Save changes
        </Button>
      </div>
    </form>
  );
}
