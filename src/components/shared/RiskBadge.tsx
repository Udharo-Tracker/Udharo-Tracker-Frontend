import { StatusTag, type StatusTagTone } from "@/components/shared/StatusTag";

const tones: Record<CreditRiskLevel, StatusTagTone> = {
  green: "success",
  yellow: "warning",
  red: "danger",
};

const labels: Record<CreditRiskLevel, string> = {
  green: "Low risk",
  yellow: "Medium",
  red: "High risk",
};

export function RiskBadge({ risk }: { risk: CreditRiskLevel }) {
  return <StatusTag tone={tones[risk]}>{labels[risk]}</StatusTag>;
}
