import { useState } from "react";
import { Card, Select, Alert, Skeleton, Button, App } from "antd";
import { FileDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  useMonthlyReport,
  useDownloadMonthlyReportPdf,
} from "@/api/ledger.api";
import { getApiErrorMessage } from "@/api/client";
import { npr } from "@/lib/currency";
import { formatDateOnly } from "@/utils/date";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  { value: 0, label: "All months" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString("en-US", { month: "long" }),
  })),
];

export function Reports() {
  const { message } = App.useApp();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(0);

  const { data, isLoading, isError, error } = useMonthlyReport({
    year,
    month: month || undefined,
  });
  const downloadPdf = useDownloadMonthlyReportPdf();
  const isMonthView = "daily_breakdown" in (data ?? {});

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Monthly report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Udharo vs Payments
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={year}
            onChange={setYear}
            options={years.map((y) => ({ value: y, label: y }))}
            className="w-28"
          />
          <Select
            value={month}
            onChange={setMonth}
            options={months}
            className="w-36"
          />
          <Button
            icon={<FileDown className="size-4" />}
            loading={downloadPdf.isPending}
            onClick={() =>
              downloadPdf.mutate(
                { year, month: month || undefined },
                { onError: (err) => message.error(getApiErrorMessage(err)) },
              )
            }
          >
            Download PDF
          </Button>
        </div>
      </header>

      {isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load report"
          description={(error as Error).message}
        />
      )}

      {isLoading && <Skeleton active paragraph={{ rows: 6 }} />}

      {data && !isMonthView && "yearly_totals" in data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 rounded-3xl border-none shadow-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Udharo ({year})
              </div>
              <div className="mt-2 text-2xl font-bold">
                {npr(data.yearly_totals.total_udharo)}
              </div>
            </Card>
            <Card className="p-5 rounded-3xl border-none shadow-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Payments ({year})
              </div>
              <div className="mt-2 text-2xl font-bold text-success">
                {npr(data.yearly_totals.total_payments)}
              </div>
            </Card>
            <Card className="p-5 rounded-3xl border-none shadow-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Net pending
              </div>
              <div className="mt-2 text-2xl font-bold text-warning-foreground">
                {npr(data.yearly_totals.net)}
              </div>
            </Card>
          </div>

          <Card className="p-6 rounded-3xl border-none shadow-sm">
            <h2 className="font-semibold mb-4">Monthly comparison</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.months} barGap={6}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month_name"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) => v.slice(0, 3)}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    formatter={(v) => npr(v as number)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="total_udharo"
                    name="Udharo"
                    fill="var(--primary)"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="total_payments"
                    name="Payments"
                    fill="var(--success)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Month by month</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Month</th>
                    <th className="text-right px-6 py-3 font-medium">Udharo</th>
                    <th className="text-right px-6 py-3 font-medium">
                      Payments
                    </th>
                    <th className="text-right px-6 py-3 font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {data.months.map((m) => (
                    <tr key={m.month} className="border-t">
                      <td className="px-6 py-3 text-muted-foreground">
                        {m.month_name}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {npr(m.total_udharo)}
                      </td>
                      <td className="px-6 py-3 text-right text-success">
                        {npr(m.total_payments)}
                      </td>
                      <td
                        className={`px-6 py-3 text-right font-semibold ${m.net > 0 ? "text-warning-foreground" : "text-success"}`}
                      >
                        {npr(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {data && isMonthView && "daily_breakdown" in data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 rounded-3xl border-none shadow-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Udharo ({data.month_name})
              </div>
              <div className="mt-2 text-2xl font-bold">
                {npr(data.totals.total_udharo)}
              </div>
            </Card>
            <Card className="p-5 rounded-3xl border-none shadow-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Payments ({data.month_name})
              </div>
              <div className="mt-2 text-2xl font-bold text-success">
                {npr(data.totals.total_payments)}
              </div>
            </Card>
            <Card className="p-5 rounded-3xl border-none shadow-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Net pending
              </div>
              <div className="mt-2 text-2xl font-bold text-warning-foreground">
                {npr(data.totals.net)}
              </div>
            </Card>
          </div>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Daily breakdown</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {data.month_name} {data.year}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                    <th className="text-right px-6 py-3 font-medium">Udharo</th>
                    <th className="text-right px-6 py-3 font-medium">
                      Payments
                    </th>
                    <th className="text-right px-6 py-3 font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily_breakdown.map((d) => (
                    <tr key={d.date} className="border-t">
                      <td className="px-6 py-3 text-muted-foreground">
                        {formatDateOnly(d.date)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {npr(d.total_udharo)}
                      </td>
                      <td className="px-6 py-3 text-right text-success">
                        {npr(d.total_payments)}
                      </td>
                      <td
                        className={`px-6 py-3 text-right font-semibold ${d.net > 0 ? "text-warning-foreground" : "text-success"}`}
                      >
                        {npr(d.net)}
                      </td>
                    </tr>
                  ))}
                  {data.daily_breakdown.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-muted-foreground"
                      >
                        No activity this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
