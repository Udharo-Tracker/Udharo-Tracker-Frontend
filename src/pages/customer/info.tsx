import { Link, useNavigate, useParams } from "react-router-dom";
import { Skeleton, Alert, App, Table, Button } from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowLeft,
  Phone,
  BellRing,
  Pencil,
  Trash2,
  Gauge,
  Receipt,
  Wallet,
  ChevronLeft,
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
import { useCustomerStatement } from "@/api/statement.api";
import {
  useCustomerCreditScore,
  useCustomerCreditScoreHistory,
  useDeleteCustomer,
} from "@/api/customers.api";
import { ApiError } from "@/api/client";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { Panel } from "@/components/shared/Panel";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { useEntityModals } from "@/context/entity-modals-context";
import { npr } from "@/lib/currency";
import { formatDate } from "@/utils/date";
import type { StatementTransaction } from "@/types/statement";

export function CustomerDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { openEditCustomer } = useEntityModals();
  const statement = useCustomerStatement(id);
  const creditScore = useCustomerCreditScore(id);
  const creditScoreHistory = useCustomerCreditScoreHistory(id);
  const deleteCustomer = useDeleteCustomer();

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

  if (statement.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (statement.isError || !statement.data) {
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
            statement.error instanceof Error
              ? statement.error.message
              : "Unknown error"
          }
        />
      </div>
    );
  }

  const { customer, summary, transactions } = statement.data;

  const columns: TableColumnsType<StatementTransaction> = [
    {
      title: "Date",
      dataIndex: "date",
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
            className={`size-1.5 rounded-full ${t.type === "udharo" ? "bg-warning" : "bg-success"}`}
          />
          {t.note ||
            (t.type === "udharo" ? "Udharo entry" : "Payment received")}
        </span>
      ),
    },
    {
      title: "Udharo",
      dataIndex: "amount",
      key: "udharo",
      align: "right",
      render: (amount: number, t) => (t.type === "udharo" ? npr(amount) : "—"),
    },
    {
      title: "Payment",
      dataIndex: "amount",
      key: "payment",
      align: "right",
      render: (amount: number, t) =>
        t.type === "payment" ? (
          <span className="text-success">{npr(amount)}</span>
        ) : (
          "—"
        ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right",
      render: (balance: number) => (
        <span className="font-semibold">{npr(balance)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 ">
        {" "}
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {" "}
          <Button icon={<ChevronLeft className="size-6 text-gray-100" />} />
          
        </Link>
        <div className="flex items-center gap-1">
          <Button type="primary" icon={<BellRing className="size-4" />}>
            <Link
              to={`/customers/${id}/reminders`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-primary font-medium hover:bg-primary-soft"
            >
              Reminders
            </Link>
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
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <CustomerAvatar name={customer.name} size="lg" />
          <div>
            <h1 className="text-xl font-semibold">{customer.name}</h1>
            <div className="flex items-center flex-wrap gap-3 mt-1.5">
              {customer.phone && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" /> {customer.phone}
                </span>
              )}
              {creditScore.data && (
                <RiskBadge risk={creditScore.data.risk_level} />
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Outstanding balance
          </div>
          <div className="text-3xl font-bold mt-1">
            {npr(summary.outstanding_balance)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <br />

      <Panel padding="none">
        <div className="px-2 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Credit statement</h2>
          <span className="text-xs text-muted-foreground">Running balance</span>
        </div>
        <Table<StatementTransaction>
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{ emptyText: "No transactions yet." }}
        />
      </Panel>
    </div>
  );
}
