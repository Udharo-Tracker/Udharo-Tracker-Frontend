import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export const profileQueryKeys = {
  detail: ["profile"] as const,
};

export function getProfile() {
  return apiClient.get<UserProfile>("/user/profile/");
}

export function updateProfile(input: UserProfileUpdateInput) {
  return apiClient.put<UserProfile>("/user/profile/", input);
}

export function patchProfile(input: UserProfileUpdateInput) {
  return apiClient.patch<UserProfile>("/user/profile/", input);
}

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKeys.detail,
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) =>
      queryClient.setQueryData(profileQueryKeys.detail, data),
  });
}

export function usePatchProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchProfile,
    onSuccess: (data) =>
      queryClient.setQueryData(profileQueryKeys.detail, data),
  });
}
