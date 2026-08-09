import type { ReactNode } from "react";

export type StatusTagTone =
  "success" | "warning" | "danger" | "primary" | "muted";

const toneStyles: Record<StatusTagTone, string> = {
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning-foreground",
  danger: "border-danger/20 bg-danger-soft text-danger",
  primary: "border-primary/20 bg-primary-soft text-primary",
  muted: "border-border bg-muted text-muted-foreground",
};

interface StatusTagProps {
  tone: StatusTagTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

// The one pill/badge style shared across the app — risk levels, settled/
// pending states, transaction status, etc. Keep new status indicators on
// this instead of ad-hoc spans or antd's <Tag> so they all read the same.
export function StatusTag({
  tone,
  children,
  className = "",
  dot = true,
}: StatusTagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneStyles[tone]} ${className}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current mr-1.5" />}
      {children}
    </span>
  );
}
