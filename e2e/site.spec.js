import { test, expect } from "@playwright/test";

// No test talks to the real Supabase project: requests to *.supabase.co are
// answered here (or refused), so forms can be checked end to end safely.
test.beforeEach(async ({ page }) => {
  await page.route(/supabase\.co\//, (route) => route.abort());
});

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Starstreak/i);
});

test("sign-in page has email and password", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test("ops is behind its own sign-in", async ({ page }) => {
  await page.goto("/ops");
  await expect(page).toHaveURL(/\/ops\/login/);
});

test("data request: Submit explains a missing request type", async ({ page }) => {
  await page.goto("/data-request");
  await page.fill("#dr-name", "Test Person");
  await page.fill("#dr-email", "test@example.com");
  await page.getByRole("button", { name: /submit request/i }).click();
  await expect(page.getByRole("alert")).toContainText(/choose what you'd like to do/i);
});

test("data request: a link can pick the type", async ({ page }) => {
  await page.goto("/data-request?type=export");
  await expect(page.getByText(/Request:\s*Download my data/)).toBeVisible();
});

test("contact form sends through public-form", async ({ page }) => {
  let sent = null;
  await page.unroute(/supabase\.co\//);
  await page.route(/supabase\.co\/functions\/v1\/public-form/, async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"saved":true}' });
  });
  await page.route(/supabase\.co\/(?!functions\/v1\/public-form)/, (route) => route.abort());
  await page.goto("/contact");
  await page.getByLabel(/name/i).first().fill("Test Person");
  await page.getByLabel(/email/i).first().fill("test@example.com");
  await page.getByLabel(/message/i).first().fill("Hello from the browser test.");
  await page.getByRole("button", { name: /send/i }).click();
  await expect.poll(() => sent?.kind).toBe("contact");
  expect(sent.email).toBe("test@example.com");
});
