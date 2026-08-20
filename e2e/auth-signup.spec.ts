import { test, expect } from "@playwright/test";
import { mockApi, jsonRoute, signInViaLocalStorage } from "./fixtures/api-mock";

test.describe("Signup", () => {
  test("keeps the Next button disabled until the account step is valid", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto("/signup");

    const next = page.getByRole("button", { name: "Next" });
    await expect(next).toBeDisabled();

    await page.getByPlaceholder("you@example.com").fill("new@example.com");
    await page.getByPlaceholder("••••••••").first().fill("Password123!");
    await expect(next).toBeDisabled();

    // Mismatched confirm password: still disabled, with inline feedback.
    await page.getByPlaceholder("••••••••").nth(1).fill("Different123!");
    await expect(next).toBeDisabled();
    await expect(page.getByText("Passwords don't match.")).toBeVisible();

    await page.getByPlaceholder("••••••••").nth(1).fill("Password123!");
    await expect(next).toBeEnabled();
  });

  test("registers, auto-logs in, and lands on the dashboard", async ({
    page,
  }) => {
    let registerBody: unknown;
    let loginBody: unknown;

    await mockApi(page, {
      "POST /user/register/": async (route) => {
        registerBody = route.request().postDataJSON();
        await jsonRoute(201, { id: "new-user-id", email: "new@example.com" })(
          route,
        );
      },
      "POST /auth/token/": async (route) => {
        loginBody = route.request().postDataJSON();
        await jsonRoute(200, {
          access: "new-access-token",
          refresh: "new-refresh-token",
        })(route);
      },
    });

    await page.goto("/signup");
    await page.getByPlaceholder("you@example.com").fill("new@example.com");
    await page.getByPlaceholder("••••••••").first().fill("Password123!");
    await page.getByPlaceholder("••••••••").nth(1).fill("Password123!");
    await page.getByRole("button", { name: "Next" }).click();

    await page
      .getByPlaceholder("e.g. Ram General Store")
      .fill("Ram General Store");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Account created")).toBeVisible();

    expect(registerBody).toMatchObject({
      email: "new@example.com",
      password: "Password123!",
      confirm_password: "Password123!",
      shop_name: "Ram General Store",
    });
    expect(loginBody).toEqual({
      email: "new@example.com",
      password: "Password123!",
    });
  });

  test("shows an error toast when registration fails", async ({ page }) => {
    await mockApi(page, {
      "POST /user/register/": jsonRoute(400, {
        email: ["A user with this email already exists."],
      }),
    });

    await page.goto("/signup");
    await page.getByPlaceholder("you@example.com").fill("taken@example.com");
    await page.getByPlaceholder("••••••••").first().fill("Password123!");
    await page.getByPlaceholder("••••••••").nth(1).fill("Password123!");
    await page.getByRole("button", { name: "Next" }).click();
    await page
      .getByPlaceholder("e.g. Ram General Store")
      .fill("Ram General Store");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Couldn't create account")).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("redirects an already-authenticated user away from /signup", async ({
    page,
  }) => {
    await mockApi(page);
    await signInViaLocalStorage(page);

    await page.goto("/signup");

    await expect(page).toHaveURL("/");
  });
});
