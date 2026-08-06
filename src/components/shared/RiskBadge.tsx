const styles: Record<CreditRiskLevel, string> = {
  green: "border-success/20 bg-success-soft text-success",
  yellow: "border-warning/30 bg-warning-soft text-warning-foreground",
  red: "border-danger/20 bg-danger-soft text-danger",
};

const labels: Record<CreditRiskLevel, string> = {
  green: "Low risk",
  yellow: "Medium",
  red: "High risk",
};

export function RiskBadge({ risk }: { risk: CreditRiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[risk]}`}
    >
      <span className="size-1.5 rounded-full bg-current mr-1.5" />
      {labels[risk]}
    </span>
  );
}
