import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { App, Avatar, Menu, Popover } from "antd";
import type { MenuProps } from "antd";
import { FloatingActions } from "../components/shared/FloatingActions";
import { BottomNav } from "../components/shared/BottomNav";
import { EntityModalsProvider } from "@/context/EntityModalsProvider";
import { useLogout } from "@/api/auth.api";
import { useProfile } from "@/api/profile.api";
import type { ReactNode } from "react";

const menuNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/udharo", label: "Udharo", icon: ClipboardList },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/reports", label: "Monthly Report", icon: BarChart3 },
];

export default function AppLayout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const logout = useLogout();
  const { data: profile } = useProfile();

  function isActive(to: string) {
    return to === "/" ? pathname === "/" : pathname.startsWith(to);
  }

  const avatarMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile settings",
      icon: <Settings className="size-4" />,
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut className="size-4" />,
      danger: true,
      onClick: () => logout.mutate(),
    },
  ];

  return (
    <App>
      <EntityModalsProvider>
        <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-59 shrink-0 bg-card text-card-foreground p-3 hidden md:flex flex-col shadow-sm md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <div className="flex items-center mb-3">
            <div className="size-13 rounded-md grid place-items-center overflow-hidden">
              <img
                src="/logo/logo.png"
                alt="UdharoTrack"
                className="size-10 object-contain"
              />
            </div>
            <div>
              <div className="font-semibold text-base leading-tight">
                UdharoTrack
              </div>
              <div className="text-xs text-muted-foreground">
                Shop credit manager
              </div>
            </div>
          </div>

          <Popover
            content={<Menu items={avatarMenuItems} style={{ minWidth: 180 }} />}
            trigger="click"
            placement="rightTop"
          >
            <button
              type="button"
              aria-label="Account menu"
              className="w-full flex items-center gap-2.5 px-2 py-3 mb-5 hover:bg-muted transition-colors text-left border-y border-border"
            >
              <Avatar
                size={36}
                src={profile?.profile_picture}
                icon={<User className="size-4" />}
                className="bg-primary! text-white! shrink-0"
              />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-sm font-medium text-foreground truncate">
                  {profile?.first_name || profile?.last_name
                    ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
                    : "My account"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {profile?.email}
                </div>
              </div>
              <ChevronDown className="size-4 text-muted-foreground shrink-0" />
            </button>
          </Popover>

          <div className="text-[11px] font-semibold tracking-wide text-muted-foreground px-3 mb-2">
            MENU
          </div>
          <nav className="space-y-1">
            {menuNav.map((n) => {
              const active = isActive(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-primary! text-primary-foreground! font-medium shadow-sm"
                      : "text-muted-foreground! hover:bg-muted! hover:text-foreground!"
                  }`}
                >
                  <Icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="text-[11px] font-semibold tracking-wide text-muted-foreground px-3 mb-2 mt-5">
            GENERAL
          </div>
          <nav className="space-y-1">
            <Link
              to="/shop"
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive("/shop")
                  ? "bg-primary! text-primary-foreground! font-medium shadow-sm"
                  : "text-muted-foreground! hover:bg-muted! hover:text-foreground!"
              }`}
            >
              <Settings className="size-4" />
              Shop settings
            </Link>
          </nav>

          <div className="flex-1" />
          <div className="text-xs text-muted-foreground px-2">v1.0 · Nepal</div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile header */}
          <header className="md:hidden sticky top-0 z-20 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center gap-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
            <div className="size-9 rounded-md bg-sidebar-foreground/10 grid place-items-center overflow-hidden">
              <img
                src="/logo/logo.png"
                alt="UdharoTrack"
                className="size-6 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm">UdharoTrack</div>
              <div className="text-[11px] opacity-70">Shop credit manager</div>
            </div>
          </header>

          <main className="flex-1 min-w-0 p-5 pb-28">
            {children ?? <Outlet />}
          </main>
        </div>
        </div>
        <FloatingActions />
        <BottomNav />
      </EntityModalsProvider>
    </App>
  );
}
