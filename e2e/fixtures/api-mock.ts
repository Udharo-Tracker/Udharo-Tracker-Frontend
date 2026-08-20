import type { Page, Route } from "@playwright/test";

// Mirrors src/api/client.ts's localStorage keys — kept in sync manually
// since the app doesn't export them.
export const ACCESS_TOKEN_KEY = "udharo_access_token";
export const REFRESH_TOKEN_KEY = "udharo_refresh_token";

export const MOCK_ACCESS_TOKEN = "mock-access-token";
export const MOCK_REFRESH_TOKEN = "mock-refresh-token";

type RouteHandler = (route: Route) => Promise<void> | void;

function json(status: number, body: unknown): RouteHandler {
  return (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
}

// Default, crash-free responses for the background queries the app layout
// and dashboard fire on every render (profile, shops, notifications,
// dashboard stats, udharo entries). Individual tests only need to override
// the auth endpoints they're exercising.
const DEFAULT_ROUTES: Record<string, RouteHandler> = {
  "GET /ledger/dashboard/": json(200, {
    total_credit_given: 0,
    total_recovered: 0,
    total_pending: 0,
    todays_udharo: 0,
    top_5_debtors: [],
  }),
  "GET /shop/": json(200, []),
  "GET /user/profile/": json(200, {
    id: "mock-user-id",
    email: "shopkeeper@example.com",
    first_name: "Test",
    last_name: "Shopkeeper",
    created_at: null,
    updated_at: null,
  }),
};

// Any GET without a specific override falls back to an empty list — every
// other endpoint the app polls in the background (notifications, udharo
// entries, transactions...) returns a bare array.
function fallback(method: string): RouteHandler {
  return method === "GET" ? json(200, []) : json(200, {});
}

/**
 * Intercepts every request under the API base path so tests run fully
 * offline, deterministic, and independent of whether a real backend
 * happens to be running. Pass `overrides` keyed as `"METHOD /path/"` (path
 * only, no query string) to control specific endpoints under test.
 */
export async function mockApi(
  page: Page,
  overrides: Record<string, RouteHandler> = {},
) {
  const routes = { ...DEFAULT_ROUTES, ...overrides };

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    // Route keys are relative to the API base path (e.g. "/auth/token/"),
    // matching what the app's own api client passes to fetch — strip the
    // "/api/v1" (or whatever version) prefix before looking up a handler.
    const path = url.pathname.replace(/^\/api\/v\d+/, "");
    const key = `${request.method()} ${path}`;

    const handler = routes[key] ?? fallback(request.method());
    await handler(route);
  });
}

export function jsonRoute(status: number, body: unknown): RouteHandler {
  return json(status, body);
}

/** Seeds localStorage with tokens before the app's first script runs. */
export async function signInViaLocalStorage(page: Page) {
  await page.addInitScript(
    ({ accessKey, refreshKey, access, refresh }) => {
      window.localStorage.setItem(accessKey, access);
      window.localStorage.setItem(refreshKey, refresh);
    },
    {
      accessKey: ACCESS_TOKEN_KEY,
      refreshKey: REFRESH_TOKEN_KEY,
      access: MOCK_ACCESS_TOKEN,
      refresh: MOCK_REFRESH_TOKEN,
    },
  );
}
