import { test, expect } from "@playwright/test";
import { mockApi, jsonRoute, signInViaLocalStorage } from "./fixtures/api-mock";

function npr(amount: number): string {
  return `रु ${amount.toLocaleString("en-NP")}`;
}

const ramBahadur: Customer = {
  id: "cust-1",
  name: "Ram Bahadur",
  phone: "9800000001",
  email: "",
  address: "",
  credit_limit: "0",
  block_over_credit_limit: false,
  credit_term_days: 0,
  loyalty_discount: "0",
  opening_balance: "0",
  created_at: "2026-01-01T00:00:00Z",
};

const sitaGurung: Customer = {
  ...ramBahadur,
  id: "cust-2",
  name: "Sita Gurung",
  phone: "9800000002",
};

const payments: Payment[] = [
  {
    id: "pay-1",
    customer: ramBahadur,
    amount_paid: "500",
    payment_mode: "cash",
    reference: "",
    note: "",
    created_at: "2026-08-05T00:00:00Z",
  },
  {
    id: "pay-2",
    customer: sitaGurung,
    amount_paid: "1000",
    payment_mode: "bank_transfer",
    reference: "REF123",
    note: "Salary payment",
    created_at: "2026-08-01T00:00:00Z",
  },
];

test.describe("Payments list", () => {
  test("renders payments with amounts from the payments list", async ({
    page,
  }) => {
    await mockApi(page, { "GET /payments/": jsonRoute(200, payments) });
    await signInViaLocalStorage(page);
    await page.goto("/payments");

    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
    await expect(page.getByText("2 recorded")).toBeVisible();

    const ramRow = page.getByRole("row", { name: /Ram Bahadur/ });
    await expect(ramRow).toContainText(npr(500));

    const sitaRow = page.getByRole("row", { name: /Sita Gurung/ });
    await expect(sitaRow).toContainText("Salary payment");
    await expect(sitaRow).toContainText(npr(1000));
  });

  test("search filters the table by note or reference", async ({ page }) => {
    await mockApi(page, { "GET /payments/": jsonRoute(200, payments) });
    await signInViaLocalStorage(page);
    await page.goto("/payments");

    await page.locator("button:has(svg.lucide-search)").click();
    await page
      .getByPlaceholder("Search by customer, note, or reference…")
      .fill("REF123");

    await expect(page.getByText("Sita Gurung")).toBeVisible();
    await expect(page.getByText("Ram Bahadur")).toHaveCount(0);
  });

  test("payment mode filter narrows the table, Clear resets it", async ({
    page,
  }) => {
    await mockApi(page, { "GET /payments/": jsonRoute(200, payments) });
    await signInViaLocalStorage(page);
    await page.goto("/payments");

    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("checkbox", { name: "Bank Transfer" }).check();

    await expect(page.getByText("Sita Gurung")).toBeVisible();
    await expect(page.getByText("Ram Bahadur")).toHaveCount(0);

    await page.getByText("Clear").click();

    await expect(page.getByText("Ram Bahadur")).toBeVisible();
    await expect(page.getByText("Sita Gurung")).toBeVisible();
  });

  test("requires a positive amount, then records a payment", async ({
    page,
  }) => {
    let createBody: unknown;
    await mockApi(page, {
      "GET /payments/": jsonRoute(200, []),
      "GET /customers/": jsonRoute(200, [ramBahadur, sitaGurung]),
      "GET /ledger/summary/": jsonRoute(200, {
        total_outstanding: 3000,
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
        ],
      }),
      "POST /payments/": async (route) => {
        createBody = route.request().postDataJSON();
        await jsonRoute(201, { ...payments[0], id: "pay-new" })(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/payments");

    await page.getByRole("button", { name: "Record payment" }).click();
    const modal = page.getByRole("dialog", { name: "Record payment" });
    await expect(modal).toBeVisible();

    const combobox = modal.getByPlaceholder(
      "Search customer by name or phone…",
    );
    await combobox.click();
    await combobox.fill("Ram");
    await modal.getByRole("button", { name: /Ram Bahadur/ }).click();

    // Selecting the customer surfaces their current outstanding balance.
    await expect(modal.getByText("Current outstanding")).toBeVisible();
    await expect(modal.getByText(npr(3000))).toBeVisible();

    await modal.getByRole("button", { name: "Confirm payment" }).click();
    await expect(modal.getByText("Please enter an amount")).toBeVisible();
    expect(createBody).toBeUndefined();

    await modal.getByPlaceholder("0").fill("0");
    await modal.getByRole("button", { name: "Confirm payment" }).click();
    await expect(
      modal.getByText("Amount must be greater than 0"),
    ).toBeVisible();
    expect(createBody).toBeUndefined();

    await modal.getByPlaceholder("0").fill("500");
    await modal.getByRole("button", { name: "Confirm payment" }).click();

    await expect(
      page.getByText(`${npr(500)} received from Ram Bahadur`),
    ).toBeVisible();
    expect(createBody).toMatchObject({
      customer_id: "cust-1",
      amount_paid: "500",
    });
  });

  test("edits a payment via the row menu", async ({ page }) => {
    let updateBody: unknown;
    await mockApi(page, {
      "GET /payments/": jsonRoute(200, payments),
      "GET /payments/pay-1/": jsonRoute(200, payments[0]),
      "PUT /payments/pay-1/": async (route) => {
        updateBody = route.request().postDataJSON();
        await jsonRoute(200, { ...payments[0], amount_paid: "600" })(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/payments");

    const row = page.getByRole("row", { name: /Ram Bahadur/ });
    await row.locator("button").click();
    await page.getByRole("menuitem", { name: "Edit payment" }).click();

    const modal = page.getByRole("dialog", { name: "Edit payment" });
    await expect(modal.getByPlaceholder("0")).toHaveValue("500");
    await modal.getByPlaceholder("0").fill("600");
    await modal.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Payment updated")).toBeVisible();
    expect(updateBody).toMatchObject({
      customer_id: "cust-1",
      amount_paid: "600",
    });
  });

  test("deletes a payment via the row menu", async ({ page }) => {
    let deleteCalled = false;
    await mockApi(page, {
      "GET /payments/": jsonRoute(200, payments),
      "DELETE /payments/pay-1/": async (route) => {
        deleteCalled = true;
        await jsonRoute(200, {})(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/payments");

    const row = page.getByRole("row", { name: /Ram Bahadur/ });
    await row.locator("button").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    const confirmDialog = page.getByRole("dialog", {
      name: "Delete this payment?",
    });
    await confirmDialog.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Payment deleted")).toBeVisible();
    expect(deleteCalled).toBe(true);
  });

  test("shows an error alert when the list fails to load", async ({ page }) => {
    await mockApi(page, {
      "GET /payments/": jsonRoute(500, { detail: "Server error" }),
    });
    await signInViaLocalStorage(page);
    await page.goto("/payments");

    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
    // react-query retries a failed query 3x with backoff before it
    // surfaces as an error, so give this more room than the default 5s.
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
  });
});
