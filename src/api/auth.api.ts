import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, clearAuthTokens, getRefreshToken, setAuthTokens } from "./client";
import { useAuth } from "@/hooks/use-auth";
import type {
  AuthTokenPair,
  LoginInput,
  TokenBlacklistInput,
  TokenRefreshInput,
  TokenRefreshResponse,
  TokenVerifyInput,
} from "@/types/auth";
import type {
  UserChangePasswordInput,
  UserForgotPasswordInput,
  UserPasswordResetInput,
  UserRegisterInput,
} from "@/types/user";
import type { UserProfile } from "@/types/user";

export function login(input: LoginInput) {
  return apiClient.post<AuthTokenPair>("/auth/token/", input, { auth: false });
}

export function refreshToken(input: TokenRefreshInput) {
  return apiClient.post<TokenRefreshResponse>("/auth/token/refresh/", input, { auth: false });
}

export function verifyToken(input: TokenVerifyInput) {
  return apiClient.post<TokenVerifyInput>("/auth/token/verify/", input, { auth: false });
}

export function blacklistToken(input: TokenBlacklistInput) {
  return apiClient.post<TokenBlacklistInput>("/auth/token/blacklist/", input);
}

export function register(input: UserRegisterInput) {
  return apiClient.post<UserProfile>("/user/register/", input, { auth: false });
}

export function forgotPassword(input: UserForgotPasswordInput) {
  return apiClient.post<UserForgotPasswordInput>("/user/forgot-password/", input, { auth: false });
}

export function resetPassword(input: UserPasswordResetInput) {
  return apiClient.post<UserPasswordResetInput>("/user/password/reset/", input, { auth: false });
}

export function changePassword(input: UserChangePasswordInput) {
  return apiClient.put<UserChangePasswordInput>("/user/change-password/", input);
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

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
