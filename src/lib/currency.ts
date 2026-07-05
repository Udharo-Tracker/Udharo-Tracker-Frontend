export function npr(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return `रु ${(Number.isFinite(value) ? value : 0).toLocaleString("en-NP")}`;
}
