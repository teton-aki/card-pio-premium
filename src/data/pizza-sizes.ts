import type { PizzaSize } from "@/lib/types";

export const pizzaSizes: PizzaSize[] = [
  {
    id: "brotinho",
    name: "Brotinho",
    slices: 4,
    maxFlavors: 1,
    basePrice: 2800,
    flavorMultiplier: 0.5,
  },
  {
    id: "pequena",
    name: "Pequena",
    slices: 6,
    maxFlavors: 2,
    basePrice: 4200,
    flavorMultiplier: 0.7,
  },
  {
    id: "media",
    name: "Média",
    slices: 8,
    maxFlavors: 2,
    basePrice: 5500,
    flavorMultiplier: 0.85,
  },
  {
    id: "grande",
    name: "Grande",
    slices: 12,
    maxFlavors: 3,
    basePrice: 6800,
    flavorMultiplier: 1,
  },
  {
    id: "familia",
    name: "Família",
    slices: 16,
    maxFlavors: 4,
    basePrice: 8500,
    flavorMultiplier: 1.2,
  },
];
// Regra substituível sem modificar a interface.
export const pizzaPricingRule: "highest" | "average" = "highest";
