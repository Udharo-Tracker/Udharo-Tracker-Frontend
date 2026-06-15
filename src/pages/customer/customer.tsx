import { Link, useParams, Navigate } from "react-router-dom";
import { customers, udharoEntries, payments, npr } from "../../lib/mock-data";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Card } from "antd";
import { ArrowLeft, TrendingDown, TrendingUp, Phone } from "lucide-react";

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const customer = customers.find((c) => c.id === id);

  if (!customer) return <Navigate to="/customers" replace />;

  const cUdharo = udharoEntries.filter((e) => e.customerId === customer.id);
  const cPayments = payments.filter((p) => p.customerId === customer.id);

  type Row = { date: string; kind: "udharo" | "payment"; detail: string; debit: number; credit: number };
  const rows: Row[] = [
    ...cUdharo.map((e) => ({
      date: e.date,
      kind: "udharo" as const,
      detail: e.items.map((i) => i.name).join(", "),
      debit: e.total,
      credit: 0,
    })),
    ...cPayments.map((p) => ({
      date: p.date,
      kind: "payment" as const,
      detail: p.note ?? "Payment received",
      debit: 0,
      credit: p.amount,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  type BalancedRow = Row & { balance: number };
  const withBalance = rows.reduce<BalancedRow[]>((acc, r) => {
    const balance = (acc[acc.length - 1]?.balance ?? 0) + r.debit - r.credit;
    return [...acc, { ...r, balance }];
  }, []);

  return (
    <div className="space-y-6">
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to customers
      </Link>

      <Card className="p-6 md:p-8 rounded-3xl border-none shadow-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-primary-foreground/15 grid place-items-center text-xl font-bold">
              {customer.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                <Phone className="size-3.5" /> {customer.phone}
              </div>
              <div className="mt-3"><RiskBadge risk={customer.risk} /></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider opacity-80">Outstanding balance</div>
            <div className="text-4xl font-bold mt-1">{npr(customer.outstanding)}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Credit score</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-3xl font-bold">{customer.creditScore}</div>
            <div className="text-sm text-muted-foreground mb-1">/ 100</div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${customer.creditScore}%` }} />
          </div>
          <div className={`mt-3 text-xs inline-flex items-center gap-1 ${customer.trend >= 0 ? "text-success" : "text-danger"}`}>
            {customer.trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(customer.trend)}% vs last month
          </div>
        </Card>
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total udharo</div>
          <div className="mt-3 text-3xl font-bold">{npr(cUdharo.reduce((s, e) => s + e.total, 0))}</div>
          <div className="mt-1 text-xs text-muted-foreground">{cUdharo.length} entries</div>
        </Card>
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total paid</div>
          <div className="mt-3 text-3xl font-bold">{npr(cPayments.reduce((s, p) => s + p.amount, 0))}</div>
          <div className="mt-1 text-xs text-muted-foreground">{cPayments.length} payments</div>
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
              {withBalance.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-6 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${r.kind === "udharo" ? "bg-warning" : "bg-success"}`} />
                      {r.detail}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">{r.debit ? npr(r.debit) : "—"}</td>
                  <td className="px-6 py-3 text-right text-success">{r.credit ? npr(r.credit) : "—"}</td>
                  <td className="px-6 py-3 text-right font-semibold">{npr(r.balance)}</td>
                </tr>
              ))}
              {withBalance.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
