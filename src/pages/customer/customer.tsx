import { Link, useParams } from "react-router-dom";
import { Card, Skeleton, Alert } from "antd";
import { ArrowLeft, Phone, BellRing } from "lucide-react";
import { useCustomerStatement } from "@/api/statement.api";
import { useCustomerCreditScore } from "@/api/customers.api";
import { ApiError } from "@/api/client";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { npr } from "@/lib/currency";

export function CustomerDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const statement = useCustomerStatement(id);
  const creditScore = useCustomerCreditScore(id);

  const creditScoreNotCalculated = creditScore.isError && creditScore.error instanceof ApiError && creditScore.error.status === 404;

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
        <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to customers
        </Link>
        <Alert
          type="error"
          showIcon
          title="Couldn't load this customer"
          description={statement.error instanceof Error ? statement.error.message : "Unknown error"}
        />
      </div>
    );
  }

  const { customer, summary, transactions } = statement.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to customers
        </Link>
        <Link
          to={`/customers/${id}/reminders`}
          className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
        >
          <BellRing className="size-4" /> Reminders
        </Link>
      </div>

      <Card className="p-6 md:p-8 rounded-3xl border-none shadow-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-primary-foreground/15 grid place-items-center text-xl font-bold">
              {customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                  <Phone className="size-3.5" /> {customer.phone}
                </div>
              )}
              {creditScore.data && (
                <div className="mt-3"><RiskBadge risk={creditScore.data.risk_level} /></div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider opacity-80">Outstanding balance</div>
            <div className="text-4xl font-bold mt-1">{npr(summary.outstanding_balance)}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Credit score</div>
          {creditScore.isLoading && <Skeleton active paragraph={{ rows: 1 }} className="mt-3" />}
          {creditScoreNotCalculated && (
            <div className="mt-3 text-sm text-muted-foreground">Not calculated yet.</div>
          )}
          {creditScore.data && (
            <>
              <div className="mt-3 flex items-end gap-3">
                <div className="text-3xl font-bold">{creditScore.data.score}</div>
                <div className="text-sm text-muted-foreground mb-1">/ 100</div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${creditScore.data.score}%` }} />
              </div>
            </>
          )}
        </Card>
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total udharo</div>
          <div className="mt-3 text-3xl font-bold">{npr(summary.total_udharo)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {transactions.filter((t) => t.type === "udharo").length} entries
          </div>
        </Card>
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total paid</div>
          <div className="mt-3 text-3xl font-bold">{npr(summary.total_paid)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {transactions.filter((t) => t.type === "payment").length} payments
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Credit statement</h2>
          <span className="text-xs text-muted-foreground">Running balance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Date</th>
                <th className="text-left px-6 py-3 font-medium">Detail</th>
                <th className="text-right px-6 py-3 font-medium">Udharo</th>
                <th className="text-right px-6 py-3 font-medium">Payment</th>
                <th className="text-right px-6 py-3 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-6 py-3 text-muted-foreground">{t.date.slice(0, 10)}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${t.type === "udharo" ? "bg-warning" : "bg-success"}`} />
                      {t.note || (t.type === "udharo" ? "Udharo entry" : "Payment received")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">{t.type === "udharo" ? npr(t.amount) : "—"}</td>
                  <td className="px-6 py-3 text-right text-success">{t.type === "payment" ? npr(t.amount) : "—"}</td>
                  <td className="px-6 py-3 text-right font-semibold">{npr(t.balance)}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
