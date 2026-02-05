import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function expectNoHorizontalScroll(page: Page) {
  const hasOverflowX = await page.evaluate(() => {
    const el = document.scrollingElement;
    if (!el) return false;
    return el.scrollWidth > el.clientWidth + 1;
  });
  expect(hasOverflowX).toBe(false);
}

async function runAxe(page: Page, contextLabel: string) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");

  expect(
    serious,
    `${contextLabel}: serious/critical a11y violations:\n` +
      serious.map((v) => `${v.id} (${v.impact}) - ${v.description}`).join("\n")
  ).toEqual([]);
}

test.describe.configure({ mode: "serial" });

test("demo smoke: Today/Inbox/Tasks render", async ({ page, isMobile }) => {
  // NOTE: In E2E we bypass auth (see VITE_E2E_BYPASS_AUTH) to avoid
  // requiring real Amplify/AppSync connectivity just to validate basic UI.

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TaskMaster", exact: true })).toBeVisible();

  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();

  await expectNoHorizontalScroll(page);
  await runAxe(page, "Today");

  await page.goto("/inbox");
  await expect(page.getByRole("heading", { name: "Inbox", exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await runAxe(page, "Inbox");

  await page.goto("/tasks");
  await expect(page.getByRole("heading", { name: "Tasks", exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await runAxe(page, `Tasks${isMobile ? " (mobile)" : ""}`);
});
