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

const paymentDetail: Payment = {
  id: "pay-1",
  customer: ramBahadur,
  amount_paid: "500",
  payment_mode: "bank_transfer",
  reference: "REF123",
  note: "Salary payment",
  created_at: "2026-08-05T00:00:00Z",
};

test.describe("Payment detail", () => {
  test("renders the payment record and details panel", async ({ page }) => {
    await mockApi(page, {
      "GET /payments/pay-1/": jsonRoute(200, paymentDetail),
    });
    await signInViaLocalStorage(page);
    await page.goto("/payments/pay-1");

    await expect(
      page.getByRole("heading", { name: "Payments - Ram Bahadur" }),
    ).toBeVisible();
    await expect(page.getByText("9800000001")).toBeVisible();

    const recordPanel = page.locator(".ant-card", {
      hasText: "Payment record",
    });
    await expect(recordPanel).toContainText(npr(500));
    await expect(recordPanel).toContainText("Bank Transfer");
    await expect(recordPanel).toContainText("REF123");

    const detailsPanel = page.locator(".ant-card", { hasText: "Details" });
    await expect(detailsPanel).toContainText("Salary payment");
  });

  test("edits the payment from the detail page", async ({ page }) => {
    let updateBody: unknown;
    await mockApi(page, {
      "GET /payments/pay-1/": jsonRoute(200, paymentDetail),
      "PUT /payments/pay-1/": async (route) => {
        updateBody = route.request().postDataJSON();
        await jsonRoute(200, { ...paymentDetail, amount_paid: "700" })(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/payments/pay-1");

    await page.getByRole("button", { name: "Edit", exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Edit payment" });
    await expect(modal.getByPlaceholder("0")).toHaveValue("500");
    await modal.getByPlaceholder("0").fill("700");
    await modal.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Payment updated")).toBeVisible();
    expect(updateBody).toMatchObject({
      customer_id: "cust-1",
      amount_paid: "700",
    });
  });

  test("deletes the payment from the detail page and redirects to /payments", async ({
    page,
  }) => {
    let deleteCalled = false;
    await mockApi(page, {
      "GET /payments/pay-1/": jsonRoute(200, paymentDetail),
      "GET /payments/": jsonRoute(200, []),
      "DELETE /payments/pay-1/": async (route) => {
        deleteCalled = true;
        await jsonRoute(200, {})(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/payments/pay-1");

    await page.locator("button:has(svg.lucide-trash-2)").click();
    const confirmDialog = page.getByRole("dialog", {
      name: "Delete this payment?",
    });
    await confirmDialog.getByRole("button", { name: "Delete" }).click();

    await expect(page).toHaveURL(/\/payments$/);
    await expect(page.getByText("Payment deleted")).toBeVisible();
    expect(deleteCalled).toBe(true);
  });

  test("shows an error state when the payment fails to load, with a working back link", async ({
    page,
  }) => {
    await mockApi(page, {
      "GET /payments/pay-1/": jsonRoute(404, { detail: "Not found" }),
      "GET /payments/": jsonRoute(200, []),
    });
    await signInViaLocalStorage(page);
    await page.goto("/payments/pay-1");

    // react-query retries a failed query 3x with backoff before it
    // surfaces as an error, so give this more room than the default 5s.
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("link", { name: "Back to payments" }).click();
    await expect(page).toHaveURL(/\/payments$/);
  });
});
