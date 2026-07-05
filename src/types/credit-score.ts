export type CreditRiskLevel = "green" | "yellow" | "red";

export interface CreditScore {
  id: string;
  customer: string;
  calculated_at: string;
  score: number;
  risk_level: CreditRiskLevel;
}
