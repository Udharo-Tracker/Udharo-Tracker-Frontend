import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { App, Modal, Button, Form } from "antd";
import { CustomerCombobox } from "@/components/shared/CustomerCombobox";
import { Check } from "lucide-react";
import { Textarea } from "@/components/shared/Textarea";
import { useCreatePayment } from "@/api/payments.api";
import { useLedgerSummary } from "@/api/ledger.api";
import { npr } from "@/lib/currency";

interface Props {
  open: boolean;
  customerId?: string;
  onClose: () => void;
}

export function CreatePaymentModal({
  open,
  customerId: preset,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Record payment"
      destroyOnHidden
      width={520}
    >
      {open && <CreatePaymentForm preset={preset} onClose={onClose} />}
    </Modal>
  );
}

interface PaymentFormValues {
  customerId: string;
  amount: string;
  note?: string;
}

function CreatePaymentForm({
  preset,
  onClose,
}: {
  preset?: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const createPayment = useCreatePayment();
  const ledgerSummary = useLedgerSummary();
  const [form] = Form.useForm<PaymentFormValues>();
  const amountRef = useRef<HTMLInputElement>(null);

  const customerId = Form.useWatch("customerId", form);
  const amount = Form.useWatch("amount", form);
  const cust = ledgerSummary.data?.customers_summary.find(
    (c) => c.id === customerId,
  );
  const value = parseFloat(amount ?? "") || 0;

  useEffect(() => {
    if (customerId) amountRef.current?.focus();
  }, [customerId]);

  const submit = (values: PaymentFormValues) => {
    createPayment.mutate(
      {
        customer_id: values.customerId,
        amount_paid: values.amount,
        note: values.note || undefined,
      },
      {
        onSuccess: () => {
          message.success(
            `${npr(value)} received${cust ? ` from ${cust.name}` : ""}`,
          );
          onClose();
          navigate(`/customers/${values.customerId}`);
        },
        onError: (error) => message.error(error.message),
      },
    );
  };

  return (
    <Form<PaymentFormValues>
      form={form}
      layout="vertical"
      onFinish={submit}
      className="pt-2"
      initialValues={{ customerId: preset ?? "", amount: "", note: "" }}
    >
      <Form.Item
        label="Customer"
        name="customerId"
        rules={[{ required: true, message: "Please select a customer" }]}
      >
        <CustomerCombobox autoFocus={!preset} />
      </Form.Item>

      {cust && (
        <div className="rounded-2xl bg-primary-soft p-4 flex items-center justify-between mb-5">
          <span className="text-sm text-primary font-medium">
            Current outstanding
          </span>
          <span className="text-lg font-bold text-primary">
            {npr(cust.outstanding_balance)}
          </span>
        </div>
      )}

      <Form.Item
        label="Amount received"
        name="amount"
        normalize={(v) => v?.replace(/[^0-9.]/g, "") ?? v}
        rules={[
          { required: true, message: "Please enter an amount" },
          {
            validator: async (_, v) => {
              if (!v || parseFloat(v) <= 0)
                return Promise.reject(
                  new Error("Amount must be greater than 0"),
                );
            },
          },
        ]}
      >
        <input
          ref={amountRef}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          className="w-full h-16 rounded-2xl bg-muted/60 border border-input px-5 text-3xl font-bold outline-none focus:ring-2 focus:ring-ring"
        />
      </Form.Item>
      {cust && value > 0 && (
        <div className="-mt-3 mb-5 text-xs text-muted-foreground">
          New balance:{" "}
          <span className="font-semibold text-foreground">
            {npr(Math.max(0, cust.outstanding_balance - value))}
          </span>
        </div>
      )}

      <Form.Item label="Note" name="note">
        <Textarea
          placeholder="e.g. partial payment, salary day…"
          className="rounded-2xl bg-muted/60 border-input min-h-20"
        />
      </Form.Item>

      <Form.Item className="mb-0!">
        <Button
          htmlType="submit"
          loading={createPayment.isPending}
          size="large"
          className="w-full rounded-2xl h-14 text-base"
        >
          <Check className="size-4" /> Confirm payment
        </Button>
      </Form.Item>
    </Form>
  );
}
