import type { LucideIcon } from "lucide-react";
import { Card, Skeleton } from "antd";
import type { ReactNode } from "react";

const tintStyles = {
  primary: "bg-primary text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  accent: "bg-accent text-white",
} as const;

const gradientStyles = {
  primary: "from-primary/25 via-primary/5 to-transparent",
  success: "from-success/25 via-success/5 to-transparent",
  warning: "from-warning/25 via-warning/5 to-transparent",
  danger: "from-danger/25 via-danger/5 to-transparent",
  accent: "from-accent/25 via-accent/5 to-transparent",
} as const;

const bubbleStyles = {
  primary: "bg-primary/25",
  success: "bg-success/25",
  warning: "bg-warning/25",
  danger: "bg-danger/25",
  accent: "bg-accent/25",
} as const;

export type StatCardTint = keyof typeof tintStyles;

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tint?: StatCardTint;
}

export function StatCard({ label, value, icon: Icon, tint = "primary" }: StatCardProps) {
  return (
    <Card
      className="group relative cursor-pointer overflow-hidden border-none shadow-sm transition-shadow duration-300 hover:shadow-md"
      styles={{
        root: { backgroundColor: "#FAFAFA", borderRadius: 6 },
        body: { paddingInline:15, paddingBlock: 10, },

      }}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${gradientStyles[tint]}`}
      />
      <div
        className={`pointer-events-none absolute -top-6 -right-4 size-16 scale-75 rounded-full opacity-0 blur-xl transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 ${bubbleStyles[tint]}`}
      />
      <div
        className={`pointer-events-none absolute -bottom-5 left-8 size-8 scale-75 rounded-full opacity-0 blur-lg transition-all delay-75 duration-500 group-hover:scale-100 group-hover:opacity-100 ${bubbleStyles[tint]}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg mt-1 font-bold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={`size-6.5 shrink-0 rounded-md grid place-items-center shadow-lg ${tintStyles[tint]}`}
          >
            <Icon className="size-3.5" />
          </div>
        )}
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card
      className="rounded-md border-none shadow-sm"
      styles={{
        root: { backgroundColor: "var(--muted)" },
        body: { padding: 14 },
      }}
    >
      <div className="flex items-center gap-3">
        <div className="size-9 shrink-0 rounded-md bg-muted animate-pulse" />
        <div className="flex-1">
          <Skeleton
            active
            paragraph={{ rows: 1, width: "60%" }}
            title={false}
          />
        </div>
      </div>
    </Card>
  );
}
