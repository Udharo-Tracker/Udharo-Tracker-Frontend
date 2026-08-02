import { User } from "lucide-react";

const sizeClass = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-xl",
} as const;

interface CustomerAvatarProps {
  name?: string;
  size?: keyof typeof sizeClass;
  className?: string;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CustomerAvatar({ name, size = "sm", className = "" }: CustomerAvatarProps) {
  const label = name?.trim() ? initials(name) : null;

  return (
    <div
      className={`${sizeClass[size]} rounded-2xl bg-primary-soft text-primary grid place-items-center shrink-0 font-semibold ${className}`}
    >
      {label ?? <User className="size-4" />}
    </div>
  );
}
