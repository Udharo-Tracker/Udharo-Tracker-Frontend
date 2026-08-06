import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Drawer, Skeleton, Alert, Tag, Button } from "antd";
import { ArrowRight, Printer, Receipt, Wallet, Scale } from "lucide-react";
import { useTransaction } from "@/api/transactions.api";
import { useUdharoEntry } from "@/api/udharo.api";
import { Panel } from "@/components/shared/Panel";
import { npr } from "@/lib/currency";
import { formatDate } from "@/utils/date";

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export function TransactionDetailDrawer({ open, id, onClose }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Transaction details"
      destroyOnHidden
      size={760}
    >
      {open && <TransactionDetailBody id={id} />}
    </Drawer>
  );
}

function TransactionDetailBody({ id }: { id: string }) {
  const transaction = useTransaction(id);

  if (transaction.isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (transaction.isError || !transaction.data) {
    return (
      <Alert
        type="error"
        showIcon
        title="Couldn't load this transaction"
        description={
          transaction.error instanceof Error
            ? transaction.error.message
            : "Unknown error"
        }
      />
    );
  }

  return <TransactionVoucher transaction={transaction.data} />;
}

const TYPE_META: Record<
  TransactionType,
  { label: string; icon: typeof Wallet; badgeClassName: string }
> = {
  payment: {
    label: "Payment received",
    icon: Wallet,
    badgeClassName: "bg-success-soft text-success",
  },
  udharo: {
    label: "Udharo entry",
    icon: Receipt,
    badgeClassName: "bg-warning-soft text-warning-foreground",
  },
  opening: {
    label: "Opening balance",
    icon: Scale,
    badgeClassName: "bg-primary-soft text-primary",
  },
};

const PAYMENT_MODE_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  fonepay: "Fonepay",
  nepal_pay: "Nepal Pay",
  bank_transfer: "Bank Transfer",
};

// `type` comes back from the API as a display label (e.g. "Payment"), not
// the lowercase enum the rest of the app filters/keys by.
function normalizeType(type: string): TransactionType | null {
  const lower = type.toLowerCase();
  return lower === "payment" || lower === "udharo" || lower === "opening"
    ? lower
    : null;
}

function TransactionVoucher({ transaction: t }: { transaction: Transaction }) {
  const type = normalizeType(t.type);
  const meta = type ? TYPE_META[type] : null;
  const Icon = meta?.icon ?? Receipt;

  const udharoEntry = useUdharoEntry(
    type === "udharo" && t.udharo_entry ? t.udharo_entry : "",
  );

  // Payment mode/reference/photos now live per-party rather than on a
  // single top-level payment record — flatten them for display.
  const payments = t.parties.flatMap((party) => party.payments);

  return (
    <div className="space-y-5 pt-1">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`size-11 rounded-2xl grid place-items-center ${meta?.badgeClassName ?? "bg-muted text-muted-foreground"}`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              {meta?.label ?? t.type}
            </div>
            <div className="text-2xl font-bold">{npr(t.amount)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {t.status && <Tag className="capitalize">{t.status}</Tag>}
          <Button
            size="small"
            icon={<Printer className="size-3.5" />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel>
          <dl className="space-y-3 text-sm">
            <Row
              label="From"
              value={
                <Link
                  to={`/customers/${t.customer.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {t.customer.name}
                </Link>
              }
            />
            <Row label="Txn number" value={t.txn_number} />
            <Row label="Date" value={formatDate(t.transaction_date)} />
            {type === "payment" && payments[0]?.payment_mode && (
              <Row
                label="Payment mode"
                value={
                  PAYMENT_MODE_LABELS[payments[0].payment_mode] ??
                  payments[0].payment_mode
                }
              />
            )}
            {type === "payment" && payments[0]?.reference && (
              <Row label="Reference no" value={payments[0].reference} />
            )}
            <Row label="Remarks" value={t.remarks || "—"} />
          </dl>
        </Panel>

        <Panel>
          <h3 className="font-semibold text-sm mb-3">Basic details</h3>
          <dl className="space-y-3 text-sm">
            <Row
              label="Status"
              value={<span className="capitalize">{t.status || "—"}</span>}
            />
            <Row label="Recorded by" value={t.recorded_by?.full_name || "—"} />
            <Row label="Balance after" value={npr(t.balance_after)} />
          </dl>
        </Panel>
      </div>

      {type === "payment" && payments.length > 0 && (
        <Panel padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">Payment record</h3>
          </div>
          <div className="divide-y divide-border">
            {payments.map((p, i) => (
              <div key={i} className="p-5">
                <dl className="space-y-3 text-sm">
                  <Row label="Amount" value={npr(p.amount)} />
                  {p.payment_mode && (
                    <Row
                      label="Payment mode"
                      value={
                        PAYMENT_MODE_LABELS[p.payment_mode] ?? p.payment_mode
                      }
                    />
                  )}
                  {p.reference && (
                    <Row label="Reference no" value={p.reference} />
                  )}
                  {p.write_off_amount > 0 && (
                    <Row label="Written off" value={npr(p.write_off_amount)} />
                  )}
                  {p.allocated_from && (
                    <Row
                      label="Allocated from"
                      value={p.allocated_from.txn_number}
                    />
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
            ))}
          </div>
        </Panel>
      )}

      {type === "udharo" && (
        <Panel padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">Items</h3>
            <div className="flex items-center gap-3">
              {udharoEntry.data && (
                <Tag color={udharoEntry.data.is_settled ? "success" : "gold"}>
                  {udharoEntry.data.is_settled ? "Settled" : "Pending"}
                </Tag>
              )}
              {t.udharo_entry && (
                <Link
                  to={`/udharo/${t.udharo_entry}`}
                  className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                >
                  View full record <ArrowRight className="size-3" />
                </Link>
              )}
            </div>
          </div>
          {udharoEntry.isLoading && (
            <div className="p-5">
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          )}
          {udharoEntry.data && (
            <ul className="divide-y divide-border">
              {udharoEntry.data.items.map((item) => (
                <li
                  key={item.id}
                  className="px-5 py-3 flex items-center justify-between text-sm"
                >
                  <span>{item.item_name}</span>
                  <span className="font-semibold">{npr(item.amount)}</span>
                </li>
              ))}
              {udharoEntry.data.items.length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">
                  No items listed.
                </li>
              )}
            </ul>
          )}
        </Panel>
      )}

      {type === "opening" && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Opening balance carried over for {t.customer.name} when they were
            added to the ledger.
          </p>
        </Panel>
      )}

      {t.allocations && t.allocations.length > 0 && (
        <Panel padding="none">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">Applied to</h3>
          </div>
          <ul className="divide-y divide-border">
            {t.allocations.map((a) => (
              <li
                key={a.id}
                className="px-5 py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium">{a.txn_number}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(a.transaction_date)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{npr(a.amount)}</span>
                  {a.write_off_amount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {npr(a.write_off_amount)} written off
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
