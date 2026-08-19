import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  clearAuthTokens,
  getRefreshToken,
  setAuthTokens,
} from "./client";
import { useAuth } from "@/hooks/use-auth";

export function login(input: LoginInput) {
  return apiClient.post<AuthTokenPair>("/auth/token/", input, { auth: false });
}

export function refreshToken(input: TokenRefreshInput) {
  return apiClient.post<TokenRefreshResponse>("/auth/token/refresh/", input, {
    auth: false,
  });
}

export function verifyToken(input: TokenVerifyInput) {
  return apiClient.post<TokenVerifyInput>("/auth/token/verify/", input, {
    auth: false,
  });
}

export function blacklistToken(input: TokenBlacklistInput) {
  return apiClient.post<TokenBlacklistInput>("/auth/token/blacklist/", input);
}

export function register(input: UserRegisterInput) {
  return apiClient.post<UserProfile>("/user/register/", input, { auth: false });
}

// Confirms the link from the registration email and activates the account —
// login returns 401 until this succeeds. uid/token come off the query
// string of the emailed link.
export function verifyEmail(input: EmailVerifyConfirmInput) {
  return apiClient.post<MessageResponse>("/user/verify-email/", input, {
    auth: false,
  });
}

// Always 200 regardless of whether the email exists or is already
// verified — don't use the response to decide what to show, just show a
// static "check your inbox" state. Shares a rate-limit bucket (5/hour) with
// forgot-password.
export function resendVerificationEmail(input: ResendVerificationEmailInput) {
  return apiClient.post<MessageResponse>("/user/verify-email/resend/", input, {
    auth: false,
  });
}

// Always 200 regardless of whether the email belongs to an account — same
// "don't leak account existence" shape as resend-verification.
export function forgotPassword(input: UserForgotPasswordInput) {
  return apiClient.post<MessageResponse>("/user/forgot-password/", input, {
    auth: false,
  });
}

export function resetPassword(input: UserPasswordResetInput) {
  return apiClient.post<MessageResponse>("/user/password/reset/", input, {
    auth: false,
  });
}

export function changePassword(input: UserChangePasswordInput) {
  return apiClient.put<UserChangePasswordInput>(
    "/user/change-password/",
    input,
  );
}

export function useLogin() {
  const { setIsAuthenticated } = useAuth();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthTokens(data.access, data.refresh);
      setIsAuthenticated(true);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { setIsAuthenticated } = useAuth();
  return useMutation({
    mutationFn: () => {
      const refresh = getRefreshToken();
      return refresh ? blacklistToken({ refresh }) : Promise.resolve(undefined);
    },
    onSettled: () => {
      clearAuthTokens();
      queryClient.clear();
      setIsAuthenticated(false);
    },
  });
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: verifyEmail });
}

export function useResendVerificationEmail() {
  return useMutation({ mutationFn: resendVerificationEmail });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
