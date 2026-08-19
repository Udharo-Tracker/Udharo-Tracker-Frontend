const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

const ACCESS_TOKEN_KEY = "udharo_access_token";
const REFRESH_TOKEN_KEY = "udharo_refresh_token";

// Dispatched whenever a request can't be authenticated and refreshing the
// access token didn't fix it, so the app can react (e.g. redirect to /login).
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// DRF error bodies vary by endpoint: {"non_field_errors": [...]}, a
// field-specific {"password": [...]}, {"detail": "..."}, or the "always
// 200" endpoints that don't error at all. Pulls out the first usable string
// so forms can show the actual reason (e.g. the credit-limit message)
// instead of a generic "Bad Request" from res.statusText.
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (
    error instanceof ApiError &&
    error.data &&
    typeof error.data === "object"
  ) {
    const data = error.data as Record<string, unknown>;
    for (const key of ["detail", "message", "non_field_errors"]) {
      const value = data[key];
      if (typeof value === "string") return value;
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    }
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
      if (typeof value === "string") return value;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) {
          clearAuthTokens();
          return null;
        }
        const data = (await res.json()) as { access: string };
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        return data.access;
      })
      .catch(() => {
        clearAuthTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const isFormData = body instanceof FormData;

  const headers = new Headers();
  if (!isFormData) headers.set("Content-Type", "application/json");
  if (auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  if (res.status === 401 && auth) {
    if (!isRetry && getRefreshToken()) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return request<T>(path, options, true);
      }
    }
    clearAuthTokens();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  if (!res.ok) {
    const data = await res.json().catch(() => undefined);
    throw new ApiError(res.statusText || "Request failed", res.status, data);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  // A handful of endpoints (e.g. mark-all-read) reply 200 with an empty
  // body instead of 204 — read as text first so those don't blow up on
  // `res.json()`'s "Unexpected end of JSON input".
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// PDF export endpoints reply with a raw binary rather than JSON, so they
// can't go through `request()`'s res.json() handling. Mirrors request()'s
// auth-header + refresh-on-401 behavior, but resolves to the blob plus the
// filename the server suggested via Content-Disposition.
export interface BlobResult {
  blob: Blob;
  filename: string;
}

function filenameFromContentDisposition(
  header: string | null,
  fallback: string,
): string {
  const match = header
    ? /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header)
    : null;
  return match ? decodeURIComponent(match[1]) : fallback;
}

export async function requestBlob(
  path: string,
  fallbackFilename: string,
  isRetry = false,
): Promise<BlobResult> {
  const headers = new Headers();
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { headers });

  if (res.status === 401) {
    if (!isRetry && getRefreshToken()) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return requestBlob(path, fallbackFilename, true);
      }
    }
    clearAuthTokens();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  const contentType = res.headers.get("Content-Type") ?? "";
  // A validation failure (missing year, bad month) comes back as a normal
  // JSON 400, not a PDF — check Content-Type rather than assuming a binary
  // body just because the status is 200.
  if (!res.ok || !contentType.includes("application/pdf")) {
    const data = await res.json().catch(() => undefined);
    throw new ApiError(res.statusText || "Request failed", res.status, data);
  }

  const blob = await res.blob();
  const filename = filenameFromContentDisposition(
    res.headers.get("Content-Disposition"),
    fallbackFilename,
  );
  return { blob, filename };
}

// Triggers a browser "Save As" for an in-memory blob — used for the PDF
// export endpoints, which the app fetches with the auth header attached
// rather than linking straight at the URL.
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(path, { ...options, method: "POST", body }),
  put: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(path, { ...options, method: "DELETE" }),
};
