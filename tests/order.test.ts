import test from "node:test";
import assert from "node:assert/strict";
import { burgers } from "../src/data/burgers";
import { hotdogs } from "../src/data/hotdogs";
import { portions } from "../src/data/portions";
import { drinks } from "../src/data/drinks";
import { combos } from "../src/data/combos";
import { pizzas, pizzaProduct } from "../src/data/pizzas";
import { pizzaSizes } from "../src/data/pizza-sizes";
import { catalog } from "../src/data/catalog";
import {
  customerErrors,
  defaultSelection,
  itemDetails,
  itemPrice,
  normalize,
  pizzaError,
  pizzaPrice,
  restoreCart,
  selectionError,
  subtotal,
  whatsappMessage,
  whatsappUrl,
} from "../src/lib/order";
import type { CartLine, Customer } from "../src/lib/types";

const customer: Customer = {
  method: "delivery",
  name: "João Silva",
  phone: "(49) 99999-1234",
  street: "Rua de Teste",
  number: "10",
  neighborhood: "Centro",
  city: "Lages - SC",
  complement: "Apto 2",
  reference: "Praça",
  note: "Avisar ao chegar",
};
test("catálogo completo, identificadores únicos e preços em centavos", () => {
  assert.deepEqual(
    [
      burgers.length,
      hotdogs.length,
      pizzas.length,
      portions.length,
      drinks.length,
      combos.length,
    ],
    [20, 10, 40, 10, 14, 7],
  );
  assert.equal(new Set(catalog.map((item) => item.id)).size, catalog.length);
  assert.ok(
    catalog.every((item) => Number.isInteger(item.price) && item.price > 0),
  );
});
test("busca ignora maiúsculas e acentos", () =>
  assert.equal(normalize("  CORAÇÃO  "), "coracao"));
test("adicionais e quantidades alteram o total; remoções não alteram o preço", () => {
  const selection = defaultSelection(burgers[1]);
  selection.removed = ["Tomate"];
  selection.extraIds = ["cheddar", "egg"];
  assert.equal(itemPrice(burgers[1], selection), 3550);
  assert.equal(
    subtotal([{ id: "1", productId: burgers[1].id, quantity: 2, selection }]),
    7100,
  );
});
for (const size of pizzaSizes)
  test(`pizza ${size.name}: limite de sabores e preço do maior sabor`, () => {
    const flavorIds = pizzas
      .slice(0, size.maxFlavors)
      .map((flavor) => flavor.id);
    const selection = { sizeId: size.id, flavorIds, borderId: "catupiry" };
    assert.equal(pizzaError(selection), null);
    const maximum = Math.max(
      ...pizzas.slice(0, size.maxFlavors).map((flavor) => flavor.surcharge),
    );
    assert.equal(
      pizzaPrice(selection),
      size.basePrice + Math.round(maximum * size.flavorMultiplier) + 1000,
    );
    assert.ok(
      pizzaError({ ...selection, flavorIds: [...flavorIds, pizzas[5].id] }),
    );
    assert.ok(pizzaError({ ...selection, flavorIds: [] }));
  });
test("sabores premium usam o maior valor, sem somar os sabores", () => {
  const selection = {
    sizeId: "grande",
    flavorIds: [pizzas[1].id, pizzas[23].id],
    borderId: "none",
  };
  assert.equal(pizzaPrice(selection), 9200);
  assert.equal(
    pizzaError({ ...selection, flavorIds: [pizzas[1].id, pizzas[1].id] }),
    "Escolha sabores válidos.",
  );
});
for (const combo of combos)
  test(`${combo.name}: componentes e upgrades corretos`, () => {
    const selection = defaultSelection(combo);
    if (selection.combo?.pizza)
      selection.combo.pizza.flavorIds = [pizzas[0].id];
    assert.equal(selectionError(combo, selection), null);
    assert.equal(itemPrice(combo, selection), combo.price);
    assert.ok(
      itemDetails(combo, selection).some((line) => line.startsWith("Bebida:")),
    );
    if (combo.burgerSlots) {
      selection.combo!.burgerIds[0] = "x-especial";
      assert.equal(
        itemPrice(combo, selection),
        combo.price + 4500 - combo.includedBurgerPrice,
      );
    }
    if (combo.pizzaSizeId) {
      selection.combo!.pizza!.flavorIds = [pizzas[23].id];
      selection.combo!.pizza!.borderId = "cheddar";
      const upgrade =
        Math.round(
          2400 *
            pizzaSizes.find((size) => size.id === combo.pizzaSizeId)!
              .flavorMultiplier,
        ) + 1000;
      const burgerUpgrade = combo.burgerSlots
        ? 4500 - combo.includedBurgerPrice
        : 0;
      assert.equal(
        itemPrice(combo, selection),
        combo.price + upgrade + burgerUpgrade,
      );
    }
  });
test("combo rejeita bebida e tamanho que não estão incluídos", () => {
  const selection = defaultSelection(combos[4]);
  selection.combo!.drinkId = "agua";
  assert.ok(selectionError(combos[4], selection));
  selection.combo!.drinkId = "coca-2l";
  selection.combo!.pizza!.sizeId = "brotinho";
  assert.ok(selectionError(combos[4], selection));
});
test("restauração descarta JSON corrompido, produtos removidos, quantidades inválidas e IDs duplicados", () => {
  const line: CartLine = {
    id: "1",
    productId: "x-bacon",
    quantity: 2,
    selection: defaultSelection(burgers[1]),
  };
  assert.deepEqual(restoreCart("{bad json"), []);
  assert.deepEqual(restoreCart("null"), []);
  assert.deepEqual(
    restoreCart(
      JSON.stringify([
        { ...line, productId: "unknown" },
        { ...line, quantity: 0 },
        { ...line, quantity: 100 },
        { ...line, selection: {} },
      ]),
    ),
    [],
  );
  assert.deepEqual(restoreCart(JSON.stringify([line, line])), [line]);
  assert.equal(subtotal(restoreCart(JSON.stringify([line]))), 5800);
});
test("pizza restaurada respeita limites atuais", () => {
  const selection = defaultSelection(pizzaProduct);
  selection.pizza!.sizeId = "brotinho";
  selection.pizza!.flavorIds = [pizzas[0].id, pizzas[1].id];
  assert.deepEqual(
    restoreCart(
      JSON.stringify([
        { id: "pizza", productId: "pizza", quantity: 1, selection },
      ]),
    ),
    [],
  );
});
test("restauração rejeita opções incompatíveis e tipos corrompidos", () => {
  const combo = defaultSelection(combos[0]);
  combo.combo!.pizza = {
    sizeId: "grande",
    flavorIds: [pizzas[0].id],
    borderId: "none",
  };
  assert.deepEqual(
    restoreCart(
      JSON.stringify([
        { id: "combo", productId: combos[0].id, quantity: 1, selection: combo },
      ]),
    ),
    [],
  );
  const malformed = { ...defaultSelection(combos[0]), removed: [123] };
  assert.deepEqual(
    restoreCart(
      JSON.stringify([
        {
          id: "combo",
          productId: combos[0].id,
          quantity: 1,
          selection: malformed,
        },
      ]),
    ),
    [],
  );
});
test("checkout exige endereço para entrega e apenas nome/celular na retirada", () => {
  assert.deepEqual(customerErrors(customer), {});
  assert.ok(customerErrors({ ...customer, phone: "123" }).phone);
  assert.ok(customerErrors({ ...customer, street: "" }).street);
  assert.deepEqual(
    customerErrors({
      ...customer,
      method: "pickup",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
    }),
    {},
  );
  assert.deepEqual(
    customerErrors({ ...customer, phone: "+55 (49) 99999-1234" }),
    {},
  );
});
test("WhatsApp inclui personalizações, frações, combo, endereço e total de entrega", () => {
  const burger = defaultSelection(burgers[1]);
  burger.removed = ["Tomate"];
  burger.extraIds = ["cheddar"];
  const pizza = defaultSelection(pizzaProduct);
  pizza.pizza!.flavorIds = [pizzas[1].id, pizzas[10].id];
  pizza.pizza!.borderId = "catupiry";
  const combo = defaultSelection(combos[2]);
  const lines: CartLine[] = [
    { id: "b", productId: "x-bacon", quantity: 2, selection: burger },
    { id: "p", productId: "pizza", quantity: 1, selection: pizza },
    { id: "c", productId: combos[2].id, quantity: 1, selection: combo },
  ];
  const message = whatsappMessage(lines, customer);
  for (const text of [
    "2x X-Bacon",
    "Sem tomate",
    "+ Cheddar",
    "1/2 Calabresa",
    "1/2 Frango com Catupiry",
    "Borda: Catupiry",
    "Combo Casal",
    "Nome: João Silva",
    "Rua: Rua de Teste",
    "Complemento: Apto 2",
    "TOTAL ESTIMADO:",
    "Entrega (demonstrativa):",
    "Pedido e valores sujeitos à confirmação",
  ])
    assert.ok(message.includes(text), text);
  assert.equal(new URL(whatsappUrl(message)).searchParams.get("text"), message);
});
test("WhatsApp de retirada omite dados de endereço e taxa", () => {
  const lines = [
    {
      id: "1",
      productId: "x-salada",
      quantity: 1,
      selection: defaultSelection(burgers[0]),
    },
  ];
  const message = whatsappMessage(lines, { ...customer, method: "pickup" });
  assert.ok(message.includes("RETIRADA NO LOCAL"));
  assert.ok(message.includes("TOTAL ESTIMADO: R$ 24,00"));
  assert.ok(!message.includes("Rua:"));
  assert.ok(!message.includes("Entrega (demonstrativa)"));
});
