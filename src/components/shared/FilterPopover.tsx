import { useState, type ReactNode } from "react";
import { Popover, Button } from "antd";
import { Filter } from "lucide-react";

interface FilterPopoverProps {
  /** Whether any filter inside is currently applied — shows a dot on the trigger. */
  active: boolean;
  /** Clears every filter and closes the popover. */
  onClear: () => void;
  children: ReactNode;
  title?: string;
}

// The one "Filter" affordance shared across list pages — sits next to the
// search box in the header and opens a popover of page-specific controls.
// Keep new list filters on this instead of ad-hoc dropdowns so they read
// the same everywhere.
export function FilterPopover({
  active,
  onClear,
  children,
  title = "Filters",
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      content={
        <div className="w-64 space-y-4 py-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{title}</span>
            {active && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-xs text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {children}
        </div>
      }
    >
      <div className="relative shrink-0">
        <Button icon={<Filter size={15} />} aria-label="Filter" />
        {active && (
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary ring-2 ring-card" />
        )}
      </div>
    </Popover>
  );
}
