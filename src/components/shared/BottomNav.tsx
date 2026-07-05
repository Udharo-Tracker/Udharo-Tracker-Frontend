import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Plus, Wallet, BarChart3 } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/payments/new", label: "Pay", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 items-end">
        {items.slice(0, 2).map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={`flex flex-col items-center justify-center gap-0.5 h-14 min-h-[48px] text-[11px] font-medium touch-manipulation ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                {it.label}
              </Link>
            </li>
          );
        })}

        <li className="relative -top-3 flex justify-center">
          <Link
            to="/udharo/new"
            className={`flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shadow-lg touch-manipulation active:scale-95 transition-transform ${
              pathname.startsWith("/udharo/new") ? "ring-2 ring-offset-2 ring-primary ring-offset-background" : ""
            }`}
            aria-label="Add udharo"
          >
            <Plus className="size-6" />
          </Link>
        </li>

        {items.slice(2).map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={`flex flex-col items-center justify-center gap-0.5 h-14 min-h-[48px] text-[11px] font-medium touch-manipulation ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
