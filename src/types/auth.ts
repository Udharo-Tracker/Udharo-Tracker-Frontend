export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokenPair {
  access: string;
  refresh: string;
}

export interface TokenRefreshInput {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface TokenVerifyInput {
  token: string;
}

export interface TokenBlacklistInput {
  refresh: string;
}
