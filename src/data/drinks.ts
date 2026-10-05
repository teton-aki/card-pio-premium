import type { Product } from "@/lib/types";

const recipes: [string, string, number, string][] = [
  ["coca-lata", "Coca-Cola lata", 650, "350 ml · geladinha"],
  ["coca-600", "Coca-Cola 600 ml", 900, "600 ml · geladinha"],
  ["coca-1l", "Coca-Cola 1 L", 1100, "1 litro · para dividir"],
  ["coca-2l", "Coca-Cola 2 L", 1500, "2 litros · para a galera"],
  ["guarana-lata", "Guaraná lata", 600, "350 ml · geladinho"],
  ["guarana-1l", "Guaraná 1 L", 1000, "1 litro · para dividir"],
  ["guarana-2l", "Guaraná 2 L", 1300, "2 litros · para a galera"],
  ["fanta-lata", "Fanta laranja lata", 600, "350 ml · geladinha"],
  ["sprite-lata", "Sprite lata", 600, "350 ml · geladinha"],
  ["agua", "Água mineral", 450, "500 ml · sem gás"],
  ["agua-gas", "Água com gás", 500, "500 ml · com gás"],
  ["suco-laranja", "Suco de laranja", 1000, "400 ml · natural, feito na hora"],
  ["suco-uva", "Suco de uva", 900, "400 ml · integral"],
  ["energetico", "Energético Volt", 1200, "250 ml · marca demonstrativa"],
];
export const drinks: Product[] = recipes.map(
  ([id, name, price, description]) => ({
    id,
    name,
    price,
    description,
    ingredients: [],
    kind: "product",
    category: "drinks",
    image: "/images/drinks.png",
    extraIds: [],
  }),
);
