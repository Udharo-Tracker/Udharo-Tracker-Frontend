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

const entryDetail: UdharoEntry = {
  id: "udharo-1",
  customer: ramBahadur,
  items: [
    { id: "item-1", item_name: "Rice 5kg", amount: "500" },
    { id: "item-2", item_name: "Cooking Oil", amount: "250" },
  ],
  total_amount: "750",
  note: "Promised to pay Friday",
  is_settled: false,
  created_at: "2026-08-10T00:00:00Z",
  settled_at: null,
};

test.describe("Udharo entry detail", () => {
  test("renders the entry's items, total, and details panel", async ({
    page,
  }) => {
    await mockApi(page, {
      "GET /udharo/udharo-1/": jsonRoute(200, entryDetail),
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo/udharo-1");

    await expect(
      page.getByRole("heading", { name: "Udharo Entries - Ram Bahadur" }),
    ).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
    await expect(page.getByText("9800000001")).toBeVisible();

    const itemsPanel = page.locator(".ant-card", { hasText: "Items" });
    await expect(itemsPanel).toContainText("Rice 5kg");
    await expect(itemsPanel).toContainText(npr(500));
    await expect(itemsPanel).toContainText("Cooking Oil");
    await expect(itemsPanel).toContainText(npr(250));
    await expect(itemsPanel).toContainText(npr(750));

    const detailsPanel = page.locator(".ant-card", { hasText: "Details" });
    await expect(detailsPanel).toContainText("Promised to pay Friday");
  });

  test("edits the entry from the detail page", async ({ page }) => {
    let updateBody: unknown;
    await mockApi(page, {
      "GET /udharo/udharo-1/": jsonRoute(200, entryDetail),
      "PUT /udharo/udharo-1/": async (route) => {
        updateBody = route.request().postDataJSON();
        await jsonRoute(200, { ...entryDetail, note: "Paid in full" })(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo/udharo-1");

    await page.getByRole("button", { name: "Edit", exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Edit udharo entry" });
    await modal
      .getByPlaceholder("Any reference, promise date, etc.")
      .fill("Paid in full");
    await modal.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Udharo entry updated")).toBeVisible();
    expect(updateBody).toMatchObject({ note: "Paid in full" });
  });

  test("deletes the entry from the detail page and redirects to /udharo", async ({
    page,
  }) => {
    let deleteCalled = false;
    await mockApi(page, {
      "GET /udharo/udharo-1/": jsonRoute(200, entryDetail),
      "GET /udharo/": jsonRoute(200, []),
      "DELETE /udharo/udharo-1/": async (route) => {
        deleteCalled = true;
        await jsonRoute(200, {})(route);
      },
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo/udharo-1");

    await page.locator("button:has(svg.lucide-trash-2)").click();
    const confirmDialog = page.getByRole("dialog", {
      name: "Delete this udharo entry?",
    });
    await confirmDialog.getByRole("button", { name: "Delete" }).click();

    await expect(page).toHaveURL(/\/udharo$/);
    await expect(page.getByText("Udharo entry deleted")).toBeVisible();
    expect(deleteCalled).toBe(true);
  });

  test("shows an error state when the entry fails to load, with a working back link", async ({
    page,
  }) => {
    await mockApi(page, {
      "GET /udharo/udharo-1/": jsonRoute(404, { detail: "Not found" }),
      "GET /udharo/": jsonRoute(200, []),
    });
    await signInViaLocalStorage(page);
    await page.goto("/udharo/udharo-1");

    // react-query retries a failed query 3x with backoff before it
    // surfaces as an error, so give this more room than the default 5s.
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("link", { name: "Back to udharo entries" }).click();
    await expect(page).toHaveURL(/\/udharo$/);
  });
});
