import { burgers } from "./burgers";
import { hotdogs } from "./hotdogs";
import { portions } from "./portions";
import { drinks } from "./drinks";
import { combos } from "./combos";
import { pizzaProduct } from "./pizzas";
import type { MenuItem } from "@/lib/types";

// A interface depende deste adaptador; uma API pode substituir a origem dos dados.
export const catalog: MenuItem[] = [
  ...burgers,
  ...hotdogs,
  ...portions,
  ...drinks,
  ...combos,
  pizzaProduct,
];
export const getMenuItem = (id: string) =>
  catalog.find((item) => item.id === id);
export const categories = [
  { id: "destaques", label: "Destaques", emoji: "🔥" },
  { id: "burgers", label: "X-Lanches", emoji: "🍔" },
  { id: "hotdogs", label: "Cachorro-quente", emoji: "🌭" },
  { id: "pizzas", label: "Pizzas", emoji: "🍕" },
  { id: "portions", label: "Porções", emoji: "🍟" },
  { id: "drinks", label: "Bebidas", emoji: "🥤" },
  { id: "combos", label: "Combos", emoji: "🎁" },
];
