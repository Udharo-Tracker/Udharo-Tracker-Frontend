import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Skeleton, Alert, App, Table, Button, Tabs, Modal, Empty } from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowLeft,
  Phone,
  Pencil,
  Trash2,
  Gauge,
  Receipt,
  Wallet,
  ChevronLeft,
  Send,
  CalendarDays,
  Scale,
  Copy,
  PlusCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCustomerTransactions } from "@/api/transactions.api";
import {
  useCustomer,
  useCustomerCreditScore,
  useCustomerCreditScoreHistory,
  useDeleteCustomer,
} from "@/api/customers.api";
import {
  useCustomerReminders,
  useCreateCustomerReminder,
} from "@/api/reminders.api";
import { ApiError } from "@/api/client";
import { Panel } from "@/components/shared/Panel";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { Textarea } from "@/components/shared/Textarea";
import { Label } from "@/components/shared/Label";
import { useEntityModals } from "@/context/entity-modals-context";
import { npr } from "@/lib/currency";
import { formatDate, formatDateOnly } from "@/utils/date";

export function CustomerDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const {
    openEditCustomer,
    openCreatePayment,
    openCreateUdharo,
    openTransactionDetail,
  } = useEntityModals();
  const customer = useCustomer(id);
  const customerTransactions = useCustomerTransactions(id);
  const creditScore = useCustomerCreditScore(id);
  const creditScoreHistory = useCustomerCreditScoreHistory(id);
  const deleteCustomer = useDeleteCustomer();
  const reminders = useCustomerReminders(id);
  const createReminder = useCreateCustomerReminder(id);
  const [reminderNote, setReminderNote] = useState("");
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  const confirmDelete = () => {
    modal.confirm({
      title: "Delete this customer?",
      content:
        "This cannot be undone. Their udharo and payment history will remain but will no longer be linked to a customer profile.",
      okText: "Delete",
      okType: "danger",
      onOk: () =>
        deleteCustomer.mutate(id, {
          onSuccess: () => {
            message.success("Customer deleted");
            navigate("/customers");
          },
          onError: (error) => message.error(error.message),
        }),
    });
  };

  const creditScoreNotCalculated =
    creditScore.isError &&
    creditScore.error instanceof ApiError &&
    creditScore.error.status === 404;

  if (customer.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (customer.isError || !customer.data) {
    return (
      <div className="space-y-6">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to customers
        </Link>
        <Alert
          type="error"
          showIcon
          title="Couldn't load this customer"
          description={
            customer.error instanceof Error
              ? customer.error.message
              : "Unknown error"
          }
        />
      </div>
    );
  }

  const customerData = customer.data;

  // The list endpoint already returns running debit/credit columns and
  // cumulative closing balances computed server-side (see TransactionList
  // in the API schema) — just order newest-first for display.
  const ledgerRows: TransactionListItem[] = [
    ...(customerTransactions.data ?? []),
  ].sort(
    (a, b) =>
      new Date(b.transaction_date).getTime() -
      new Date(a.transaction_date).getTime(),
  );

  const summary = {
    total_udharo: Number(customerData.ledger_summary.total_udharo) || 0,
    total_paid: Number(customerData.ledger_summary.total_paid) || 0,
    outstanding_balance:
      Number(customerData.ledger_summary.outstanding_balance) || 0,
  };

  const columns: TableColumnsType<TransactionListItem> = [
    {
      title: "Txn #",
      dataIndex: "txn_number",
      key: "txn_number",
      render: (txnNumber: string) => (
        <span className="text-muted-foreground">{txnNumber}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "transaction_date",
      key: "date",
      render: (date: string) => (
        <span className="text-muted-foreground">{formatDate(date)}</span>
      ),
    },
    {
      title: "Detail",
      key: "detail",
      render: (_, t) => (
        <span className="inline-flex items-center gap-2">
          <span
            className={`size-1.5 rounded-full ${
              t.type === "udharo"
                ? "bg-warning"
                : t.type === "payment"
                  ? "bg-success"
                  : "bg-muted-foreground"
            }`}
          />
          {t.title}
        </span>
      ),
    },
    {
      title: "Debit",
      dataIndex: "transaction_debit",
      key: "debit",
      align: "right",
      render: (debit: string) => (Number(debit) > 0 ? npr(debit) : "—"),
    },
    {
      title: "Credit",
      dataIndex: "transaction_credit",
      key: "credit",
      align: "right",
      render: (credit: string) =>
        Number(credit) > 0 ? (
          <span className="text-success">{npr(credit)}</span>
        ) : (
          "—"
        ),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, t) => {
        const debit = Number(t.closing_balance_debit) || 0;
        const credit = Number(t.closing_balance_credit) || 0;
        const net = debit - credit;
        return (
          <span className="font-semibold">
            {npr(Math.abs(net))}
            {net < 0 && (
              <span className="ml-1 text-xs font-normal text-success">Cr</span>
            )}
          </span>
        );
      },
    },
  ];

  const reminderColumns: TableColumnsType<ReminderLog> = [
    {
      title: "Sent",
      dataIndex: "sent_at",
      key: "sent_at",
      render: (sentAt: string) => (
        <span className="text-muted-foreground">{formatDate(sentAt)}</span>
      ),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note: string) => note || "Reminder sent",
    },
    {
      title: "Outstanding balance",
      dataIndex: "outstanding_balance",
      key: "outstanding_balance",
      align: "right",
      render: (balance: string) => (
        <span className="font-semibold">{npr(balance)}</span>
      ),
    },
  ];

  const submitReminder = (e: FormEvent) => {
    e.preventDefault();
    createReminder.mutate(
      { note: reminderNote || undefined },
      {
        onSuccess: () => {
          message.success("Reminder logged");
          setReminderNote("");
          setReminderModalOpen(false);
        },
        onError: (error) => message.error(error.message),
      },
    );
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    message.success(`${label} copied`);
  };

  const creditLimit = Number(customerData.credit_limit) || 0;
  const usedPct =
    creditLimit > 0
      ? Math.min(
          100,
          Math.round((summary.outstanding_balance / creditLimit) * 100),
        )
      : 0;
  const usedFillClass =
    usedPct >= 90 ? "bg-danger" : usedPct >= 60 ? "bg-warning" : "bg-success";

  const overviewBanner = (
    <div className="space-y-3">
      <div className="rounded-lg bg-linear-to-br from-sidebar via-sidebar to-sidebar/80 text-sidebar-foreground p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 text-xs opacity-80">
              <span className="size-2 rounded-full bg-success" />
              To receive
            </div>
            <div className="text-2xl font-bold mt-2">
              {npr(summary.outstanding_balance)}
            </div>
          </div>
          <div className="text-right text-xs opacity-80">
            {usedPct}% Used
            <div className="text-sm font-medium opacity-100 mt-0.5">
              {npr(creditLimit)} Credit Limit
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div
            className={`h-full rounded-full ${usedFillClass}`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted p-4">
          <div className="text-xs text-muted-foreground">Credit Limit</div>
          <div className="font-semibold mt-1">{npr(creditLimit)}</div>
        </div>
        <div className="rounded-lg bg-muted p-4">
          <div className="text-xs text-muted-foreground">Credit Term</div>
          <div className="font-semibold mt-1">
            {customerData.credit_term_days} Days
          </div>
        </div>
      </div>
    </div>
  );

  const customerDetailsPanel = (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm">Customer Details</h2>
        <Button
          type="text"
          size="small"
          icon={<Copy className="size-3.5" />}
          onClick={() =>
            copyToClipboard(
              [customerData.name, customerData.phone]
                .filter(Boolean)
                .join(" · "),
              "Customer details",
            )
          }
        />
      </div>
      <dl className="space-y-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Full Name</dt>
          <dd className="font-medium text-right">{customerData.name}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Phone Number</dt>
          <dd className="font-medium text-right inline-flex items-center gap-1.5">
            {customerData.phone || "—"}
            {customerData.phone && (
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(customerData.phone as string, "Phone number")
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3.5" />
              </button>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-medium text-right inline-flex items-center gap-1.5 min-w-0">
            <span className="truncate">{customerData.email || "—"}</span>
            {customerData.email && (
              <button
                type="button"
                onClick={() => copyToClipboard(customerData.email, "Email")}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <Copy className="size-3.5" />
              </button>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Address</dt>
          <dd className="font-medium text-right">
            {customerData.address || "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Loyalty Discount</dt>
          <dd className="font-medium text-right">
            {customerData.loyalty_discount}%
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Joined On</dt>
          <dd className="font-medium text-right">
            {formatDateOnly(customerData.created_at)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Risk Level</dt>
          <dd>
            {creditScore.data ? (
              <RiskBadge risk={creditScore.data.risk_level} />
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
    </Panel>
  );

  const profileTab = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditScore.isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Credit score"
              value={
                creditScoreNotCalculated || !creditScore.data
                  ? "—"
                  : `${creditScore.data.score} / 100`
              }
              icon={Gauge}
              tint="primary"
            />
          )}
          <StatCard
            label="Outstanding balance"
            value={npr(summary.outstanding_balance)}
            icon={Scale}
            tint="danger"
          />
          <StatCard
            label="Total udharo"
            value={npr(summary.total_udharo)}
            icon={Receipt}
            tint="warning"
          />
          <StatCard
            label="Total paid"
            value={npr(summary.total_paid)}
            icon={Wallet}
            tint="success"
          />
        </div>

        <Panel>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Credit score history</h2>
            {creditScore.data && (
              <span className="text-xs text-muted-foreground">
                Latest: {creditScore.data.score} / 100
              </span>
            )}
          </div>
          {creditScoreHistory.isLoading && (
            <Skeleton active paragraph={{ rows: 4 }} />
          )}
          {creditScoreHistory.isError && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Couldn't load credit score history.
            </div>
          )}
          {creditScoreHistory.data && creditScoreHistory.data.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No credit score history yet.
            </div>
          )}
          {creditScoreHistory.data && creditScoreHistory.data.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[...creditScoreHistory.data].sort(
                    (a, b) =>
                      new Date(a.calculated_at).getTime() -
                      new Date(b.calculated_at).getTime(),
                  )}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="calculated_at"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    labelFormatter={(v) => (v ? formatDate(v as string) : "")}
                    formatter={(value) => [`${value} / 100`, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fill: "var(--primary)",
                      strokeWidth: 2,
                      stroke: "var(--card)",
                    }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--card)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <div className="space-y-6">
        {creditScore.isLoading ? (
          <div className="h-32 rounded-3xl bg-muted animate-pulse" />
        ) : (
          overviewBanner
        )}
        {customerDetailsPanel}
      </div>
    </div>
  );

  const transactionsTab = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base">Credit statement</h2>
        <span className="text-xs text-muted-foreground">Running balance</span>
      </div>
      {customerTransactions.isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load transactions"
          description={
            customerTransactions.error instanceof Error
              ? customerTransactions.error.message
              : "Unknown error"
          }
        />
      )}
      <Panel padding="none">
        {" "}
        <Table<TransactionListItem>
          columns={columns}
          dataSource={ledgerRows}
          loading={customerTransactions.isLoading}
          rowKey="id"
          size="middle"
          scroll={{ x: true }}
          onRow={(record) => ({
            onClick: () => openTransactionDetail(record.id),
            className: "cursor-pointer",
          })}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{
            emptyText: (
              <Empty
                description={
                  <div>
                    <p className="text-base font-bold text-foreground">
                      No transaction found
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Create a new transaction or import a new data.{" "}
                    </p>
                  </div>
                }
              />
            ),
          }}
        />
      </Panel>
    </div>
  );

  const remindersTab = (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className=" flex items-center justify-between">
          <h2 className="font-semibold text-base">Reminder history</h2>
          <Button
            type="primary"
            icon={<Send className="size-3.5" />}
            onClick={() => setReminderModalOpen(true)}
          >
            Log reminder
          </Button>
        </div>
        {reminders.isLoading && (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        )}
        {reminders.isError && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Couldn't load reminders.
          </div>
        )}
        {reminders.data && (
          <Panel padding="none">
            <Table<ReminderLog>
              columns={reminderColumns}
              dataSource={reminders.data}
              rowKey="id"
              size="middle"
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      <div>
                        <p className="text-base font-bold text-foreground">
                          No SMS Logs found
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Records will appear here once available.
                        </p>
                      </div>
                    }
                  />
                ),
              }}
            />
          </Panel>
        )}
      </div>

      <Modal
        title="Log a reminder"
        open={reminderModalOpen}
        onCancel={() => setReminderModalOpen(false)}
        footer={null}
        centered
      >
        <form onSubmit={submitReminder} className="space-y-4 pt-2">
          <div>
            <Label className="mb-2 block">Note (optional)</Label>
            <Textarea
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              placeholder="e.g. called, promised to pay Friday…"
              className="rounded-2xl bg-muted/60 border-input min-h-20"
              autoFocus
            />
          </div>
          <Button
            htmlType="submit"
            type="primary"
            loading={createReminder.isPending}
            block
            className="rounded-xl"
            icon={<Send className="size-4" />}
          >
            Log reminder
          </Button>
        </form>
      </Modal>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-start gap-4">
          <Link
            to="/customers"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Button icon={<ChevronLeft className="size-6 text-gray-100" />} />
          </Link>{" "}
          <div>
            <h1 className="text-xl font-semibold">{customerData.name}</h1>
            <div className="flex items-center flex-wrap gap-3 mt-1.5">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" /> Joined{" "}
                {formatDateOnly(customerData.created_at)}
              </span>
              {customerData.phone && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" /> {customerData.phone}
                </span>
              )}
              {creditScore.data && (
                <RiskBadge risk={creditScore.data.risk_level} />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            danger
            icon={<PlusCircle className="size-4" />}
            onClick={() => openCreateUdharo(id)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground font-medium hover:text-foreground hover:bg-muted"
          >
            Add udharo
          </Button>
          <Button
            type="primary"
            icon={<Wallet className="size-4" />}
            onClick={() => openCreatePayment(id)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground font-medium hover:text-foreground hover:bg-muted"
          >
            Add payment
          </Button>
          <Button
            icon={<Pencil className="size-4" />}
            onClick={() => openEditCustomer(id)}
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

      <Tabs
        defaultActiveKey="profile"
        items={[
          { key: "profile", label: "Profile", children: profileTab },
          {
            key: "transactions",
            label: "Transactions",
            children: transactionsTab,
          },
          { key: "reminders", label: "Reminders", children: remindersTab },
        ]}
      />
    </div>
  );
}
