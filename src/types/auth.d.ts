interface LoginInput {
  email: string;
  password: string;
}

interface AuthTokenPair {
  access: string;
  refresh: string;
}

interface TokenRefreshInput {
  refresh: string;
}

interface TokenRefreshResponse {
  access: string;
}

interface TokenVerifyInput {
  token: string;
}

interface TokenBlacklistInput {
  refresh: string;
}
