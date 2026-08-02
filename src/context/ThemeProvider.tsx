import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import { themeTokens } from "@/lib/theme-tokens";
import { ThemeContext, type AppThemeTokens, type ThemeContextValue } from "./theme-context";

// Values come from src/lib/theme-tokens.ts, which mirrors the CSS custom
// properties in index.css so antd and the Tailwind design system stay in sync.
const tokens: AppThemeTokens = themeTokens;

const value: ThemeContextValue = {
  tokens,
  antdTheme: {
    token: {
      colorPrimary: tokens.colorPrimary,
      colorSuccess: tokens.colorSuccess,
      colorWarning: tokens.colorWarning,
      colorError: tokens.colorError,
      colorInfo: tokens.colorInfo,
      borderRadius: tokens.borderRadius,
    },
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={value.antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}
