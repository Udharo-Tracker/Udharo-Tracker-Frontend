import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export const remindersQueryKeys = {
  list: (customerId: string, params: ReminderListParams = {}) =>
    ["customers", "detail", customerId, "reminders", params] as const,
};

export function getCustomerReminders(
  customerId: string,
  params: ReminderListParams = {},
) {
  const search = new URLSearchParams();
  if (params.channel) search.set("channel", params.channel);
  const query = search.toString();
  return apiClient.get<ReminderLog[]>(
    `/customers/${customerId}/reminders/${query ? `?${query}` : ""}`,
  );
}

export function createCustomerReminder(
  customerId: string,
  input: CreateReminderInput = {},
) {
  return apiClient.post<ReminderLog>(
    `/customers/${customerId}/reminders/`,
    input,
  );
}

// Sends an SMS reminder for the customer's current outstanding balance. No
// request body — the message is generated server-side. Even a failed
// provider send (502) still creates and returns a ReminderLog row with
// delivery_status: "failed", so it's safe to treat any resolved response as
// "log this", regardless of status.
export function sendCustomerReminderSms(customerId: string) {
  return apiClient.post<ReminderLog>(`/customers/${customerId}/reminders/sms/`);
}

// Same shape and guard rails as the SMS reminder, over WhatsApp instead.
export function sendCustomerReminderWhatsapp(customerId: string) {
  return apiClient.post<ReminderLog>(
    `/customers/${customerId}/reminders/whatsapp/`,
  );
}

export function useCustomerReminders(
  customerId: string,
  params: ReminderListParams = {},
) {
  return useQuery({
    queryKey: remindersQueryKeys.list(customerId, params),
    queryFn: () => getCustomerReminders(customerId, params),
    enabled: !!customerId,
  });
}

function useInvalidateReminders(customerId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["customers", "detail", customerId, "reminders"],
    });
}

export function useCreateCustomerReminder(customerId: string) {
  const invalidate = useInvalidateReminders(customerId);
  return useMutation({
    mutationFn: (input?: CreateReminderInput) =>
      createCustomerReminder(customerId, input),
    onSuccess: invalidate,
  });
}

// Even a 502 (provider rejected/failed) still creates a ReminderLog row
// server-side — invalidate on both success and error so the reminder
// history refreshes and shows the failed attempt either way.
export function useSendCustomerReminderSms(customerId: string) {
  const invalidate = useInvalidateReminders(customerId);
  return useMutation({
    mutationFn: () => sendCustomerReminderSms(customerId),
    onSettled: invalidate,
  });
}

export function useSendCustomerReminderWhatsapp(customerId: string) {
  const invalidate = useInvalidateReminders(customerId);
  return useMutation({
    mutationFn: () => sendCustomerReminderWhatsapp(customerId),
    onSettled: invalidate,
  });
}
