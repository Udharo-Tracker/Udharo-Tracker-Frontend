import { createContext, useContext } from "react";
import type { ThemeConfig } from "antd";

export interface AppThemeTokens {
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  borderRadius: number;
}

export interface ThemeContextValue {
  tokens: AppThemeTokens;
  antdTheme: ThemeConfig;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}
