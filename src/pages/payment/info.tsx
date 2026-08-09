import { Link, useNavigate, useParams } from "react-router-dom";
import { App, Skeleton, Alert, Button } from "antd";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Pencil,
  Phone,
  Trash2,
  Wallet,
} from "lucide-react";
import { usePayment, useDeletePayment } from "@/api/payments.api";
import { useEntityModals } from "@/context/entity-modals-context";
import { Panel } from "@/components/shared/Panel";
import { DetailRow } from "@/components/shared/DetailRow";
import { npr } from "@/lib/currency";
import { PAYMENT_MODE_LABELS } from "@/lib/payment";
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
      content:
        "This cannot be undone and will affect the customer's outstanding balance.",
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
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (payment.isError || !payment.data) {
    return (
      <div className="space-y-6">
        <Link
          to="/payments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to payments
        </Link>
        <Alert
          type="error"
          showIcon
          title="Couldn't load this payment"
          description={
            payment.error instanceof Error
              ? payment.error.message
              : "Unknown error"
          }
        />
      </div>
    );
  }

  const p = payment.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-start gap-4">
          <Link to="/payments">
            <Button icon={<ChevronLeft className="size-5" />} />
          </Link>
          <div>
            <Link
              to={`/customers/${p.customer.id}`}
              className="hover:underline"
            >
              <h1 className="text-xl text-foreground! font-semibold">Payments - {p.customer.name}</h1>
            </Link>
            <div className="flex items-center flex-wrap gap-3 mt-1.5">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Wallet className="size-3.5" /> Payment received
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" /> {formatDate(p.created_at)}
              </span>
              {p.customer.phone && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" /> {p.customer.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            icon={<Pencil className="size-4" />}
            onClick={() => openEditPayment(id)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground font-medium hover:text-foreground hover:bg-muted"
          >
            Edit
          </Button>
          <Button
            icon={<Trash2 className="size-4" />}
            danger
            onClick={confirmDelete}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-danger font-medium hover:bg-danger-soft"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel padding="none">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-sm">Payment record</h2>
            </div>
            <div className="p-5">
              <dl className="space-y-3 text-sm">
                <DetailRow label="Amount" value={npr(p.amount_paid)} />
                {p.payment_mode && (
                  <DetailRow
                    label="Payment mode"
                    value={
                      PAYMENT_MODE_LABELS[p.payment_mode] ?? p.payment_mode
                    }
                  />
                )}
                {p.reference && (
                  <DetailRow label="Reference no" value={p.reference} />
                )}
              </dl>
              {p.photos && p.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {p.photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.image}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square rounded-xl overflow-hidden bg-muted"
                    >
                      <img
                        src={photo.image}
                        alt="Payment proof"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-linear-to-br from-success to-success/80 text-success-foreground p-5">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-white/15 grid place-items-center">
                <Wallet className="size-5" />
              </div>
              <div>
                <div className="text-xs opacity-80">Amount paid</div>
                <div className="text-2xl font-bold mt-0.5">
                  {npr(p.amount_paid)}
                </div>
              </div>
            </div>
          </div>

          <Panel>
            <h2 className="font-semibold text-sm mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <DetailRow label="Date" value={formatDate(p.created_at)} />
              <DetailRow label="Note" value={p.note || "—"} />
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
