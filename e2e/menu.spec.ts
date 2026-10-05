import { test, expect, type Locator, type Page } from "@playwright/test";
import { combos } from "../src/data/combos";
import { drinks } from "../src/data/drinks";
import { pizzaSizes } from "../src/data/pizza-sizes";
import { restaurant } from "../src/data/restaurant";

async function findProduct(page: Page, name: string) {
  await page.getByRole("searchbox", { name: "Buscar produtos" }).fill(name);
  await page
    .getByRole("button", { name: `Adicionar ${name}`, exact: true })
    .click();
  return page.getByRole("dialog");
}
async function addBurger(page: Page) {
  const dialog = await findProduct(page, "X-Bacon");
  await dialog.getByRole("button", { name: /Adicionar ao pedido/ }).click();
  await expect(dialog).not.toBeVisible();
}
async function openCart(page: Page) {
  await page.getByRole("button", { name: /Ver pedido, \d+ itens/ }).click();
  return page.getByRole("dialog", { name: "Seu pedido", exact: true });
}
async function chooseFlavor(page: Page, dialog: Locator, name: string) {
  const row = dialog
    .locator(".flavor-list .choice-row")
    .filter({
      has: page
        .locator(".choice-copy strong")
        .filter({ hasText: new RegExp(`^${name}$`) }),
    });
  await row.click();
  return row.getByRole("checkbox");
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("cardápio imediato, categorias sticky e apresentação separada", async ({
  page,
}, testInfo) => {
  await expect(
    page.getByRole("heading", { name: "Bateu a fome?" }),
  ).toBeVisible();
  await expect(page.locator(".product-card").first()).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await page.getByRole("button", { name: "X-Lanches", exact: true }).click();
  await expect(page.locator("#burgers")).toBeInViewport();
  await expect
    .poll(() =>
      page
        .locator(".category-bar")
        .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
    )
    .toBe(testInfo.project.name === "mobile" ? 75 : 92);
  await expect(page.locator("nav button.active")).toContainText("X-Lanches");
  await page.getByRole("link", { name: "Início", exact: true }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Sabor que reúne.",
  );
  await page.getByRole("link", { name: "Abrir cardápio" }).click();
  await expect(page).toHaveURL(/\/$/);
});
test("busca instantânea encontra acentos, todos os lanches e todos os sabores", async ({
  page,
}) => {
  const search = page.getByRole("searchbox", { name: "Buscar produtos" });
  await search.fill("coracao");
  await expect(
    page.getByRole("button", { name: "Adicionar X-Coração", exact: true }),
  ).toBeVisible();
  await search.fill("X-");
  await expect(page.locator("#burgers .product-card")).toHaveCount(19);
  await search.fill("pizza");
  await expect(page.locator(".flavor-card")).toHaveCount(40);
  await expect(page.locator(".empty-search")).not.toBeVisible();
  await search.fill("zzzzzz");
  await expect(
    page.getByRole("heading", { name: "Nada por aqui... ainda." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver todo o cardápio" }).click();
  await page.locator("#burgers .show-more").click();
  await expect(page.locator("#burgers .product-card")).toHaveCount(20);
});
test("lanche personalizado, quantidade, edição e persistência do carrinho", async ({
  page,
}) => {
  let dialog = await findProduct(page, "X-Bacon");
  await dialog
    .getByRole("checkbox", { name: "Sem tomate", exact: true })
    .check();
  await dialog.getByRole("checkbox", { name: /Cheddar/ }).check();
  await dialog
    .getByRole("textbox", { name: /Alguma observação/ })
    .fill("Molho separado");
  await dialog
    .getByRole("button", { name: "Aumentar quantidade", exact: true })
    .click();
  await expect(dialog.locator(".modal-actions .primary")).toContainText(
    "66,00",
  );
  await dialog.getByRole("button", { name: /Adicionar ao pedido/ }).click();
  await page.reload();
  let cart = await openCart(page);
  await expect(cart.locator(".cart-item")).toHaveCount(1);
  await expect(cart.locator(".cart-item-details")).toContainText("Sem tomate");
  await expect(cart.locator(".cart-item-details")).toContainText("+ Cheddar");
  await expect(cart.locator(".quantity > span")).toHaveText("2");
  await cart.getByRole("button", { name: "Editar item" }).click();
  dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("checkbox", { name: "Sem tomate", exact: true }),
  ).toBeChecked();
  await dialog.getByRole("checkbox", { name: /Cheddar/ }).uncheck();
  await dialog.getByRole("button", { name: /Salvar alterações/ }).click();
  cart = await openCart(page);
  await expect(cart.locator(".grand-total")).toContainText("63,00");
  await cart.getByRole("button", { name: /Diminuir quantidade/ }).click();
  await expect(cart.locator(".quantity > span")).toHaveText("1");
  await cart.getByRole("button", { name: /Remover X-Bacon/ }).click();
  await expect(
    cart.getByRole("heading", { name: "Tá faltando um favorito aqui." }),
  ).toBeVisible();
});
test("hot dog, porção e bebida entram no mesmo pedido", async ({ page }) => {
  for (const name of ["Dog Tradicional", "Batata frita G", "Coca-Cola 2 L"]) {
    const dialog = await findProduct(page, name);
    await dialog.getByRole("button", { name: /Adicionar ao pedido/ }).click();
  }
  const cart = await openCart(page);
  await expect(cart.locator(".cart-item")).toHaveCount(3);
  await expect(cart.locator(".grand-total")).toContainText("66,00");
  await cart
    .getByRole("button", { name: "Limpar pedido", exact: true })
    .click();
  await cart.getByRole("button", { name: "Sim, limpar" }).click();
  await expect(cart.locator(".empty-cart")).toBeVisible();
});
test("pizza permite os cinco tamanhos, bloqueia excesso de sabores e mantém a borda na edição", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Montar pizza", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await expect(dialog.locator(".modal-actions .primary")).toBeDisabled();
  for (const size of pizzaSizes) {
    await dialog
      .getByRole("radio", { name: new RegExp(`^${size.name}`) })
      .check();
    await expect(
      dialog.locator(".pizza-picker > fieldset").nth(1),
    ).toContainText(`0/${size.maxFlavors} selecionados`);
  }
  for (const name of ["Muçarela", "Calabresa", "Margherita", "Portuguesa"])
    await chooseFlavor(page, dialog, name);
  await expect(
    dialog.locator(".flavor-list input:not(:checked)").first(),
  ).toBeDisabled();
  await dialog.getByRole("radio", { name: /^Catupiry/ }).check();
  await expect(dialog.locator(".modal-actions .primary")).toContainText(
    "99,80",
  );
  await dialog.getByRole("radio", { name: /^Brotinho/ }).check();
  await expect(dialog.locator(".modal-actions .primary")).toBeDisabled();
  await expect(dialog.locator(".error-text")).toContainText("Remova 3");
  for (const name of ["Calabresa", "Margherita", "Portuguesa"])
    await chooseFlavor(page, dialog, name);
  await expect(dialog.locator(".modal-actions .primary")).toContainText(
    "38,00",
  );
  await dialog.getByRole("button", { name: /Adicionar ao pedido/ }).click();
  const cart = await openCart(page);
  await expect(cart.locator(".cart-item-details")).toContainText(
    "Pizza Brotinho",
  );
  await expect(cart.locator(".cart-item-details")).toContainText(
    "Borda: Catupiry",
  );
  await cart.getByRole("button", { name: "Editar item" }).click();
  dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("radio", { name: /^Brotinho/ })).toBeChecked();
  await expect(dialog.getByRole("radio", { name: /^Catupiry/ })).toBeChecked();
});
for (const combo of combos)
  test(`montagem e edição: ${combo.name}`, async ({ page }) => {
    await page
      .getByRole("searchbox", { name: "Buscar produtos" })
      .fill(combo.name);
    await page
      .getByRole("button", { name: `Montar ${combo.name}`, exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    if (combo.burgerSlots)
      await dialog
        .getByRole("combobox", { name: "Lanche 1", exact: true })
        .selectOption("x-especial");
    if (combo.pizzaSizeId) await chooseFlavor(page, dialog, "Calabresa");
    const drink = drinks.find((drink) => drink.id === combo.drinkIds[1])!;
    await dialog
      .getByRole("radio", { name: new RegExp(`^${drink.name}`) })
      .check();
    await dialog.getByRole("button", { name: /Adicionar ao pedido/ }).click();
    await page.reload();
    const cart = await openCart(page);
    await expect(cart.locator(".cart-item h3")).toHaveText(combo.name);
    await expect(cart.locator(".cart-item-details")).toContainText(drink.name);
    if (combo.burgerSlots)
      await expect(cart.locator(".cart-item-details")).toContainText(
        "Especial da Casa",
      );
    if (combo.pizzaSizeId)
      await expect(cart.locator(".cart-item-details")).toContainText(
        "Calabresa",
      );
    await cart.getByRole("button", { name: "Editar item" }).click();
    dialog = page.getByRole("dialog");
    if (combo.burgerSlots)
      await expect(
        dialog.getByRole("combobox", { name: "Lanche 1", exact: true }),
      ).toHaveValue("x-especial");
    await expect(
      dialog.getByRole("radio", { name: new RegExp(`^${drink.name}`) }),
    ).toBeChecked();
    await dialog.getByRole("button", { name: /Salvar alterações/ }).click();
  });
test("entrega valida dados e gera a mensagem completa; retirada esconde endereço", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.open = (url) => {
      (window as unknown as { generatedWhatsapp: string }).generatedWhatsapp =
        String(url);
      return null;
    };
  });
  // Recarregar aplica o interceptador; nenhum pedido real é enviado.
  await page.reload();
  await addBurger(page);
  const cart = await openCart(page);
  await cart
    .getByRole("button", { name: /Finalizar pedido pelo WhatsApp/ })
    .click();
  await expect(cart.locator("#error-name")).toBeVisible();
  await cart
    .getByRole("textbox", { name: "Nome", exact: true })
    .fill("João Silva");
  await cart
    .getByRole("textbox", { name: "Celular", exact: true })
    .fill("(49) 99999-1234");
  await cart
    .getByRole("textbox", { name: "Rua", exact: true })
    .fill("Rua Teste");
  await cart.getByRole("textbox", { name: "Número", exact: true }).fill("20");
  await cart
    .getByRole("textbox", { name: "Bairro", exact: true })
    .fill("Centro");
  await cart
    .getByRole("button", { name: /Finalizar pedido pelo WhatsApp/ })
    .click();
  const delivery = await page.evaluate(
    () =>
      (window as unknown as { generatedWhatsapp: string }).generatedWhatsapp,
  );
  const message = new URL(delivery).searchParams.get("text")!;
  expect(message).toContain("ENTREGA");
  expect(message).toContain("Rua: Rua Teste");
  expect(message).toContain("Nome: João Silva");
  expect(message).toContain("34,00");
  await cart.getByRole("radio", { name: /Retirada/ }).check();
  await expect(
    cart.getByRole("textbox", { name: "Rua", exact: true }),
  ).not.toBeVisible();
  await expect(cart.locator(".grand-total")).toContainText("29,00");
  await cart
    .getByRole("button", { name: /Finalizar pedido pelo WhatsApp/ })
    .click();
  const pickup = await page.evaluate(
    () =>
      (window as unknown as { generatedWhatsapp: string }).generatedWhatsapp,
  );
  const pickupMessage = new URL(pickup).searchParams.get("text")!;
  expect(pickupMessage).toContain("RETIRADA NO LOCAL");
  expect(pickupMessage).not.toContain("Rua:");
  expect(pickupMessage).toContain("29,00");
  await cart.locator(".message-preview summary").click();
  await expect(cart.locator(".message-preview pre")).toContainText(
    "Pedido e valores sujeitos à confirmação",
  );
});
test("carrinho corrompido recupera e respeita movimento reduzido sem overflow", async ({
  page,
}) => {
  await page.evaluate(
    (key) => localStorage.setItem(key, "not-json"),
    restaurant.cartStorageKey,
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Ver pedido, 0 itens" }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    )
    .toBe("auto");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await addBurger(page);
  const cart = await openCart(page);
  expect(
    await cart.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(cart).not.toBeVisible();
});
test("barra inferior do pedido é acessível no celular", async ({
  page,
}, testInfo) => {
  await addBurger(page);
  if (testInfo.project.name === "mobile") {
    await expect(page.locator(".mobile-cart-bar")).toBeVisible();
    await expect(page.locator(".mobile-cart-bar")).toContainText("29,00");
    await page.locator(".mobile-cart-bar").click();
    await expect(
      page.getByRole("dialog", { name: "Seu pedido", exact: true }),
    ).toBeVisible();
  } else await expect(page.locator(".mobile-cart-bar")).not.toBeVisible();
});
test("dados do cliente permanecem ao editar o pedido e ao reabrir o painel", async ({
  page,
}) => {
  await addBurger(page);
  let cart = await openCart(page);
  await cart
    .getByRole("textbox", { name: "Nome", exact: true })
    .fill("Maria Teste");
  await cart
    .getByRole("textbox", { name: "Celular", exact: true })
    .fill("49999991234");
  await cart.getByRole("radio", { name: /Retirada/ }).check();
  await cart.getByRole("button", { name: "Editar item" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Salvar alterações/ })
    .click();
  cart = await openCart(page);
  await expect(
    cart.getByRole("textbox", { name: "Nome", exact: true }),
  ).toHaveValue("Maria Teste");
  await expect(
    cart.getByRole("textbox", { name: "Celular", exact: true }),
  ).toHaveValue("49999991234");
  await expect(cart.getByRole("radio", { name: /Retirada/ })).toBeChecked();
});
