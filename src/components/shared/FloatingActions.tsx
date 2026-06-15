import { Link, useLocation } from "react-router-dom";
import { PlusCircle, Wallet } from "lucide-react";
import { useState } from "react";

export function FloatingActions() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/udharo/new") || pathname.startsWith("/payments/new")) return null;

  const match = pathname.match(/^\/customers\/([^/]+)$/);
  const customerId = match?.[1];
  const qs = customerId ? `?customerId=${customerId}` : "";

  return (
    <div className="fixed right-4 md:right-6 z-40 flex flex-col items-end gap-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6">
      {open && (
        <>
          <Link
            to={`/payments/new${qs}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-full bg-card shadow-lg px-4 py-3 text-sm font-medium hover:bg-muted transition"
          >
            <Wallet className="size-4 text-success" /> Record payment
          </Link>
          <Link
            to={`/udharo/new${qs}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-full bg-card shadow-lg px-4 py-3 text-sm font-medium hover:bg-muted transition"
          >
            <PlusCircle className="size-4 text-primary" /> Add udharo
          </Link>
        </>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Quick actions"
        className={`size-14 min-h-12 min-w-12 rounded-full bg-primary text-primary-foreground shadow-xl grid place-items-center transition-transform touch-manipulation active:scale-95 ${open ? "rotate-45" : ""}`}
      >
        <PlusCircle className="size-6" />
      </button>
    </div>
  );
}
