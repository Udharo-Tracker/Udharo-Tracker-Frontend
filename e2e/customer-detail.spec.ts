import { test, expect } from "@playwright/test";
import { mockApi, jsonRoute, signInViaLocalStorage } from "./fixtures/api-mock";

// Mirrors src/lib/currency.ts and src/utils/date.ts — kept in sync manually
// since the app doesn't export test-friendly formatters.
function npr(amount: number): string {
  return `रु ${amount.toLocaleString("en-NP")}`;
}
function formatDateOnly(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

const creditScore: CreditScore = {
  id: "cs-1",
  customer: "cust-1",
  calculated_at: "2026-08-01T00:00:00Z",
  score: 78,
  risk_level: "green",
};

const transactions: TransactionListItem[] = [
  {
    id: "txn-1",
    created_at: "2026-08-01T00:00:00Z",
    transaction_date: "2026-08-01T00:00:00Z",
    txn_number: "TXN-0001",
    title: "Grocery udharo",
    type: "udharo",
    transaction_credit: "0",
    transaction_debit: "3000",
    closing_balance_credit: "0",
    closing_balance_debit: "3000",
  },
];

const reminders: ReminderLog[] = [
  {
    id: "rem-1",
    customer: "cust-1",
    sent_at: "2026-08-15T10:00:00Z",
    note: "Called, promised to pay Friday",
    outstanding_balance: "3000",
    channel: "sms",
    delivery_status: "sent",
  },
];

// Base mocks needed on every visit to /customers/cust-1 — individual tests
// override only the endpoints they're exercising.
const baseRoutes = {
  "GET /customers/cust-1/": jsonRoute(200, customerDetail),
  "GET /customers/cust-1/credit-score/": jsonRoute(404, {
    detail: "Not found",
  }),
  "GET /customers/cust-1/credit-score/history/": jsonRoute(200, []),
  "GET /ledger/transactions/": jsonRoute(200, []),
  "GET /customers/cust-1/reminders/": jsonRoute(200, []),
};

test.describe("Customer detail", () => {
  test("renders the customer header, profile stats, and details panel", async ({
    page,
  }) => {
    await mockApi(page, {
      ...baseRoutes,
      "GET /customers/cust-1/credit-score/": jsonRoute(200, creditScore),
      "GET /customers/cust-1/credit-score/history/": jsonRoute(200, [
        creditScore,
      ]),
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");

    await expect(
      page.getByRole("heading", { name: "Ram Bahadur" }),
    ).toBeVisible();
    await expect(
      page.getByText(`Joined ${formatDateOnly(customerDetail.created_at)}`),
    ).toBeVisible();
    // .first(): the phone also appears in the Customer Details panel below.
    await expect(page.getByText("9800000001").first()).toBeVisible();

    // .first(): "Credit score" also appears in the "Credit score history"
    // panel's heading further down the page.
    await expect(
      page.locator(".ant-card", { hasText: "Credit score" }).first(),
    ).toContainText("78 / 100");
    await expect(
      page.locator(".ant-card", { hasText: "Outstanding balance" }),
    ).toContainText(npr(3000));
    await expect(
      page.locator(".ant-card", { hasText: "Total udharo" }),
    ).toContainText(npr(5000));
    await expect(
      page.locator(".ant-card", { hasText: "Total paid" }),
    ).toContainText(npr(2000));

    const detailsPanel = page.locator(".ant-card", {
      hasText: "Customer Details",
    });
    await expect(detailsPanel).toContainText("ram@example.com");
    await expect(detailsPanel).toContainText("Baneshwor, Kathmandu");
    await expect(detailsPanel).toContainText("5%");
  });

  test("shows a dash for credit score before it's been calculated", async ({
    page,
  }) => {
    await mockApi(page, baseRoutes);

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");

    await expect(
      page.locator(".ant-card", { hasText: "Credit score" }).first(),
    ).toContainText("—");
    await expect(page.getByText("No credit score history yet.")).toBeVisible();
  });

  test("renders ledger transactions in the Transactions tab", async ({
    page,
  }) => {
    await mockApi(page, {
      ...baseRoutes,
      "GET /ledger/transactions/": jsonRoute(200, transactions),
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");
    await page.getByRole("tab", { name: "Transactions" }).click();

    const txnRow = page.getByRole("row", { name: /TXN-0001/ });
    await expect(txnRow).toContainText("Grocery udharo");
    await expect(txnRow).toContainText(npr(3000));
  });

  test("renders reminder history and opens the reminder detail drawer", async ({
    page,
  }) => {
    await mockApi(page, {
      ...baseRoutes,
      "GET /customers/cust-1/reminders/": jsonRoute(200, reminders),
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");
    await page.getByRole("tab", { name: "Reminders" }).click();

    const reminderRow = page.getByRole("row", {
      name: /Called, promised to pay Friday/,
    });
    await expect(reminderRow).toBeVisible();
    await reminderRow.click();

    const drawer = page.getByRole("dialog", { name: "Reminder details" });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("SMS reminder");
    await expect(drawer).toContainText(npr(3000));
    await expect(drawer).toContainText("Called, promised to pay Friday");
  });

  test("logs a reminder via the Log reminder modal", async ({ page }) => {
    let createReminderBody: unknown;
    await mockApi(page, {
      ...baseRoutes,
      "POST /customers/cust-1/reminders/": async (route) => {
        createReminderBody = route.request().postDataJSON();
        await jsonRoute(201, {
          id: "rem-new",
          customer: "cust-1",
          sent_at: "2026-08-16T00:00:00Z",
          note: "Follow up next week",
          outstanding_balance: "3000",
          channel: "note",
          delivery_status: "sent",
        })(route);
      },
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");
    await page.getByRole("tab", { name: "Reminders" }).click();
    await page.getByRole("button", { name: "Log reminder" }).click();

    const modal = page.getByRole("dialog", { name: "Log a reminder" });
    await modal
      .getByPlaceholder("e.g. called, promised to pay Friday…")
      .fill("Follow up next week");
    await modal.getByRole("button", { name: "Log reminder" }).click();

    await expect(page.getByText("Reminder logged")).toBeVisible();
    expect(createReminderBody).toEqual({ note: "Follow up next week" });
  });

  test("sends a quick SMS reminder", async ({ page }) => {
    await mockApi(page, {
      ...baseRoutes,
      "POST /customers/cust-1/reminders/sms/": jsonRoute(200, {
        id: "rem-sms",
        customer: "cust-1",
        sent_at: "2026-08-16T00:00:00Z",
        note: "",
        outstanding_balance: "3000",
        channel: "sms",
        delivery_status: "sent",
      }),
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");
    await page.getByRole("tab", { name: "Reminders" }).click();
    await page.getByRole("button", { name: "Send SMS" }).click();

    await expect(page.getByText("SMS reminder sent")).toBeVisible();
  });

  test("shows a warning toast when a reminder fails to deliver", async ({
    page,
  }) => {
    await mockApi(page, {
      ...baseRoutes,
      "POST /customers/cust-1/reminders/whatsapp/": jsonRoute(200, {
        id: "rem-wa",
        customer: "cust-1",
        sent_at: "2026-08-16T00:00:00Z",
        note: "",
        outstanding_balance: "3000",
        channel: "whatsapp",
        delivery_status: "failed",
      }),
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");
    await page.getByRole("tab", { name: "Reminders" }).click();
    await page.getByRole("button", { name: "Send WhatsApp" }).click();

    await expect(
      page.getByText(
        "WhatsApp reminder logged, but the provider failed to deliver it.",
      ),
    ).toBeVisible();
  });

  test("edits the customer from the detail page", async ({ page }) => {
    let updateBody: unknown;
    await mockApi(page, {
      ...baseRoutes,
      "PUT /customers/cust-1/": async (route) => {
        updateBody = route.request().postDataJSON();
        await jsonRoute(200, { ...customerDetail, address: "New Baneshwor" })(
          route,
        );
      },
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");
    await page.getByRole("button", { name: "Edit", exact: true }).click();

    const modal = page.getByRole("dialog", { name: "Edit customer" });
    await modal
      .getByPlaceholder("e.g. Baneshwor, Kathmandu")
      .fill("New Baneshwor");
    await modal.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Customer updated")).toBeVisible();
    expect(updateBody).toMatchObject({ address: "New Baneshwor" });
  });

  test("deletes the customer from the detail page and redirects to /customers", async ({
    page,
  }) => {
    let deleteCalled = false;
    await mockApi(page, {
      ...baseRoutes,
      "GET /ledger/summary/": jsonRoute(200, {
        total_outstanding: 0,
        customers_summary: [],
      }),
      "DELETE /customers/cust-1/": async (route) => {
        deleteCalled = true;
        await jsonRoute(200, {})(route);
      },
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");
    // The delete button is icon-only (no accessible name) — target it by
    // its lucide icon class, the only trash icon on the page.
    await page.locator("button:has(svg.lucide-trash-2)").click();

    const confirmDialog = page.getByRole("dialog", {
      name: "Delete this customer?",
    });
    await confirmDialog.getByRole("button", { name: "Delete" }).click();

    await expect(page).toHaveURL(/\/customers$/);
    await expect(page.getByText("Customer deleted")).toBeVisible();
    expect(deleteCalled).toBe(true);
  });

  test("shows an error state when the customer fails to load, with a working back link", async ({
    page,
  }) => {
    await mockApi(page, {
      "GET /customers/cust-1/": jsonRoute(404, { detail: "Not found" }),
      "GET /ledger/summary/": jsonRoute(200, {
        total_outstanding: 0,
        customers_summary: [],
      }),
    });

    await signInViaLocalStorage(page);
    await page.goto("/customers/cust-1");

    // react-query retries a failed query 3x with backoff before it
    // surfaces as an error, so give this more room than the default 5s.
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("link", { name: "Back to customers" }).click();
    await expect(page).toHaveURL(/\/customers$/);
  });
});
