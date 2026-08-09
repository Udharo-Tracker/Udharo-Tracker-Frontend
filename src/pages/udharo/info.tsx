import { Link, useNavigate, useParams } from "react-router-dom";
import { App, Skeleton, Alert, Button } from "antd";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Pencil,
  Phone,
  Receipt,
  Trash2,
} from "lucide-react";
import { useUdharoEntry, useDeleteUdharoEntry } from "@/api/udharo.api";
import { useEntityModals } from "@/context/entity-modals-context";
import { Panel } from "@/components/shared/Panel";
import { DetailRow } from "@/components/shared/DetailRow";
import { StatusTag } from "@/components/shared/StatusTag";
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
      content:
        "This cannot be undone and will affect the customer's outstanding balance.",
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
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (entry.isError || !entry.data) {
    return (
      <div className="space-y-6">
        <Link
          to="/udharo"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to udharo entries
        </Link>
        <Alert
          type="error"
          showIcon
          title="Couldn't load this udharo entry"
          description={
            entry.error instanceof Error ? entry.error.message : "Unknown error"
          }
        />
      </div>
    );
  }

  const e = entry.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-start gap-4">
          <Link to="/udharo">
            <Button icon={<ChevronLeft className="size-5" />} />
          </Link>
          <div>
            <Link
              to={`/customers/${e.customer.id}`}
              className="hover:underline"
            >
              <h1 className="text-xl text-foreground! font-semibold">Udharo Entries - {e.customer.name}</h1>
            </Link>
            <div className="flex items-center flex-wrap gap-3 mt-1.5">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Receipt className="size-3.5" /> Udharo entry
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" /> {formatDate(e.created_at)}
              </span>
              {e.customer.phone && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" /> {e.customer.phone}
                </span>
              )}
              <StatusTag tone={e.is_settled ? "success" : "warning"}>
                {e.is_settled ? "Settled" : "Pending"}
              </StatusTag>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            icon={<Pencil className="size-4" />}
            onClick={() => openEditUdharo(id)}
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-sm">Items</h2>
              <span className="text-xs text-muted-foreground">
                {e.items.length} item{e.items.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {e.items.map((it) => (
                <li
                  key={it.id}
                  className="px-5 py-3.5 flex items-center justify-between text-sm"
                >
                  <span>{it.item_name}</span>
                  <span className="font-semibold">{npr(it.amount)}</span>
                </li>
              ))}
              {e.items.length === 0 && (
                <li className="p-8 text-center text-muted-foreground text-sm">
                  No items listed.
                </li>
              )}
            </ul>
            {e.items.length > 0 && (
              <div className="px-5 py-3.5 flex items-center justify-between text-sm bg-muted/50">
                <span className="font-semibold">Total</span>
                <span className="font-bold">{npr(e.total_amount)}</span>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground p-5">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-white/15 grid place-items-center">
                <Receipt className="size-5" />
              </div>
              <div>
                <div className="text-xs opacity-80">Total udharo</div>
                <div className="text-2xl font-bold mt-0.5">
                  {npr(e.total_amount)}
                </div>
              </div>
            </div>
          </div>

          <Panel>
            <h2 className="font-semibold text-sm mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <DetailRow label="Date" value={formatDate(e.created_at)} />
              {e.settled_at && (
                <DetailRow
                  label="Settled on"
                  value={formatDate(e.settled_at)}
                />
              )}
              <DetailRow label="Note" value={e.note || "—"} />
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
