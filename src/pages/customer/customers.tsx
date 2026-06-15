import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { customers, npr, type Risk } from "@/lib/mock-data";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Card } from "antd";
import { Input } from "antd";
import { Search, ChevronRight } from "lucide-react";

const filters: { key: "all" | Risk; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Low risk" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High risk" },
];

export function CustomersList() {
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState<"all" | Risk>("all");

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          (risk === "all" || c.risk === risk) &&
          (c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q))
      ),
    [q, risk]
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">{customers.length} total · {customers.filter(c => c.risk === "high").length} high risk</p>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-none bg-card shadow-sm"
          />
        </div>
        <div className="flex gap-2 bg-card rounded-2xl p-1.5 shadow-sm">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setRisk(f.key)}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                risk === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        <ul className="divide-y">
          {filtered.map((c) => (
            <li key={c.id}>
              <Link to={`/customers/${c.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition">
                <div className="size-11 rounded-2xl bg-primary-soft text-primary font-semibold grid place-items-center">
                  {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </div>
                <RiskBadge risk={c.risk} />
                <div className="text-right">
                  <div className="font-semibold">{npr(c.outstanding)}</div>
                  <div className="text-xs text-muted-foreground">outstanding</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-12 text-center text-muted-foreground text-sm">No customers match your filters.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
