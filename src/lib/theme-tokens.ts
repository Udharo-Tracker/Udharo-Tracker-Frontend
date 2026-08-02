// Antd's ConfigProvider needs plain JS values at render time, so it can't read
// the CSS custom properties in src/index.css directly. These are the light-mode
// values mirrored from :root there — keep both in sync when either changes.
export const themeTokens = {
  colorPrimary: "#1677ff",
  colorSuccess: "#16a34a",
  colorWarning: "#fbbf24",
  colorError: "#dc2626",
  colorInfo: "#1677ff",
  borderRadius: 8,
} as const;
