import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";

const baseURL = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const executablePath =
  process.env.E2E_CHROMIUM_EXECUTABLE_PATH ??
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(baseURL, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200);
  await page.getByRole("searchbox", { name: "Buscar produtos" }).fill("X-Bacon");
  await page.getByRole("button", { name: "Adicionar X-Bacon", exact: true }).click();
  const product = page.getByRole("dialog");
  await product.getByRole("checkbox", { name: /^Cheddar/ }).check();
  await product.getByRole("button", { name: /Adicionar ao pedido/ }).click();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Ver pedido, 1 itens" }).click();
  const cart = page.getByRole("dialog", { name: "Seu pedido", exact: true });
  assert.equal(await cart.locator(".cart-item").count(), 1);
  assert.match(await cart.locator(".cart-item-details").innerText(), /Cheddar/);
  await cart.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByRole("link", { name: "Início", exact: true }).click();
  await page.getByRole("heading", { level: 1, name: /Sabor que reúne/ }).waitFor();
  assert.match(await page.getByRole("heading", { level: 1 }).innerText(), /Sabor que reúne/);
  assert.deepEqual(errors, []);
  console.log("Smoke passou: cardápio, personalização, persistência, carrinho e /inicio em celular.");
} finally {
  await browser.close();
}
