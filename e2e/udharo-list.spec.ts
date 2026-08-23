import { test, expect } from "@playwright/test";
import { mockApi, jsonRoute, signInViaLocalStorage } from "./fixtures/api-mock";

// Mirrors src/lib/currency.ts's npr() — kept in sync manually since the app
// doesn't export a test-friendly formatter.
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

const entries: UdharoEntry[] = [
  {
    id: "udharo-1",
    customer: ramBahadur,
    items: [
      { id: "item-1", item_name: "Rice 5kg", amount: "500" },
      { id: "item-2", item_name: "Cooking Oil", amount: "250" },
    ],
    total_amount: "750",
    note: "",
    is_settled: false,
    created_at: "2026-08-10T00:00:00Z",
    settled_at: null,
  },
  {
    id: "udharo-2",
    customer: sitaGurung,
    items: [{ id: "item-3", item_name: "Sugar 2kg", amount: "200" }],
    total_amount: "200",
    note: "Paid off",
    is_settled: true,
    created_at: "2026-07-15T00:00:00Z",
    settled_at: "2026-07-20T00:00:00Z",
  },
];

test.describe("Udharo entries list", () => {
  test("renders entries with status tags and totals", async ({ page }) => {
    await mockApi(page, { "GET /udharo/": jsonRoute(200, entries) });
    await signInViaLocalStorage(page);
    await page.goto("/udharo");

    await expect(
      page.getByRole("heading", { name: "Udharo Entries" }),
    ).toBeVisible();
    await expect(page.getByText("2 total · 1 pending")).toBeVisible();

    const ramRow = page.getByRole("row", { name: /Ram Bahadur/ });
    await expect(ramRow).toContainText("Rice 5kg, Cooking Oil");
    await expect(ramRow).toContainText("Pending");
    await expect(ramRow).toContainText(npr(750));

    const sitaRow = page.getByRole("row", { name: /Sita Gurung/ });
    await expect(sitaRow).toContainText("Sugar 2kg");
    await expect(sitaRow).toContainText("Settled");
    await expect(sitaRow).toContainText(npr(200));
  });

  test("search filters the table by item name", async ({ page }) => {
    await mockApi(page, { "GET /udharo/": jsonRoute(200, entries) });
    await signInViaLocalStorage(page);
    await page.goto("/udharo");

    await page.locator("button:has(svg.lucide-search)").click();
    await page
      .getByPlaceholder("Search by customer, item, or note…")
      .fill("Sugar");

    await expect(page.getByText("Sita Gurung")).toBeVisible();
    await expect(page.getByText("Ram Bahadur")).toHaveCount(0);
  });

  test("requires a customer and at least one priced item, then creates an entry", async ({
    page,
  }) => {
    let createBody: unknown;
    await mockApi(page, {
      "GET /udharo/": jsonRoute(200, []),
      "GET /customers/": jsonRoute(200, [ramBahadur, sitaGurung]),
      // Selecting a customer in the combobox fetches their full detail (for
      // the credit-limit check below) — the real backend always includes
      // ledger_summary on this response.
      "GET /customers/cust-1/": jsonRoute(200, {
        ...ramBahadur,
        ledger_summary: {
          opening_balance: "0",
          total_udharo: "0",
          total_paid: "0",
          outstanding_balance: "0",
        },
      }),
      "POST /udharo/": async (route) => {
        createBody = route.request().postDataJSON();
        await jsonRoute(201, { ...entries[0], id: "udharo-new" })(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo");

    await page.getByRole("button", { name: "Add udharo" }).click();
    const modal = page.getByRole("dialog", { name: "Add udharo entry" });
    await expect(modal).toBeVisible();

    // Submitting without a customer shows the inline required error.
    await modal.getByRole("button", { name: "Save" }).click();
    await expect(modal.getByText("Please select a customer")).toBeVisible();
    expect(createBody).toBeUndefined();

    // Selecting a customer but leaving every item unpriced hits the
    // client-side "total must be > 0" guard instead of submitting.
    const combobox = modal.getByPlaceholder(
      "Search customer by name or phone…",
    );
    await combobox.click();
    await combobox.fill("Ram");
    await modal.getByRole("button", { name: /Ram Bahadur/ }).click();
    await modal.getByRole("button", { name: "Save" }).click();
    await expect(
      page.getByText("Add at least one item with an amount"),
    ).toBeVisible();
    expect(createBody).toBeUndefined();

    await modal.getByPlaceholder("Item name").fill("Notebook");
    await modal.getByPlaceholder("Amount").fill("150");
    await modal.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Udharo added")).toBeVisible();
    expect(createBody).toMatchObject({
      customer_id: "cust-1",
      items: [{ item_name: "Notebook", amount: "150" }],
    });
  });

  test("blocks submission when the entry would exceed the customer's credit limit", async ({
    page,
  }) => {
    const overLimitCustomer: Customer = {
      ...ramBahadur,
      id: "cust-3",
      name: "Hari Thapa",
      credit_limit: "1000",
      block_over_credit_limit: true,
    };
    await mockApi(page, {
      "GET /udharo/": jsonRoute(200, []),
      "GET /customers/": jsonRoute(200, [overLimitCustomer]),
      "GET /customers/cust-3/": jsonRoute(200, {
        ...overLimitCustomer,
        ledger_summary: {
          opening_balance: "0",
          total_udharo: "800",
          total_paid: "0",
          outstanding_balance: "800",
        },
      }),
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo");

    await page.getByRole("button", { name: "Add udharo" }).click();
    const modal = page.getByRole("dialog", { name: "Add udharo entry" });
    const combobox = modal.getByPlaceholder(
      "Search customer by name or phone…",
    );
    await combobox.click();
    await combobox.fill("Hari");
    await modal.getByRole("button", { name: /Hari Thapa/ }).click();

    await modal.getByPlaceholder("Item name").fill("Fertilizer");
    await modal.getByPlaceholder("Amount").fill("300");

    await expect(
      modal.getByText(/over their रु 1,000 credit limit/),
    ).toBeVisible();
    await expect(modal.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("edits an entry via the row menu", async ({ page }) => {
    let updateBody: unknown;
    await mockApi(page, {
      "GET /udharo/": jsonRoute(200, entries),
      "GET /udharo/udharo-1/": jsonRoute(200, entries[0]),
      "PUT /udharo/udharo-1/": async (route) => {
        updateBody = route.request().postDataJSON();
        await jsonRoute(200, {
          ...entries[0],
          items: [{ id: "item-1", item_name: "Rice 5kg", amount: "600" }],
          total_amount: "600",
        })(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo");

    const row = page.getByRole("row", { name: /Ram Bahadur/ });
    await row.locator("button").click();
    await page.getByRole("menuitem", { name: "Edit udharo" }).click();

    const modal = page.getByRole("dialog", { name: "Edit udharo entry" });
    await expect(modal.getByPlaceholder("Item name").first()).toHaveValue(
      "Rice 5kg",
    );
    await modal.getByPlaceholder("Amount").first().fill("600");
    await modal.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Udharo entry updated")).toBeVisible();
    expect(updateBody).toMatchObject({
      customer_id: "cust-1",
      items: [
        { item_name: "Rice 5kg", amount: "600" },
        { item_name: "Cooking Oil", amount: "250" },
      ],
    });
  });

  test("deletes an entry via the row menu", async ({ page }) => {
    let deleteCalled = false;
    await mockApi(page, {
      "GET /udharo/": jsonRoute(200, entries),
      "DELETE /udharo/udharo-1/": async (route) => {
        deleteCalled = true;
        await jsonRoute(200, {})(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo");

    const row = page.getByRole("row", { name: /Ram Bahadur/ });
    await row.locator("button").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    const confirmDialog = page.getByRole("dialog", {
      name: "Delete this udharo entry?",
    });
    await confirmDialog.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Udharo entry deleted")).toBeVisible();
    expect(deleteCalled).toBe(true);
  });

  test("shows an error alert when the list fails to load", async ({ page }) => {
    await mockApi(page, {
      "GET /udharo/": jsonRoute(500, { detail: "Server error" }),
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo");

    await expect(
      page.getByRole("heading", { name: "Udharo Entries" }),
    ).toBeVisible();
    // react-query retries a failed query 3x with backoff before it
    // surfaces as an error, so give this more room than the default 5s.
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
  });
});
