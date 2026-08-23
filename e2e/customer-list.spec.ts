import { test, expect } from "@playwright/test";
import { mockApi, jsonRoute, signInViaLocalStorage } from "./fixtures/api-mock";

// Mirrors src/lib/currency.ts's npr() — kept in sync manually since the app
// doesn't export a test-friendly formatter.
function npr(amount: number): string {
  return `रु ${amount.toLocaleString("en-NP")}`;
}

const summary: LedgerSummary = {
  total_outstanding: 18000,
  customers_summary: [
    {
      id: "cust-1",
      name: "Ram Bahadur",
      phone: "9800000001",
      total_udharo: 5000,
      total_paid: 2000,
      outstanding_balance: 3000,
      last_transaction: null,
      risk: "green",
    },
    {
      id: "cust-2",
      name: "Sita Gurung",
      phone: "9800000002",
      total_udharo: 20000,
      total_paid: 5000,
      outstanding_balance: 15000,
      last_transaction: "2026-08-10T00:00:00Z",
      risk: "red",
    },
    {
      id: "cust-3",
      name: "Hari Thapa",
      phone: "9800000003",
      total_udharo: 1000,
      total_paid: 1000,
      outstanding_balance: 0,
      last_transaction: null,
      risk: "yellow",
    },
  ],
};

const customerDetail: CustomerDetail = {
  id: "cust-1",
  name: "Ram Bahadur",
  phone: "9800000001",
  email: "ram@example.com",
  address: "Baneshwor, Kathmandu",
  credit_limit: "10000",
  block_over_credit_limit: false,
  credit_term_days: 15,
  loyalty_discount: "5",
  created_at: "2026-01-15T00:00:00Z",
  ledger_summary: {
    opening_balance: "0",
    total_udharo: "5000",
    total_paid: "2000",
    outstanding_balance: "3000",
  },
};

test.describe("Customers list", () => {
  test("renders stat cards and rows from the ledger summary", async ({
    page,
  }) => {
    await mockApi(page, { "GET /ledger/summary/": jsonRoute(200, summary) });
    await signInViaLocalStorage(page);
    await page.goto("/customers");

    await expect(
      page.getByRole("heading", { name: "Customers" }),
    ).toBeVisible();

    await expect(
      page.locator(".ant-card", { hasText: "Total customers" }),
    ).toContainText("3");
    await expect(
      page.locator(".ant-card", { hasText: "Total due" }),
    ).toContainText(npr(18000));
    // .first(): "High risk" also appears as a risk-badge label inside the
    // table's own Panel further down the page.
    await expect(
      page.locator(".ant-card", { hasText: "High risk" }).first(),
    ).toContainText("1");

    const ramRow = page.getByRole("row", { name: /Ram Bahadur/ });
    await expect(ramRow).toContainText("Low risk");
    await expect(ramRow).toContainText(npr(3000));

    const sitaRow = page.getByRole("row", { name: /Sita Gurung/ });
    await expect(sitaRow).toContainText("High risk");

    const hariRow = page.getByRole("row", { name: /Hari Thapa/ });
    await expect(hariRow).toContainText("Medium");
  });

  test("search filters the table by name or phone", async ({ page }) => {
    await mockApi(page, { "GET /ledger/summary/": jsonRoute(200, summary) });
    await signInViaLocalStorage(page);
    await page.goto("/customers");

    // The search box is collapsed behind an icon-only toggle button until
    // focused/expanded.
    await page.locator("button:has(svg.lucide-search)").click();
    await page.getByPlaceholder("Search by name/phone…").fill("9800000002");

    await expect(page.getByText("Sita Gurung")).toBeVisible();
    await expect(page.getByText("Ram Bahadur")).toHaveCount(0);
    await expect(page.getByText("Hari Thapa")).toHaveCount(0);
  });

  test("risk filter narrows the table, Clear resets it", async ({ page }) => {
    await mockApi(page, { "GET /ledger/summary/": jsonRoute(200, summary) });
    await signInViaLocalStorage(page);
    await page.goto("/customers");

    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("checkbox", { name: "High risk" }).check();

    await expect(page.getByText("Sita Gurung")).toBeVisible();
    await expect(page.getByText("Ram Bahadur")).toHaveCount(0);
    await expect(page.getByText("Hari Thapa")).toHaveCount(0);

    await page.getByText("Clear").click();

    await expect(page.getByText("Ram Bahadur")).toBeVisible();
    await expect(page.getByText("Hari Thapa")).toBeVisible();
  });

  test("requires name and phone, then creates a customer", async ({ page }) => {
    let createBody: unknown;
    await mockApi(page, {
      "GET /ledger/summary/": jsonRoute(200, {
        total_outstanding: 0,
        customers_summary: [],
      }),
      "POST /customers/": async (route) => {
        createBody = route.request().postDataJSON();
        await jsonRoute(201, { ...customerDetail, id: "new-cust" })(route);
      },
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers");
    await page.getByRole("button", { name: "Add customer" }).click();

    const modal = page.getByRole("dialog", { name: "Add customer" });
    await expect(modal).toBeVisible();

    // Submitting empty required fields shows inline errors and makes no
    // request.
    await modal.getByRole("button", { name: "Add customer" }).click();
    await expect(modal.getByText("Please enter customer name")).toBeVisible();
    await expect(modal.getByText("Please enter phone number")).toBeVisible();
    expect(createBody).toBeUndefined();

    await modal.getByPlaceholder("e.g. Ram Bahadur").fill("Gita Shrestha");
    await modal.getByPlaceholder("98xxxxxxxx").fill("9811111111");
    await modal.getByRole("button", { name: "Add customer" }).click();

    await expect(page.getByText("Customer added")).toBeVisible();
    await expect(page).toHaveURL(/\/customers$/);
    expect(createBody).toMatchObject({
      name: "Gita Shrestha",
      phone: "9811111111",
      credit_limit: "0",
      block_over_credit_limit: false,
      credit_term_days: 0,
      loyalty_discount: "0",
      opening_balance: "0",
    });
  });

  test("edits a customer via the row menu", async ({ page }) => {
    let updateBody: unknown;
    await mockApi(page, {
      "GET /ledger/summary/": jsonRoute(200, summary),
      "GET /customers/cust-1/": jsonRoute(200, customerDetail),
      "PUT /customers/cust-1/": async (route) => {
        updateBody = route.request().postDataJSON();
        await jsonRoute(200, { ...customerDetail, name: "Ram B. Updated" })(
          route,
        );
      },
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers");
    const row = page.getByRole("row", { name: /Ram Bahadur/ });
    // The row's "..." menu trigger is icon-only (no accessible name) —
    // it's the only button in the row.
    await row.locator("button").click();
    await page.getByRole("menuitem", { name: "Edit customer" }).click();

    const modal = page.getByRole("dialog", { name: "Edit customer" });
    await expect(modal.getByPlaceholder("e.g. Ram Bahadur")).toHaveValue(
      "Ram Bahadur",
    );

    await modal.getByPlaceholder("e.g. Ram Bahadur").fill("Ram B. Updated");
    await modal.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Customer updated")).toBeVisible();
    expect(updateBody).toMatchObject({
      name: "Ram B. Updated",
      phone: "9800000001",
    });
  });

  test("deletes a customer via the row menu", async ({ page }) => {
    let deleteCalled = false;
    await mockApi(page, {
      "GET /ledger/summary/": jsonRoute(200, summary),
      "DELETE /customers/cust-1/": async (route) => {
        deleteCalled = true;
        await jsonRoute(200, {})(route);
      },
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers");
    const row = page.getByRole("row", { name: /Ram Bahadur/ });
    await row.locator("button").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    const confirmDialog = page.getByRole("dialog", {
      name: "Delete Ram Bahadur?",
    });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Customer deleted")).toBeVisible();
    expect(deleteCalled).toBe(true);
  });

  test("shows an error alert when the summary fails to load", async ({
    page,
  }) => {
    await mockApi(page, {
      "GET /ledger/summary/": jsonRoute(500, { detail: "Server error" }),
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers");

    await expect(
      page.getByRole("heading", { name: "Customers" }),
    ).toBeVisible();
    // react-query retries a failed query 3x with backoff before it
    // surfaces as an error, so give this more room than the default 5s.
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
  });
});
