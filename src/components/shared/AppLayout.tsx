import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, PlusCircle, Wallet, BarChart3, Store } from "lucide-react";
import { App } from "antd";
import { FloatingActions } from "./FloatingActions";
import { BottomNav } from "./BottomNav";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/udharo/new", label: "Add Udharo", icon: PlusCircle },
  { to: "/payments/new", label: "Record Payment", icon: Wallet },
  { to: "/reports", label: "Monthly Report", icon: BarChart3 },
];

export default function AppLayout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <App>
      <div className="min-h-screen flex bg-background">
        <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground p-5 hidden md:flex flex-col rounded-r-4xl">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="size-11 rounded-2xl bg-sidebar-foreground/10 grid place-items-center">
              <Store className="size-5" />
            </div>
            <div>
              <div className="font-semibold text-base leading-tight">UdharoTrack</div>
              <div className="text-xs opacity-70">Shop credit manager</div>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-foreground text-sidebar font-medium shadow-sm"
                      : "hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="text-xs opacity-60 px-2">v1.0 · Nepal</div>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="md:hidden sticky top-0 z-20 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center gap-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
            <div className="size-9 rounded-xl bg-sidebar-foreground/10 grid place-items-center">
              <Store className="size-4" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm">UdharoTrack</div>
              <div className="text-[11px] opacity-70">Shop credit manager</div>
            </div>
          </header>
          <main className="flex-1 min-w-0 p-4 md:p-10 pb-28 md:pb-10">{children ?? <Outlet />}</main>
        </div>
        <FloatingActions />
        <BottomNav />
      </div>
    </App>
  );
}
