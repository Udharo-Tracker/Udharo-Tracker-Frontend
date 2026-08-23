import { test, expect } from "@playwright/test";
import {
  mockApi,
  jsonRoute,
  signInViaLocalStorage,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "./fixtures/api-mock";

test.describe("Protected routes", () => {
  test("redirects an unauthenticated visitor to /login", async ({ page }) => {
    await mockApi(page);

    await page.goto("/customers");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("UdharoTrack")).toBeVisible();
  });

  test("returns to the originally requested page after signing in", async ({
    page,
  }) => {
    await mockApi(page, {
      "POST /auth/token/": jsonRoute(200, {
        access: "new-access-token",
        refresh: "new-refresh-token",
      }),
    });

    await page.goto("/customers");
    await expect(page).toHaveURL(/\/login$/);

    await page
      .getByPlaceholder("you@example.com")
      .fill("shopkeeper@example.com");
    await page.getByPlaceholder("••••••••").fill("correct-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/customers");
  });

  test("lets an authenticated user reach a protected page directly", async ({
    page,
  }) => {
    await mockApi(page);
    await signInViaLocalStorage(page);

    await page.goto("/customers");

    await expect(page).toHaveURL("/customers");
    // The account menu only renders inside the authenticated app shell —
    // confirms we're past ProtectedRoute, not sitting on the login page.
    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).toBeVisible();
  });

  test("logs out, clears tokens, and returns to /login", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/token/blacklist/": jsonRoute(200, {}),
    });
    await signInViaLocalStorage(page);

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();

    await expect(page).toHaveURL(/\/login$/);
    expect(
      await page.evaluate((k) => localStorage.getItem(k), ACCESS_TOKEN_KEY),
    ).toBeNull();
    expect(
      await page.evaluate((k) => localStorage.getItem(k), REFRESH_TOKEN_KEY),
    ).toBeNull();
  });

  test("session-expired event bounces the user back to /login", async ({
    page,
  }) => {
    await mockApi(page, {
      // Simulate the access token having expired server-side with no
      // refresh token available in the browser, so refreshAccessToken()
      // short-circuits and the client raises the session-expired event.
      "GET /notifications/": jsonRoute(401, {
        detail: "Authentication credentials were not provided.",
      }),
    });
    await page.addInitScript(() => {
      window.localStorage.setItem("udharo_access_token", "expired-token");
    });

    await page.goto("/");

    // The 401 fires the session-expired event almost immediately, so the
    // dashboard may only ever render for a moment (or not at all) before
    // ProtectedRoute bounces back to /login — assert on the end state.
    await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });
    expect(
      await page.evaluate((k) => localStorage.getItem(k), ACCESS_TOKEN_KEY),
    ).toBeNull();
  });
});
