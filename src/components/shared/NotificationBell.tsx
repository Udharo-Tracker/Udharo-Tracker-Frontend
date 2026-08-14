import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, Skeleton } from "antd";
import type { TooltipPlacement } from "antd/es/tooltip";
import { Bell, CheckCheck } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotifications,
} from "@/api/notifications.api";
import { NOTIF_TONE_CHIP_CLASS, getNotifTypeMeta } from "@/lib/notifications";
import { formatRelativeTime } from "@/utils/date";

const RECENT_LIMIT = 8;

// Header bell shared by the desktop sidebar and the mobile top bar — shows
// the unread count and a quick-glance dropdown. Full history with filters
// lives at /notifications; this is just the "what's new" affordance.
interface NotificationBellProps {
  className?: string;
  hoverClassName?: string;
  placement?: TooltipPlacement;
}

export function NotificationBell({
  className = "",
  hoverClassName = "hover:bg-muted",
  placement = "bottomRight",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const unread = useUnreadNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = (unread.data ?? []).slice(0, RECENT_LIMIT);
  const unreadCount = unread.data?.length ?? 0;

  function handleSelect(n: AppNotification) {
    markRead.mutate(n.id);
    setOpen(false);
    if (n.customer) navigate(`/customers/${n.customer}`);
  }

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement={placement}
      content={
        <div className="w-80 max-w-[90vw]">
          <div className="flex items-center justify-between px-1 pb-2 pt-1">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {unread.isLoading && (
            <div className="px-1 py-2">
              <Skeleton active title={false} paragraph={{ rows: 3 }} />
            </div>
          )}

          {unread.isError && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Couldn't load notifications.
            </div>
          )}

          {unread.data && items.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Bell className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You're all caught up
              </p>
            </div>
          )}

          {items.length > 0 && (
            <ul className="max-h-96 overflow-y-auto -mx-1">
              {items.map((n) => {
                const meta = getNotifTypeMeta(n.notif_type);
                const Icon = meta.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(n)}
                      className="w-full flex items-start gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-muted transition-colors"
                    >
                      <span
                        className={`size-8 rounded-full grid place-items-center shrink-0 ${NOTIF_TONE_CHIP_CLASS[meta.tone]}`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground truncate">
                          {n.title}
                        </span>
                        <span className="block text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {n.message}
                        </span>
                        <span className="block text-[11px] text-muted-foreground mt-1">
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-border mt-1 pt-2 px-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
              className="w-full text-center text-xs font-medium text-primary hover:underline py-1"
            >
              View all notifications
            </button>
          </div>
        </div>
      }
    >
      <button
        type="button"
        aria-label="Notifications"
        className={`relative size-9 rounded-lg grid place-items-center text-muted-foreground transition-colors ${hoverClassName} ${className}`}
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 min-w-4 h-4 px-1 rounded-full bg-danger text-[10px] leading-4 font-semibold text-danger-foreground text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </Popover>
  );
}
