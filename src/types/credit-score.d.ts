type CreditRiskLevel = "green" | "yellow" | "red";

interface CreditScore {
  id: string;
  customer: string;
  calculated_at: string;
  score: number;
  risk_level: CreditRiskLevel;
}
