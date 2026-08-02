import { Link, useNavigate, useParams } from "react-router-dom";
import { App, Card, Skeleton, Alert } from "antd";
import { ArrowLeft, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useUdharoEntry, useDeleteUdharoEntry } from "@/api/udharo.api";
import { useEntityModals } from "@/context/entity-modals-context";
import { npr } from "@/lib/currency";
import { formatDate } from "@/utils/date";

export function UdharoDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { openEditUdharo } = useEntityModals();
  const entry = useUdharoEntry(id);
  const deleteUdharoEntry = useDeleteUdharoEntry();

  const confirmDelete = () => {
    modal.confirm({
      title: "Delete this udharo entry?",
      content: "This cannot be undone and will affect the customer's outstanding balance.",
      okText: "Delete",
      okType: "danger",
      onOk: () =>
        deleteUdharoEntry.mutate(id, {
          onSuccess: () => {
            message.success("Udharo entry deleted");
            navigate("/udharo");
          },
          onError: (error) => message.error(error.message),
        }),
    });
  };

  if (entry.isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (entry.isError || !entry.data) {
    return (
      <div className="max-w-2xl space-y-6">
        <Link to="/udharo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to udharo entries
        </Link>
        <Alert
          type="error"
          showIcon
          title="Couldn't load this udharo entry"
          description={entry.error instanceof Error ? entry.error.message : "Unknown error"}
        />
      </div>
    );
  }

  const e = entry.data;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/udharo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to udharo entries
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => openEditUdharo(id)}
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

      <Card className="p-6 md:p-8 rounded-3xl border-none shadow-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary-foreground/15 grid place-items-center">
              <PlusCircle className="size-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">Udharo entry</div>
              <div className="text-4xl font-bold mt-1">{npr(e.total_amount)}</div>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              e.is_settled ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
            }`}
          >
            {e.is_settled ? "Settled" : "Pending"}
          </span>
        </div>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm divide-y">
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Customer</span>
          <Link to={`/customers/${e.customer.id}`} className="font-medium text-primary hover:underline">
            {e.customer.name}
          </Link>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="font-medium">{formatDate(e.created_at)}</span>
        </div>
        {e.settled_at && (
          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Settled on</span>
            <span className="font-medium">{formatDate(e.settled_at)}</span>
          </div>
        )}
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground shrink-0">Note</span>
          <span className="font-medium text-right">{e.note || "—"}</span>
        </div>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Items</h2>
        </div>
        <ul className="divide-y">
          {e.items.map((it) => (
            <li key={it.id} className="px-6 py-3 flex items-center justify-between text-sm">
              <span>{it.item_name}</span>
              <span className="font-semibold">{npr(it.amount)}</span>
            </li>
          ))}
          {e.items.length === 0 && (
            <li className="p-8 text-center text-muted-foreground text-sm">No items listed.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
