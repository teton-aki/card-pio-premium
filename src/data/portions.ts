import type { Product } from "@/lib/types";

const recipes: [string, string, number, string][] = [
  [
    "batata-p",
    "Batata frita P",
    1600,
    "Batatas douradas e crocantes. Porção individual, 200 g.",
  ],
  [
    "batata-g",
    "Batata frita G",
    2800,
    "Batatas douradas e crocantes. Para dividir, 500 g.",
  ],
  [
    "batata-cheddar",
    "Batata com cheddar e bacon",
    3500,
    "500 g de batata, cheddar cremoso e bacon crocante.",
  ],
  [
    "polenta",
    "Polenta frita",
    2200,
    "Polenta dourada por fora e macia por dentro. 400 g.",
  ],
  [
    "calabresa",
    "Calabresa acebolada",
    3200,
    "Calabresa na chapa com cebola dourada. 400 g.",
  ],
  [
    "frango",
    "Frango a passarinho",
    4200,
    "Frango crocante com alho e ervas. 600 g.",
  ],
  [
    "cebola",
    "Anéis de cebola",
    2600,
    "Anéis empanados e molho da casa. 300 g.",
  ],
  [
    "iscas",
    "Iscas de frango",
    3400,
    "Iscas empanadas com molho da casa. 400 g.",
  ],
  [
    "mista",
    "Porção mista",
    5500,
    "Batata, calabresa e iscas de frango. 800 g.",
  ],
  [
    "familia",
    "Porção família",
    7200,
    "Batata, frango, anéis de cebola e calabresa. 1,2 kg.",
  ],
];
export const portions: Product[] = recipes.map(
  ([id, name, price, description]) => ({
    id: `porcao-${id}`,
    name,
    price,
    description,
    ingredients: [],
    kind: "product",
    category: "portions",
    image: "/images/fries.png",
    extraIds: ["bacon", "cheddar", "catupiry", "cheese"],
  }),
);
