import type { Product } from "@/lib/types";
import { burgerExtraIds } from "./extras";

const recipes: [string, string, number, string[]][] = [
  [
    "tradicional",
    "Dog Tradicional",
    1800,
    ["Salsicha", "Milho", "Batata palha", "Molho da casa"],
  ],
  [
    "duplo",
    "Dog Duplo",
    2200,
    ["2 salsichas", "Milho", "Batata palha", "Molho da casa"],
  ],
  ["bacon", "Dog Bacon", 2400, ["Salsicha", "Bacon", "Queijo", "Batata palha"]],
  [
    "calabresa",
    "Dog Calabresa",
    2400,
    ["Salsicha", "Calabresa", "Cebola", "Batata palha"],
  ],
  [
    "frango",
    "Dog Frango",
    2300,
    ["Salsicha", "Frango desfiado", "Catupiry", "Batata palha"],
  ],
  [
    "frango-bacon",
    "Dog Frango Bacon",
    2800,
    ["Salsicha", "Frango desfiado", "Bacon", "Batata palha"],
  ],
  [
    "coracao",
    "Dog Coração",
    2900,
    ["Salsicha", "Coração de frango", "Queijo", "Batata palha"],
  ],
  [
    "cheddar",
    "Dog Cheddar",
    2500,
    ["Salsicha", "Cheddar", "Cebola caramelizada", "Batata palha"],
  ],
  [
    "especial",
    "Dog Especial",
    3000,
    ["2 salsichas", "Bacon", "Cheddar", "Milho", "Batata palha"],
  ],
  [
    "tudo",
    "Dog Tudo",
    3400,
    [
      "2 salsichas",
      "Frango desfiado",
      "Calabresa",
      "Bacon",
      "Queijo",
      "Milho",
      "Batata palha",
    ],
  ],
];
export const hotdogs: Product[] = recipes.map(
  ([id, name, price, ingredients]) => ({
    id: `dog-${id}`,
    name,
    price,
    ingredients: ["Pão macio", ...ingredients],
    description: `Pão macio, ${ingredients.join(", ").toLowerCase()}.`,
    kind: "product",
    category: "hotdogs",
    image: "/images/hotdog.png",
    extraIds: burgerExtraIds.filter((id) => id !== "hamburger"),
  }),
);
