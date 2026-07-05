import type { CreditRiskLevel } from "@/types/credit-score";

const styles: Record<CreditRiskLevel, string> = {
  green: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
  red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
};

const labels: Record<CreditRiskLevel, string> = {
  green: "Low risk",
  yellow: "Medium",
  red: "High risk",
};

export function RiskBadge({ risk }: { risk: CreditRiskLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[risk]}`}>
      <span className="size-1.5 rounded-full bg-current mr-1.5" />
      {labels[risk]}
    </span>
  );
}
