import { Plus, X, Check } from "lucide-react";
import { App, Button, Modal, Skeleton, Form } from "antd";
import { Textarea } from "@/components/shared/Textarea";
import { Label } from "@/components/shared/Label";
import { useUdharoEntry, useUpdateUdharoEntry } from "@/api/udharo.api";
import { npr } from "@/lib/currency";

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export function EditUdharoModal({ open, id, onClose }: Props) {
  const entry = useUdharoEntry(id);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Edit udharo entry"
      destroyOnHidden
      width={560}
    >
      {open &&
        (entry.data ? (
          <EditUdharoForm
            key={id}
            id={id}
            initial={entry.data}
            onClose={onClose}
          />
        ) : (
          <Skeleton active paragraph={{ rows: 6 }} />
        ))}
    </Modal>
  );
}

interface UdharoItem {
  name: string;
  amount: string;
}

interface UdharoFormValues {
  items: UdharoItem[];
  note?: string;
}

function EditUdharoForm({
  id,
  initial,
  onClose,
}: {
  id: string;
  initial: UdharoEntry;
  onClose: () => void;
}) {
  const { message } = App.useApp();
  const updateUdharoEntry = useUpdateUdharoEntry(id);
  const [form] = Form.useForm<UdharoFormValues>();

  const items = Form.useWatch("items", form) ?? [];
  const total = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const submit = (values: UdharoFormValues) => {
    if (total <= 0) {
      message.warning("Add at least one item with an amount");
      return;
    }
    updateUdharoEntry.mutate(
      {
        customer_id: initial.customer.id,
        note: values.note || undefined,
        items: values.items
          .filter((i) => i.name && parseFloat(i.amount) > 0)
          .map((i) => ({ item_name: i.name, amount: i.amount })),
      },
      {
        onSuccess: () => {
          message.success("Udharo entry updated");
          onClose();
        },
        onError: (error) => message.error(error.message),
      },
    );
  };

  return (
    <Form<UdharoFormValues>
      form={form}
      layout="vertical"
      onFinish={submit}
      className="pt-2"
      initialValues={{
        items: initial.items.length
          ? initial.items.map((i) => ({ name: i.item_name, amount: i.amount }))
          : [{ name: "", amount: "" }],
        note: initial.note ?? "",
      }}
    >
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        For {initial.customer.name}
      </p>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <span className="text-xs text-muted-foreground">
                {fields.length} item{fields.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.key} className="flex gap-2">
                  <Form.Item
                    name={[field.name, "name"]}
                    className="mb-0! flex-1"
                  >
                    <input
                      placeholder="Item name"
                      className="h-12 rounded-2xl bg-muted/60 border border-input w-full px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "amount"]}
                    className="mb-0!"
                    normalize={(v) => v?.replace(/[^0-9.]/g, "") ?? v}
                  >
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Amount"
                      className="h-12 rounded-2xl bg-muted/60 border border-input w-32 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Form.Item>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(field.name)}
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
              onClick={() => add({ name: "", amount: "" })}
              className="mt-3 w-full h-12 rounded-2xl border-2 border-dashed border-input text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition inline-flex items-center justify-center gap-2"
            >
              <Plus className="size-4" /> Add another item
            </button>
          </div>
        )}
      </Form.List>

      <Form.Item label="Note" name="note">
        <Textarea
          placeholder="Any reference, promise date, etc."
          className="rounded-2xl bg-muted/60 border-input min-h-20"
        />
      </Form.Item>

      <div className="flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-3.5">
        <div>
          <div className="text-xs uppercase tracking-wider opacity-80">
            Total
          </div>
          <div className="text-xl font-bold">{npr(total)}</div>
        </div>
        <Button
          htmlType="submit"
          loading={updateUdharoEntry.isPending}
          size="large"
          className="rounded-2xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-11 px-6"
        >
          <Check className="size-4" /> Save changes
        </Button>
      </div>
    </Form>
  );
}
