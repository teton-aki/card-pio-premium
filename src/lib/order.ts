import { getMenuItem } from "@/data/catalog";
import { burgers } from "@/data/burgers";
import { drinks } from "@/data/drinks";
import { extras, borders } from "@/data/extras";
import { pizzas } from "@/data/pizzas";
import { pizzaSizes, pizzaPricingRule } from "@/data/pizza-sizes";
import { restaurant } from "@/data/restaurant";
import type {
  CartLine,
  Customer,
  ItemSelection,
  MenuItem,
  PizzaSelection,
} from "./types";

export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function defaultSelection(
  item: MenuItem,
  flavorId?: string,
): ItemSelection {
  const selection: ItemSelection = { removed: [], extraIds: [], note: "" };
  if (item.kind === "pizza")
    selection.pizza = {
      sizeId: "grande",
      flavorIds: flavorId ? [flavorId] : [],
      borderId: "none",
    };
  if (item.kind === "combo")
    selection.combo = {
      burgerIds: [...item.defaultBurgerIds],
      drinkId: item.drinkIds[0],
      ...(item.pizzaSizeId
        ? {
            pizza: {
              sizeId: item.pizzaSizeId,
              flavorIds: [],
              borderId: "none",
            },
          }
        : {}),
    };
  return selection;
}
export function pizzaError(selection?: PizzaSelection): string | null {
  if (!selection) return "Configure sua pizza.";
  const size = pizzaSizes.find((size) => size.id === selection.sizeId);
  if (!size) return "Escolha um tamanho válido.";
  if (!selection.flavorIds.length) return "Escolha pelo menos um sabor.";
  if (selection.flavorIds.length > size.maxFlavors)
    return `Este tamanho permite até ${size.maxFlavors} sabores.`;
  if (
    new Set(selection.flavorIds).size !== selection.flavorIds.length ||
    selection.flavorIds.some((id) => !pizzas.some((pizza) => pizza.id === id))
  )
    return "Escolha sabores válidos.";
  if (!borders.some((border) => border.id === selection.borderId))
    return "Escolha uma borda válida.";
  return null;
}
export function selectionError(
  item: MenuItem,
  selection: ItemSelection,
): string | null {
  if (selection.note.length > 280)
    return "A observação deve ter até 280 caracteres.";
  if (
    item.kind !== "product" &&
    (selection.extraIds.length > 0 || selection.removed.length > 0)
  )
    return "Personalização inválida.";
  if (item.kind === "product" && (selection.pizza || selection.combo))
    return "Personalização inválida.";
  if (item.kind === "pizza")
    return selection.combo
      ? "Personalização inválida."
      : pizzaError(selection.pizza);
  if (item.kind === "combo") {
    if (selection.pizza) return "Personalização inválida.";
    const combo = selection.combo;
    if (
      !combo ||
      combo.burgerIds.length !== item.burgerSlots ||
      combo.burgerIds.some((id) => !burgers.some((burger) => burger.id === id))
    )
      return "Escolha todos os lanches do combo.";
    if (!item.drinkIds.includes(combo.drinkId))
      return "Escolha a bebida do combo.";
    if (!item.pizzaSizeId && combo.pizza) return "Este combo não inclui pizza.";
    if (item.pizzaSizeId && combo.pizza?.sizeId !== item.pizzaSizeId)
      return "O tamanho da pizza é definido pelo combo.";
    return item.pizzaSizeId ? pizzaError(combo.pizza) : null;
  }
  if (
    selection.extraIds.some((id) => !item.extraIds.includes(id)) ||
    new Set(selection.extraIds).size !== selection.extraIds.length
  )
    return "Adicional inválido.";
  if (selection.removed.some((name) => !item.ingredients.includes(name)))
    return "Ingrediente inválido.";
  return null;
}
export function pizzaPrice(selection: PizzaSelection): number {
  const size = pizzaSizes.find((size) => size.id === selection.sizeId);
  if (!size) return 0;
  const surcharges = selection.flavorIds.map(
    (id) => pizzas.find((pizza) => pizza.id === id)?.surcharge ?? 0,
  );
  const surcharge =
    pizzaPricingRule === "highest"
      ? Math.max(0, ...surcharges)
      : surcharges.reduce((a, b) => a + b, 0) / (surcharges.length || 1);
  return (
    size.basePrice +
    Math.round(surcharge * size.flavorMultiplier) +
    (borders.find((border) => border.id === selection.borderId)?.price ?? 0)
  );
}
export function itemPrice(item: MenuItem, selection: ItemSelection): number {
  if (item.kind === "pizza")
    return selection.pizza ? pizzaPrice(selection.pizza) : item.price;
  if (item.kind === "combo" && selection.combo) {
    const upgrades = selection.combo.burgerIds.reduce(
      (sum, id) =>
        sum +
        Math.max(
          0,
          (burgers.find((burger) => burger.id === id)?.price ?? 0) -
            item.includedBurgerPrice,
        ),
      0,
    );
    const pizzaUpgrade = selection.combo.pizza
      ? pizzaPrice(selection.combo.pizza) -
        (pizzaSizes.find((size) => size.id === item.pizzaSizeId)?.basePrice ??
          0)
      : 0;
    return item.price + upgrades + pizzaUpgrade;
  }
  return (
    item.price +
    selection.extraIds.reduce(
      (sum, id) => sum + (extras.find((extra) => extra.id === id)?.price ?? 0),
      0,
    )
  );
}
export function pizzaDetails(selection: PizzaSelection): string[] {
  const size = pizzaSizes.find((size) => size.id === selection.sizeId);
  return [
    `Pizza ${size?.name ?? ""} · ${size?.slices ?? 0} fatias`,
    ...selection.flavorIds.map(
      (id) =>
        `${selection.flavorIds.length > 1 ? `1/${selection.flavorIds.length} ` : ""}${pizzas.find((pizza) => pizza.id === id)?.name ?? ""}`,
    ),
    `Borda: ${borders.find((border) => border.id === selection.borderId)?.name ?? ""}`,
  ];
}
export function itemDetails(
  item: MenuItem,
  selection: ItemSelection,
): string[] {
  const details: string[] = [];
  if (selection.pizza) details.push(...pizzaDetails(selection.pizza));
  if (item.kind === "combo" && selection.combo) {
    selection.combo.burgerIds.forEach((id, index) =>
      details.push(
        `Lanche ${index + 1}: ${burgers.find((burger) => burger.id === id)?.name}`,
      ),
    );
    if (item.portion) details.push(item.portion);
    if (selection.combo.pizza)
      details.push(...pizzaDetails(selection.combo.pizza));
    details.push(
      `Bebida: ${drinks.find((drink) => drink.id === selection.combo?.drinkId)?.name}`,
    );
  }
  selection.removed.forEach((name) =>
    details.push(`Sem ${name.toLowerCase()}`),
  );
  selection.extraIds.forEach((id) =>
    details.push(`+ ${extras.find((extra) => extra.id === id)?.name}`),
  );
  if (selection.note.trim())
    details.push(`Observação: ${selection.note.trim()}`);
  return details;
}
export const subtotal = (lines: CartLine[]) =>
  lines.reduce((sum, line) => {
    const item = getMenuItem(line.productId);
    return sum + (item ? itemPrice(item, line.selection) * line.quantity : 0);
  }, 0);
export function customerErrors(customer: Customer): Record<string, string> {
  const errors: Record<string, string> = {};
  if (customer.name.trim().length < 2) errors.name = "Informe seu nome.";
  const phone = customer.phone
    .replace(/\D/g, "")
    .replace(/^55(?=\d{10,11}$)/, "");
  if (!/^[1-9]\d{9,10}$/.test(phone))
    errors.phone = "Informe um celular com DDD válido.";
  if (customer.method === "delivery") {
    for (const [key, label] of [
      ["street", "a rua"],
      ["number", "o número"],
      ["neighborhood", "o bairro"],
      ["city", "a cidade"],
    ] as const) {
      if (!customer[key].trim()) errors[key] = `Informe ${label}.`;
    }
  }
  return errors;
}
export function whatsappMessage(lines: CartLine[], customer: Customer): string {
  const items = lines
    .map((line) => {
      const item = getMenuItem(line.productId);
      if (!item) return "";
      return [
        `${line.quantity}x ${item.kind === "pizza" ? `Pizza ${pizzaSizes.find((size) => size.id === line.selection.pizza?.sizeId)?.name}` : item.name} — ${money(itemPrice(item, line.selection) * line.quantity)}`,
        ...itemDetails(item, line.selection).map((detail) => `- ${detail}`),
      ].join("\n");
    })
    .join("\n\n");
  const fee = customer.method === "delivery" ? restaurant.deliveryFee : 0;
  const address =
    customer.method === "delivery"
      ? [
          `Rua: ${customer.street.trim()}`,
          `Número: ${customer.number.trim()}`,
          `Bairro: ${customer.neighborhood.trim()}`,
          `Cidade: ${customer.city.trim()}`,
          customer.complement.trim() &&
            `Complemento: ${customer.complement.trim()}`,
          customer.reference.trim() &&
            `Referência: ${customer.reference.trim()}`,
        ].filter(Boolean)
      : [];
  return [
    "Olá! Gostaria de fazer este pedido:",
    "",
    "PEDIDO #DEMONSTRAÇÃO",
    "",
    items,
    "",
    `Subtotal: ${money(subtotal(lines))}`,
    fee ? `Entrega (demonstrativa): ${money(fee)}` : "Retirada: sem taxa",
    `TOTAL ESTIMADO: ${money(subtotal(lines) + fee)}`,
    "",
    customer.method === "delivery" ? "ENTREGA" : "RETIRADA NO LOCAL",
    `Nome: ${customer.name.trim()}`,
    `Celular: ${customer.phone.trim()}`,
    ...address,
    customer.note.trim() && `Observação do pedido: ${customer.note.trim()}`,
    "",
    "Pedido e valores sujeitos à confirmação da lanchonete.",
  ].join("\n");
}
export const whatsappUrl = (message: string) =>
  `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`;

export function restoreCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const usedIds = new Set<string>();
    return parsed.slice(0, 100).filter((line): line is CartLine => {
      try {
        if (
          !line ||
          typeof line.id !== "string" ||
          !line.id ||
          usedIds.has(line.id) ||
          typeof line.productId !== "string" ||
          !Number.isInteger(line.quantity) ||
          line.quantity < 1 ||
          line.quantity > 99
        )
          return false;
        const item = getMenuItem(line.productId);
        const selection = line.selection;
        if (
          !item ||
          !selection ||
          !Array.isArray(selection.removed) ||
          !Array.isArray(selection.extraIds) ||
          typeof selection.note !== "string"
        )
          return false;
        if (
          !selection.removed.every(
            (value: unknown) => typeof value === "string",
          ) ||
          !selection.extraIds.every(
            (value: unknown) => typeof value === "string",
          )
        )
          return false;
        if (selectionError(item, selection)) return false;
        usedIds.add(line.id);
        return true;
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}
