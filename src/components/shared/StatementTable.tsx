import type { ReactNode } from "react";

export interface StatementRow {
  key: string;
  date: ReactNode;
  label: ReactNode;
  debit?: ReactNode;
  credit?: ReactNode;
  balance?: ReactNode;
  balanceTint?: "success" | "warning" | "neutral";
}

interface StatementTableProps {
  columns: {
    date: string;
    label: string;
    debit: string;
    credit: string;
    balance?: string;
  };
  rows: StatementRow[];
  emptyMessage: string;
}

const balanceTintClass = {
  success: "text-success",
  warning: "text-warning-foreground",
  neutral: "",
} as const;

export function StatementTable({ columns, rows, emptyMessage }: StatementTableProps) {
  const showBalance = Boolean(columns.balance);
  const colCount = showBalance ? 5 : 4;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left px-6 py-3 font-medium">{columns.date}</th>
            <th className="text-left px-6 py-3 font-medium">{columns.label}</th>
            <th className="text-right px-6 py-3 font-medium">{columns.debit}</th>
            <th className="text-right px-6 py-3 font-medium">{columns.credit}</th>
            {showBalance && <th className="text-right px-6 py-3 font-medium">{columns.balance}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t">
              <td className="px-6 py-3 text-muted-foreground">{row.date}</td>
              <td className="px-6 py-3">{row.label}</td>
              <td className="px-6 py-3 text-right">{row.debit ?? "—"}</td>
              <td className="px-6 py-3 text-right text-success">{row.credit ?? "—"}</td>
              {showBalance && (
                <td
                  className={`px-6 py-3 text-right font-semibold ${balanceTintClass[row.balanceTint ?? "neutral"]}`}
                >
                  {row.balance ?? "—"}
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={colCount} className="p-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
