import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Store,
  Lock,
} from "lucide-react";
import { App, Avatar, Menu, Popover } from "antd";
import type { MenuProps } from "antd";
import { FloatingActions } from "../components/shared/FloatingActions";
import { BottomNav } from "../components/shared/BottomNav";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { EntityModalsProvider } from "@/context/EntityModalsProvider";
import { ChangePasswordModal } from "@/pages/profile/change-password";
import { useLogout } from "@/api/auth.api";
import { useProfile } from "@/api/profile.api";
import { useShops } from "@/api/shops.api";
import { useUnreadNotifications } from "@/api/notifications.api";
import { useState, type ReactNode } from "react";

const menuNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/udharo", label: "Udharo", icon: ClipboardList },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/reports", label: "Monthly Report", icon: BarChart3 },
];

export default function AppLayout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: profile } = useProfile();
  const { data: shops } = useShops();
  const shop = shops?.[0];
  const unread = useUnreadNotifications();
  const unreadCount = unread.data?.length ?? 0;
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  function isActive(to: string) {
    return to === "/" ? pathname === "/" : pathname.startsWith(to);
  }

  const avatarMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile settings",
      icon: <Settings className="size-4" />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "change-password",
      label: "Change password",
      icon: <Lock className="size-4" />,
      onClick: () => setChangePasswordOpen(true),
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
          <aside className="w-59 shrink-0 bg-card text-card-foreground p-2 hidden md:flex flex-col shadow-sm md:sticky md:top-0 md:h-screen md:overflow-y-auto">
            <div className="flex items-center mb-3">
              <div className="size-13 rounded-md grid place-items-center overflow-hidden">
                <img
                  src="/logo/logo.png"
                  alt="UdharoTrack"
                  className="size-10 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base leading-tight">
                  UdharoTrack
                </div>
                <div className="text-xs text-muted-foreground">
                  Shop credit manager
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-2 py-3 mb-5 border-y border-border">
              <div className="size-9 rounded-md bg-primary-soft text-primary grid place-items-center shrink-0 overflow-hidden">
                {shop?.logo ? (
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <Store className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-sm font-medium text-foreground truncate  leading-tight">
                  {shop?.name || "My shop"}
                </div>
                <div className="text-xs text-muted-foreground truncate  leading-tight">
                  {shop?.legal_name || "Shop credit manager"}
                </div>
              </div>
            </div>
            {/* 
            <div className="text-[11px] font-semibold tracking-wide text-muted-foreground px-3 mb-2">
              MENU
            </div> */}
            <nav className="space-y-1">
              {menuNav.map((n) => {
                const active = isActive(n.to);
                const Icon = n.icon;
                const badge =
                  n.to === "/notifications" && unreadCount > 0
                    ? unreadCount
                    : null;
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
                    <span className="flex-1">{n.label}</span>
                    {badge !== null && (
                      <span
                        className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold leading-5 text-center ${
                          active
                            ? "bg-primary-foreground! text-primary!"
                            : "bg-danger text-danger-foreground"
                        }`}
                      >
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
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

            <Popover
              content={
                <Menu items={avatarMenuItems} style={{ minWidth: 180 }} />
              }
              trigger="click"
              placement="rightBottom"
            >
              <button
                type="button"
                aria-label="Account menu"
                className="w-full flex items-center gap-2.5 p-2 hover:bg-muted transition-colors text-left border rounded-md border-border"
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

            {/* <div className="text-xs text-muted-foreground px-2 pt-2">
              v1.0 · Nepal
            </div> */}
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
              <div className="leading-tight flex-1 min-w-0">
                <div className="font-semibold text-sm">UdharoTrack</div>
                <div className="text-[11px] opacity-70">
                  Shop credit manager
                </div>
              </div>
              <NotificationBell
                className="text-sidebar-foreground"
                hoverClassName="hover:bg-sidebar-accent"
              />
            </header>

            <main className="flex-1 min-w-0 p-5 pb-28">
              {children ?? <Outlet />}
            </main>
          </div>
        </div>
        <FloatingActions />
        <BottomNav />
        <ChangePasswordModal
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />
      </EntityModalsProvider>
    </App>
  );
}
