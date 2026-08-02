import { Card } from "antd";
import type { ReactNode } from "react";

const paddingPx = {
  none: 0,
  sm: 20,
  md: 24,
  lg: 32,
} as const;

interface PanelProps {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  padding?: keyof typeof paddingPx;
}

export function Panel({ children, className = "", bodyClassName, padding = "md" }: PanelProps) {
  return (
    <Card
      bordered={false}
      className={`rounded-3xl border border-border shadow-sm ${padding === "none" ? "overflow-hidden" : ""} ${className}`}
      styles={{ body: { padding: paddingPx[padding] } }}
      classNames={bodyClassName ? { body: bodyClassName } : undefined}
    >
      {children}
    </Card>
  );
}
