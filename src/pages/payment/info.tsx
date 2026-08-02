import { Link, useNavigate, useParams } from "react-router-dom";
import { App, Card, Skeleton, Alert } from "antd";
import { ArrowLeft, Pencil, Trash2, Wallet } from "lucide-react";
import { usePayment, useDeletePayment } from "@/api/payments.api";
import { useEntityModals } from "@/context/entity-modals-context";
import { npr } from "@/lib/currency";
import { formatDate } from "@/utils/date";

export function PaymentDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { openEditPayment } = useEntityModals();
  const payment = usePayment(id);
  const deletePayment = useDeletePayment();

  const confirmDelete = () => {
    modal.confirm({
      title: "Delete this payment?",
      content: "This cannot be undone and will affect the customer's outstanding balance.",
      okText: "Delete",
      okType: "danger",
      onOk: () =>
        deletePayment.mutate(id, {
          onSuccess: () => {
            message.success("Payment deleted");
            navigate("/payments");
          },
          onError: (error) => message.error(error.message),
        }),
    });
  };

  if (payment.isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (payment.isError || !payment.data) {
    return (
      <div className="max-w-2xl space-y-6">
        <Link to="/payments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to payments
        </Link>
        <Alert
          type="error"
          showIcon
          title="Couldn't load this payment"
          description={payment.error instanceof Error ? payment.error.message : "Unknown error"}
        />
      </div>
    );
  }

  const p = payment.data;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/payments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to payments
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => openEditPayment(id)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground font-medium hover:text-foreground"
          >
            <Pencil className="size-4" /> Edit
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="inline-flex items-center gap-2 text-sm text-danger font-medium hover:underline"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      </div>

      <Card className="p-6 md:p-8 rounded-3xl border-none shadow-sm bg-gradient-to-br from-success to-success/80 text-success-foreground">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-success-foreground/15 grid place-items-center">
            <Wallet className="size-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">Payment received</div>
            <div className="text-4xl font-bold mt-1">{npr(p.amount_paid)}</div>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm divide-y">
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Customer</span>
          <Link to={`/customers/${p.customer.id}`} className="font-medium text-primary hover:underline">
            {p.customer.name}
          </Link>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="font-medium">{formatDate(p.created_at)}</span>
        </div>
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground shrink-0">Note</span>
          <span className="font-medium text-right">{p.note || "—"}</span>
        </div>
      </Card>
    </div>
  );
}
