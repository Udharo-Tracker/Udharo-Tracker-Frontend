import { App, Modal, Button, Skeleton, Form } from "antd";
import { Check } from "lucide-react";
import { Textarea } from "@/components/shared/Textarea";
import { usePayment, useUpdatePayment } from "@/api/payments.api";
import { npr } from "@/lib/currency";

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export function EditPaymentModal({ open, id, onClose }: Props) {
  const payment = usePayment(id);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Edit payment"
      destroyOnHidden
      width={520}
    >
      {open &&
        (payment.data ? (
          <EditPaymentForm
            key={id}
            id={id}
            initial={payment.data}
            onClose={onClose}
          />
        ) : (
          <Skeleton active paragraph={{ rows: 4 }} />
        ))}
    </Modal>
  );
}

interface EditPaymentFormValues {
  amount: string;
  note?: string;
}

function EditPaymentForm({
  id,
  initial,
  onClose,
}: {
  id: string;
  initial: Payment;
  onClose: () => void;
}) {
  const { message } = App.useApp();
  const updatePayment = useUpdatePayment(id);
  const [form] = Form.useForm<EditPaymentFormValues>();
  const amount = Form.useWatch("amount", form);
  const value = parseFloat(amount ?? initial.amount_paid) || 0;

  const submit = (values: EditPaymentFormValues) => {
    updatePayment.mutate(
      {
        customer_id: initial.customer.id,
        amount_paid: values.amount,
        note: values.note || undefined,
      },
      {
        onSuccess: () => {
          message.success("Payment updated");
          onClose();
        },
        onError: (error) => message.error(error.message),
      },
    );
  };

  return (
    <Form<EditPaymentFormValues>
      form={form}
      layout="vertical"
      onFinish={submit}
      className="pt-2"
      initialValues={{ amount: initial.amount_paid, note: initial.note ?? "" }}
    >
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        From {initial.customer.name}
      </p>

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
          autoFocus
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          className="w-full h-16 rounded-2xl bg-muted/60 border border-input px-5 text-3xl font-bold outline-none focus:ring-2 focus:ring-ring"
        />
      </Form.Item>

      <Form.Item label="Note" name="note">
        <Textarea
          placeholder="e.g. partial payment, salary day…"
          className="rounded-2xl bg-muted/60 border-input min-h-20"
        />
      </Form.Item>

      <Form.Item className="mb-0!">
        <Button
          htmlType="submit"
          loading={updatePayment.isPending}
          size="large"
          className="w-full rounded-2xl h-14 text-base"
        >
          <Check className="size-4" /> Save changes ({npr(value)})
        </Button>
      </Form.Item>
    </Form>
  );
}
