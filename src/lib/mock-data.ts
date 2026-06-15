export type Risk = "low" | "medium" | "high";

export function riskClasses(risk: Risk): string {
  if (risk === "low") return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  if (risk === "medium") return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400";
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400";
}

export function npr(amount: number): string {
  return `रु ${amount.toLocaleString("en-NP")}`;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  risk: Risk;
  outstanding: number;
  creditScore: number;
  trend: number;
}

export const customers: Customer[] = [
  { id: "1", name: "Ram Bahadur", phone: "9841000001", risk: "low", outstanding: 1500, creditScore: 85, trend: 5 },
  { id: "2", name: "Sita Devi", phone: "9841000002", risk: "medium", outstanding: 3200, creditScore: 62, trend: -3 },
  { id: "3", name: "Hari Prasad", phone: "9841000003", risk: "high", outstanding: 8750, creditScore: 35, trend: -12 },
  { id: "4", name: "Gita Kumari", phone: "9841000004", risk: "low", outstanding: 500, creditScore: 91, trend: 8 },
  { id: "5", name: "Bikram Thapa", phone: "9841000005", risk: "medium", outstanding: 4100, creditScore: 58, trend: 2 },
];

export interface UdharoItem { name: string; amount: number; }
export interface UdharoEntry {
  id: string;
  customerId: string;
  date: string;
  items: UdharoItem[];
  total: number;
  note?: string;
}

export const udharoEntries: UdharoEntry[] = [
  { id: "u1", customerId: "1", date: "2026-06-01", items: [{ name: "Rice 5kg", amount: 750 }, { name: "Oil 1L", amount: 250 }], total: 1000 },
  { id: "u2", customerId: "2", date: "2026-06-03", items: [{ name: "Sugar 2kg", amount: 300 }], total: 300 },
  { id: "u3", customerId: "3", date: "2026-06-05", items: [{ name: "Flour 10kg", amount: 1200 }, { name: "Salt", amount: 100 }], total: 1300 },
  { id: "u4", customerId: "1", date: "2026-06-10", items: [{ name: "Noodles x5", amount: 500 }], total: 500 },
  { id: "u5", customerId: "3", date: "2026-06-12", items: [{ name: "Dal 2kg", amount: 600 }], total: 600 },
  { id: "u6", customerId: "5", date: "2026-06-13", items: [{ name: "Tea 200g", amount: 400 }], total: 400 },
];

export interface Payment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  note?: string;
}

export const payments: Payment[] = [
  { id: "p1", customerId: "1", date: "2026-06-05", amount: 500 },
  { id: "p2", customerId: "2", date: "2026-06-08", amount: 1000, note: "Partial payment" },
  { id: "p3", customerId: "3", date: "2026-06-10", amount: 2000 },
  { id: "p4", customerId: "4", date: "2026-06-11", amount: 500 },
];

const totalGiven = udharoEntries.reduce((s, e) => s + e.total, 0);
const totalRecovered = payments.reduce((s, p) => s + p.amount, 0);
const today = new Date().toISOString().slice(0, 10);

export const totals = {
  given: totalGiven,
  recovered: totalRecovered,
  pending: totalGiven - totalRecovered,
  today: udharoEntries.filter((e) => e.date === today).reduce((s, e) => s + e.total, 0),
};

export const monthly = [
  { month: "Jan", udharo: 18000, payments: 12000 },
  { month: "Feb", udharo: 22000, payments: 18000 },
  { month: "Mar", udharo: 15000, payments: 14000 },
  { month: "Apr", udharo: 28000, payments: 20000 },
  { month: "May", udharo: 24000, payments: 22000 },
  { month: "Jun", udharo: 12000, payments: 8000 },
];

export const dailyBreakdown = [
  { date: "2026-06-01", udharo: 1000, payments: 0 },
  { date: "2026-06-03", udharo: 300, payments: 0 },
  { date: "2026-06-05", udharo: 1300, payments: 500 },
  { date: "2026-06-08", udharo: 0, payments: 1000 },
  { date: "2026-06-10", udharo: 500, payments: 2000 },
  { date: "2026-06-11", udharo: 0, payments: 500 },
  { date: "2026-06-12", udharo: 600, payments: 0 },
  { date: "2026-06-13", udharo: 400, payments: 0 },
];
