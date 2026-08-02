import { Typography } from "antd";
import type { HTMLAttributes } from "react";

export function Label({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <Typography.Text strong className={className} {...props}>
      {children}
    </Typography.Text>
  );
}
