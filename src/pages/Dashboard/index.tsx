import { Link } from "react-router-dom";
import { customers, udharoEntries, totals, npr } from "@/lib/mock-data";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Card } from "antd";
import { ArrowUpRight, TrendingDown, TrendingUp, Wallet, Coins, Clock, CalendarDays } from "lucide-react";

const stats = [
  { label: "Total credit given", value: totals.given, icon: Coins, tint: "bg-primary text-primary-foreground" },
  { label: "Total recovered", value: totals.recovered, icon: Wallet, tint: "bg-success text-success-foreground" },
  { label: "Total pending", value: totals.pending, icon: Clock, tint: "bg-warning text-warning-foreground" },
  { label: "Today's udharo", value: totals.today, icon: CalendarDays, tint: "bg-accent text-accent-foreground" },
];

export function Dashboard() {
  const topDebtors = [...customers].sort((a, b) => b.outstanding - a.outstanding).slice(0, 5);
  const recent = [...udharoEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
          <ol className="space-y-2">
            {topDebtors.map((c, i) => (
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
                    <div className="font-semibold">{npr(c.outstanding)}</div>
                    <div className={`text-xs inline-flex items-center gap-1 ${c.trend >= 0 ? "text-success" : "text-danger"}`}>
                      {c.trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {Math.abs(c.trend)}%
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-6 rounded-3xl border-none shadow-sm">
          <h2 className="font-semibold text-lg mb-5">Recent udharo</h2>
          <ul className="space-y-3">
            {recent.map((e) => {
              const cust = customers.find((c) => c.id === e.customerId);
              return (
                <li key={e.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{cust?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {e.items.map((i) => i.name).join(", ")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-sm">{npr(e.total)}</div>
                    <div className="text-[10px] text-muted-foreground">{e.date}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
