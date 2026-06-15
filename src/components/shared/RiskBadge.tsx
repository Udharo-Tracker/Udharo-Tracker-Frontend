import { riskClasses, type Risk } from "../../lib/mock-data";

export function RiskBadge({ risk }: { risk: Risk }) {
  const label = risk === "low" ? "Low risk" : risk === "medium" ? "Medium" : "High risk";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${riskClasses(risk)}`}>
      <span className="size-1.5 rounded-full bg-current mr-1.5" />
      {label}
    </span>
  );
}
