import { useEffect, useRef, useState } from "react";
import { Search, Check, Loader2 } from "lucide-react";
import { useCustomers } from "@/api/customers.api";

interface Props {
  value: string;
  onChange: (id: string) => void;
  autoFocus?: boolean;
}

export function CustomerCombobox({ value, onChange, autoFocus }: Props) {
  const { data: customers = [], isLoading } = useCustomers();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = customers.find((c) => c.id === value);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const filtered = customers.filter((c) => {
    const s = q.toLowerCase();
    return !s || c.name.toLowerCase().includes(s) || c.phone.includes(q);
  });

  return (
    <div className="relative">
      <div className="relative">
        <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={open ? q : selected ? `${selected.name} · ${selected.phone}` : ""}
          onFocus={() => { setOpen(true); setQ(""); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => { setOpen(true); setQ(e.target.value); }}
          placeholder="Search customer by name or phone…"
          className="w-full h-12 rounded-2xl bg-muted/60 border border-input pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          autoComplete="off"
        />
      </div>
      {open && (
        <ul className="absolute z-30 mt-2 w-full max-h-72 overflow-auto rounded-2xl bg-popover border shadow-xl p-1">
          {isLoading && (
            <li className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Loading customers…
            </li>
          )}
          {!isLoading && filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">No customers found.</li>
          )}
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(c.id); setOpen(false); }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted text-sm"
              >
                <div className="size-9 rounded-xl bg-primary-soft text-primary grid place-items-center font-semibold text-xs">
                  {c.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </div>
                {c.id === value && <Check className="size-4 text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
