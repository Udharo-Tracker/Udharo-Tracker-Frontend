import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Checkbox, DatePicker, Empty, Pagination, Tabs } from "antd";
import type { Dayjs } from "dayjs";
import { CheckCheck } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/api/notifications.api";
import { FilterPopover } from "@/components/shared/FilterPopover";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import {
  NOTIF_TONE_CHIP_CLASS,
  NOTIF_TYPE_OPTIONS,
  getNotifTypeMeta,
} from "@/lib/notifications";
import { formatRelativeTime } from "@/utils/date";

const { RangePicker } = DatePicker;
type DateRange = [Dayjs | null, Dayjs | null] | null;
const PAGE_SIZE = 15;

export function NotificationsList() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [tab, setTab] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<NotifType[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const [page, setPage] = useState(1);
  const hasActiveFilters =
    typeFilter.length > 0 || !!(dateRange && (dateRange[0] || dateRange[1]));

  const rows = useMemo(() => notifications.data ?? [], [notifications.data]);
  const unreadCount = rows.filter((n) => !n.is_read).length;

  const filtered = useMemo(() => {
    const sorted = [...rows].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return sorted.filter((n) => {
      const matchesTab = tab === "all" || !n.is_read;
      const matchesType =
        typeFilter.length === 0 || typeFilter.includes(n.notif_type);
      const createdAt = new Date(n.created_at);
      const [from, to] = dateRange ?? [null, null];
      const matchesDate =
        (!from || createdAt >= from.startOf("day").toDate()) &&
        (!to || createdAt <= to.endOf("day").toDate());
      return matchesTab && matchesType && matchesDate;
    });
  }, [rows, tab, typeFilter, dateRange]);

  // A filter change can shrink the result set enough that the current page
  // no longer exists — clamp rather than showing a blank page.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function handleSelect(n: AppNotification) {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.customer) navigate(`/customers/${n.customer}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${rows.length} total${unreadCount > 0 ? ` · ${unreadCount} unread` : ""}`}
        actions={
          <>
            <FilterPopover
              active={hasActiveFilters}
              onClear={() => {
                setTypeFilter([]);
                setDateRange(null);
              }}
              title="Filter notifications"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Checkbox.Group
                    className="flex flex-col gap-2"
                    value={typeFilter}
                    onChange={(values) => setTypeFilter(values as NotifType[])}
                    options={NOTIF_TYPE_OPTIONS.map((o) => ({
                      label: o.label,
                      value: o.value,
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <RangePicker
                    className="w-full"
                    value={dateRange}
                    onChange={(range) => setDateRange(range)}
                    allowEmpty={[true, true]}
                  />
                </div>
              </div>
            </FilterPopover>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </>
        }
      />

      {notifications.isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load notifications"
          description={
            notifications.error instanceof Error
              ? notifications.error.message
              : "Unknown error"
          }
        />
      )}

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as "all" | "unread")}
        items={[
          { key: "all", label: "All" },
          {
            key: "unread",
            label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`,
          },
        ]}
      />

      <Panel padding="none" bodyClassName="p-2">
        {notifications.isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : pageRows.length === 0 ? (
          <Empty
            className="py-12"
            description={
              <div>
                <p className="text-base font-bold text-foreground">
                  No notifications found
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different tab or filter.
                </p>
              </div>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {pageRows.map((n) => {
              const meta = getNotifTypeMeta(n.notif_type);
              const Icon = meta.icon;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(n)}
                    className={`w-full flex items-start gap-3 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-muted ${
                      !n.is_read ? "bg-primary-soft/40" : ""
                    }`}
                  >
                    <span
                      className={`size-9 rounded-full grid place-items-center shrink-0 ${NOTIF_TONE_CHIP_CLASS[meta.tone]}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {n.title}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </span>
                      <span className="block text-sm text-muted-foreground mt-0.5">
                        {n.message}
                      </span>
                      {n.customer_name && (
                        <span className="block text-xs text-primary mt-1">
                          {n.customer_name}
                        </span>
                      )}
                    </span>
                    {!n.is_read && (
                      <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {filtered.length > PAGE_SIZE && (
        <div className="flex justify-end">
          <Pagination
            current={safePage}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
