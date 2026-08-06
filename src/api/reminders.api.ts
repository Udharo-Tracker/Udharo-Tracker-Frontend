import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export const remindersQueryKeys = {
  list: (customerId: string) =>
    ["customers", "detail", customerId, "reminders"] as const,
};

export function getCustomerReminders(customerId: string) {
  return apiClient.get<ReminderLog[]>(`/customers/${customerId}/reminders/`);
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

export function useCustomerReminders(customerId: string) {
  return useQuery({
    queryKey: remindersQueryKeys.list(customerId),
    queryFn: () => getCustomerReminders(customerId),
    enabled: !!customerId,
  });
}

export function useCreateCustomerReminder(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: CreateReminderInput) =>
      createCustomerReminder(customerId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: remindersQueryKeys.list(customerId),
      }),
  });
}
