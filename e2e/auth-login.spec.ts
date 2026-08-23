import { test, expect } from "@playwright/test";
import {
  mockApi,
  jsonRoute,
  signInViaLocalStorage,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "./fixtures/api-mock";

test.describe("Login", () => {
  test("renders the sign-in form", async ({ page }) => {
    await mockApi(page);
    await page.goto("/login");

    await expect(page.getByText("UdharoTrack")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Forgot password?" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("blocks submission until email and password are filled in", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto("/login");

    await page.getByRole("button", { name: "Sign in" }).click();

    // Native HTML5 validation keeps the browser on /login — no login
    // request should have been attempted.
    await expect(page).toHaveURL(/\/login$/);
    const emailInput = page.getByPlaceholder("you@example.com");
    await expect(emailInput).toHaveJSProperty("validity.valid", false);
  });

  test("logs in with valid credentials and reaches the dashboard", async ({
    page,
  }) => {
    let loginRequestBody: unknown;

    await mockApi(page, {
      "POST /auth/token/": async (route) => {
        loginRequestBody = route.request().postDataJSON();
        await jsonRoute(200, {
          access: "new-access-token",
          refresh: "new-refresh-token",
        })(route);
      },
    });

    await page.goto("/login");
    await page
      .getByPlaceholder("you@example.com")
      .fill("shopkeeper@example.com");
    await page.getByPlaceholder("••••••••").fill("correct-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    expect(loginRequestBody).toEqual({
      email: "shopkeeper@example.com",
      password: "correct-password",
    });
    await expect
      .poll(() =>
        page.evaluate((k) => localStorage.getItem(k), ACCESS_TOKEN_KEY),
      )
      .toBe("new-access-token");
    await expect
      .poll(() =>
        page.evaluate((k) => localStorage.getItem(k), REFRESH_TOKEN_KEY),
      )
      .toBe("new-refresh-token");
  });

  test("shows an error toast on invalid credentials and stays on the page", async ({
    page,
  }) => {
    await mockApi(page, {
      "POST /auth/token/": jsonRoute(401, {
        detail: "No active account found with the given credentials",
      }),
    });

    await page.goto("/login");
    await page
      .getByPlaceholder("you@example.com")
      .fill("shopkeeper@example.com");
    await page.getByPlaceholder("••••••••").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Login failed")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    expect(
      await page.evaluate((k) => localStorage.getItem(k), ACCESS_TOKEN_KEY),
    ).toBeNull();
  });

  test("redirects an already-authenticated user away from /login", async ({
    page,
  }) => {
    await mockApi(page);
    await signInViaLocalStorage(page);

    await page.goto("/login");

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
  });

  test("opens the resend-verification modal and submits an email", async ({
    page,
  }) => {
    let resendRequestBody: unknown;
    await mockApi(page, {
      "POST /user/verify-email/resend/": async (route) => {
        resendRequestBody = route.request().postDataJSON();
        await jsonRoute(200, {
          message: "If that email is registered, a link has been sent.",
        })(route);
      },
    });

    await page.goto("/login");
    await page
      .getByPlaceholder("you@example.com")
      .fill("unverified@example.com");
    await page
      .getByRole("button", { name: "Resend verification email" })
      .click();

    const modal = page.getByRole("dialog", {
      name: "Resend verification email",
    });
    await expect(modal).toBeVisible();
    await expect(modal.getByPlaceholder("you@example.com")).toHaveValue(
      "unverified@example.com",
    );

    await modal.getByRole("button", { name: "Send link" }).click();

    await expect(modal.getByText(/check your inbox/i)).toBeVisible();
    expect(resendRequestBody).toEqual({ email: "unverified@example.com" });
  });
});
