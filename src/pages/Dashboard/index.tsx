import { Link } from "react-router-dom";
import { Button, Skeleton, Alert } from "antd";
import { ArrowUpRight, Coins, Wallet, Clock, CalendarDays } from "lucide-react";
import { useDashboard } from "@/api/ledger.api";
import { useUdharoEntries } from "@/api/udharo.api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { StatCard, StatCardSkeleton, type StatCardTint } from "@/components/shared/StatCard";
import { useEntityModals } from "@/context/entity-modals-context";
import { npr } from "@/lib/currency";

export function Dashboard() {
  const dashboard = useDashboard();
  const udharoEntries = useUdharoEntries();
  const { openCreateUdharo } = useEntityModals();

  const stats: { label: string; value: number; icon: typeof Coins; tint: StatCardTint }[] = dashboard.data
    ? [
        { label: "Total credit given", value: dashboard.data.total_credit_given, icon: Coins, tint: "primary" },
        { label: "Total recovered", value: dashboard.data.total_recovered, icon: Wallet, tint: "success" },
        { label: "Total pending", value: dashboard.data.total_pending, icon: Clock, tint: "warning" },
        { label: "Today's udharo", value: dashboard.data.todays_udharo, icon: CalendarDays, tint: "accent" },
      ]
    : [];

  const recent = [...(udharoEntries.data ?? [])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        eyebrow="Namaste, Shopkeeper 👋"
        actions={
          <Button
            type="primary"
            icon={<ArrowUpRight className="size-4" />}
            iconPlacement="end"
            onClick={() => openCreateUdharo()}
          >
            New udharo
          </Button>
        }
      />

      {dashboard.isError && (
        <Alert type="error" showIcon title="Couldn't load dashboard summary" description={(dashboard.error as Error).message} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {dashboard.isLoading &&
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={npr(s.value)} icon={s.icon} tint={s.tint} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2">
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
        </Panel>

        <Panel>
          <h2 className="font-semibold text-lg mb-5">Recent udharo</h2>
          {udharoEntries.isLoading && <Skeleton active paragraph={{ rows: 4 }} />}
          {udharoEntries.isError && (
            <Alert type="error" showIcon title="Couldn't load udharo entries" description={(udharoEntries.error as Error).message} />
          )}
          <ul className="space-y-3">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{e.customer.name}</div>
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
        </Panel>
      </div>
    </div>
  );
}
