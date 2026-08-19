import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationsQueryKeys.all, "list"] as const,
  list: (params: NotificationListParams) =>
    [...notificationsQueryKeys.lists(), params] as const,
};

function buildNotificationsQuery(params: NotificationListParams) {
  const search = new URLSearchParams();
  if (params.is_read !== undefined)
    search.set("is_read", String(params.is_read));
  if (params.notif_type) search.set("notif_type", params.notif_type);
  if (params.created_after) search.set("created_after", params.created_after);
  if (params.created_before)
    search.set("created_before", params.created_before);
  if (params.ordering) search.set("ordering", params.ordering);
  return search.toString();
}

export function getNotifications(params: NotificationListParams = {}) {
  const query = buildNotificationsQuery(params);
  return apiClient.get<AppNotification[]>(
    `/notifications/${query ? `?${query}` : ""}`,
  );
}

export function markNotificationRead(id: string) {
  return apiClient.post<AppNotification>(`/notifications/${id}/mark-read/`);
}

export function markAllNotificationsRead() {
  return apiClient.post<void>("/notifications/mark-all-read/");
}

export function useNotifications(params: NotificationListParams = {}) {
  return useQuery({
    queryKey: notificationsQueryKeys.list(params),
    queryFn: () => getNotifications(params),
  });
}

// Polled from the header bell so the unread badge stays current without
// the user needing to reload or open the full notifications page.
export function useUnreadNotifications() {
  return useQuery({
    queryKey: notificationsQueryKeys.list({ is_read: false }),
    queryFn: () => getNotifications({ is_read: false }),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all }),
  });
}
