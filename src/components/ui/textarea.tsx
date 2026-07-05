import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";

export function Textarea({ className, ...props }: TextAreaProps) {
  return <Input.TextArea className={className} autoSize={{ minRows: 3 }} {...props} />;
}
