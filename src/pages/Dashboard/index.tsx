import { Link } from "react-router-dom";
import { Card, Skeleton, Alert } from "antd";
import { ArrowUpRight, Coins, Wallet, Clock, CalendarDays } from "lucide-react";
import { useDashboard } from "@/api/ledger.api";
import { useUdharoEntries } from "@/api/udharo.api";
import { useCustomers } from "@/api/customers.api";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { npr } from "@/lib/currency";

export function Dashboard() {
  const dashboard = useDashboard();
  const udharoEntries = useUdharoEntries();
  const customers = useCustomers();

  const stats = dashboard.data
    ? [
        { label: "Total credit given", value: dashboard.data.total_credit_given, icon: Coins, tint: "bg-primary text-primary-foreground" },
        { label: "Total recovered", value: dashboard.data.total_recovered, icon: Wallet, tint: "bg-success text-success-foreground" },
        { label: "Total pending", value: dashboard.data.total_pending, icon: Clock, tint: "bg-warning text-warning-foreground" },
        { label: "Today's udharo", value: dashboard.data.todays_udharo, icon: CalendarDays, tint: "bg-accent text-accent-foreground" },
      ]
    : [];

  const recent = [...(udharoEntries.data ?? [])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  const customerName = (customerId: string) =>
    customers.data?.find((c) => c.id === customerId)?.name ?? "Unknown customer";

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Namaste, Shopkeeper 👋</p>
          <h1 className="text-3xl font-bold mt-1">Dashboard</h1>
        </div>
        <Link to="/udharo/new" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition">
          New udharo <ArrowUpRight className="size-4" />
        </Link>
      </header>

      {dashboard.isError && (
        <Alert type="error" showIcon title="Couldn't load dashboard summary" description={(dashboard.error as Error).message} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashboard.isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 border-none shadow-sm rounded-3xl">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          ))}
        {stats.map((s) => (
          <Card key={s.label} className="p-5 border-none shadow-sm rounded-3xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="mt-3 text-2xl font-bold">{npr(s.value)}</p>
              </div>
              <div className={`size-11 rounded-2xl grid place-items-center ${s.tint}`}>
                <s.icon className="size-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-3xl border-none shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">Top 5 debtors</h2>
            <Link to="/customers" className="text-xs text-primary font-medium hover:underline">View all</Link>
          </div>
          {dashboard.isLoading && <Skeleton active paragraph={{ rows: 5 }} />}
          <ol className="space-y-2">
            {dashboard.data?.top_5_debtors.map((c, i) => (
              <li key={c.id}>
                <Link to={`/customers/${c.id}`} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/60 transition">
                  <div className="size-9 rounded-xl bg-primary-soft text-primary grid place-items-center font-semibold text-sm">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.phone}</div>
                  </div>
                  <RiskBadge risk={c.risk} />
                  <div className="text-right">
                    <div className="font-semibold">{npr(c.outstanding_balance)}</div>
                  </div>
                </Link>
              </li>
            ))}
            {dashboard.data && dashboard.data.top_5_debtors.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">No outstanding debtors.</li>
            )}
          </ol>
        </Card>

        <Card className="p-6 rounded-3xl border-none shadow-sm">
          <h2 className="font-semibold text-lg mb-5">Recent udharo</h2>
          {udharoEntries.isLoading && <Skeleton active paragraph={{ rows: 4 }} />}
          {udharoEntries.isError && (
            <Alert type="error" showIcon title="Couldn't load udharo entries" description={(udharoEntries.error as Error).message} />
          )}
          <ul className="space-y-3">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{customerName(e.customer)}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {e.items.map((i) => i.item_name).join(", ")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">{npr(e.total_amount)}</div>
                  <div className="text-[10px] text-muted-foreground">{e.created_at.slice(0, 10)}</div>
                </div>
              </li>
            ))}
            {!udharoEntries.isLoading && !udharoEntries.isError && recent.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">No udharo entries yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
