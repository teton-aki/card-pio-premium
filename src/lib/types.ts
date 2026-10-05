export type ProductCategory = "burgers" | "hotdogs" | "portions" | "drinks";
export interface Product {
  id: string;
  name: string;
  kind: "product";
  category: ProductCategory;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  badge?: string;
  extraIds: string[];
}
export interface PizzaFlavor {
  id: string;
  name: string;
  group: "Tradicionais" | "Especiais" | "Premium" | "Doces";
  ingredients: string[];
  surcharge: number;
}
export interface PizzaSize {
  id: string;
  name: string;
  slices: number;
  maxFlavors: number;
  basePrice: number;
  flavorMultiplier: number;
}
export interface Combo {
  id: string;
  name: string;
  kind: "combo";
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  burgerSlots: number;
  includedBurgerPrice: number;
  defaultBurgerIds: string[];
  drinkIds: string[];
  portion: string;
  pizzaSizeId?: string;
  badge?: string;
}
export interface PizzaProduct {
  id: "pizza";
  name: string;
  kind: "pizza";
  description: string;
  image: string;
  price: number;
}
export type MenuItem = Product | Combo | PizzaProduct;
export interface PizzaSelection {
  sizeId: string;
  flavorIds: string[];
  borderId: string;
}
export interface ComboSelection {
  burgerIds: string[];
  drinkId: string;
  pizza?: PizzaSelection;
}
export interface ItemSelection {
  removed: string[];
  extraIds: string[];
  note: string;
  pizza?: PizzaSelection;
  combo?: ComboSelection;
}
export interface CartLine {
  id: string;
  productId: string;
  quantity: number;
  selection: ItemSelection;
}
export interface Customer {
  method: "delivery" | "pickup";
  name: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  complement: string;
  reference: string;
  note: string;
}
