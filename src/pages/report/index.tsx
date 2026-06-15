import { monthly, dailyBreakdown, npr } from "../../lib/mock-data";
import { Card } from "antd";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";


export function Reports() {
  const totalUdharo = monthly.reduce((s, m) => s + m.udharo, 0);
  const totalPay = monthly.reduce((s, m) => s + m.payments, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Monthly report</h1>
        <p className="text-sm text-muted-foreground mt-1">Last 6 months · Udharo vs Payments</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Udharo (6mo)</div>
          <div className="mt-2 text-2xl font-bold">{npr(totalUdharo)}</div>
        </Card>
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Payments (6mo)</div>
          <div className="mt-2 text-2xl font-bold text-success">{npr(totalPay)}</div>
        </Card>
        <Card className="p-5 rounded-3xl border-none shadow-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Net pending</div>
          <div className="mt-2 text-2xl font-bold text-warning-foreground">{npr(totalUdharo - totalPay)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 rounded-3xl border-none shadow-sm flex items-center gap-4">
          <div className="size-10 rounded-full bg-success/15 grid place-items-center shrink-0">
            <span className="text-lg">🏆</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Best customer</div>
            <div className="font-semibold text-sm">Sita Kumari</div>
            <div className="text-xs text-muted-foreground">Always pays on time</div>
          </div>
        </Card>
        <Card className="p-5 rounded-3xl border-none shadow-sm flex items-center gap-4">
          <div className="size-10 rounded-full bg-danger/15 grid place-items-center shrink-0">
            <span className="text-lg">⚠️</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Worst customer</div>
            <div className="font-semibold text-sm">Bishnu Rai</div>
            <div className="text-xs text-danger">45 days late</div>
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-3xl border-none shadow-sm">
        <h2 className="font-semibold mb-4">Monthly comparison</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                formatter={(v) => npr(v as number)}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="udharo" name="Udharo" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="payments" name="Payments" fill="var(--success)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Daily breakdown</h2>
          <p className="text-xs text-muted-foreground mt-1">Recent 14 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Date</th>
                <th className="text-right px-6 py-3 font-medium">Udharo</th>
                <th className="text-right px-6 py-3 font-medium">Payments</th>
                <th className="text-right px-6 py-3 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {dailyBreakdown.map((d) => (
                <tr key={d.date} className="border-t">
                  <td className="px-6 py-3 text-muted-foreground">{d.date}</td>
                  <td className="px-6 py-3 text-right">{npr(d.udharo)}</td>
                  <td className="px-6 py-3 text-right text-success">{npr(d.payments)}</td>
                  <td className={`px-6 py-3 text-right font-semibold ${d.udharo - d.payments > 0 ? "text-warning-foreground" : "text-success"}`}>
                    {npr(d.udharo - d.payments)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
