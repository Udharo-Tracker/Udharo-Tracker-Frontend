import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export const profileQueryKeys = {
  detail: ["profile"] as const,
};

// Profile writes go through FormData whenever a new picture file is
// attached, since the API expects multipart for file uploads; plain JSON
// otherwise.
function toProfilePayload(
  input: UserProfileUpdateInput,
): UserProfileUpdateInput | FormData {
  if (!(input.profile_picture instanceof File)) return input;

  const formData = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === "profile_picture") {
      formData.append("profile_picture", value as File);
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

export function getProfile() {
  return apiClient.get<UserProfile>("/user/profile/");
}

export function updateProfile(input: UserProfileUpdateInput) {
  return apiClient.put<UserProfile>("/user/profile/", toProfilePayload(input));
}

export function patchProfile(input: UserProfileUpdateInput) {
  return apiClient.patch<UserProfile>(
    "/user/profile/",
    toProfilePayload(input),
  );
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
