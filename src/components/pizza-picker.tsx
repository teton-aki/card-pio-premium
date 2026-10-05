"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { pizzas } from "@/data/pizzas";
import { pizzaSizes, pizzaPricingRule } from "@/data/pizza-sizes";
import { borders } from "@/data/extras";
import { money, normalize } from "@/lib/order";
import type { PizzaSelection } from "@/lib/types";

export function PizzaPicker({
  value,
  onChange,
  fixedSize = false,
}: {
  value: PizzaSelection;
  onChange: (value: PizzaSelection) => void;
  fixedSize?: boolean;
}) {
  const [query, setQuery] = useState("");
  const size = pizzaSizes.find((size) => size.id === value.sizeId)!;
  const toggleFlavor = (id: string) =>
    onChange({
      ...value,
      flavorIds: value.flavorIds.includes(id)
        ? value.flavorIds.filter((flavor) => flavor !== id)
        : [...value.flavorIds, id],
    });
  return (
    <div className="pizza-picker">
      {!fixedSize && (
        <fieldset>
          <legend className="option-heading">
            Escolha o tamanho <span>Obrigatório</span>
          </legend>
          <div className="size-grid">
            {pizzaSizes.map((option) => (
              <label
                key={option.id}
                className={`size-option ${value.sizeId === option.id ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="pizza-size"
                  value={option.id}
                  checked={value.sizeId === option.id}
                  onChange={() => onChange({ ...value, sizeId: option.id })}
                />
                <strong>{option.name}</strong>
                <small>{option.slices} fatias</small>
                <span>{money(option.basePrice)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {fixedSize && (
        <div className="info-box">
          <strong>Pizza {size.name}</strong> · {size.slices} fatias · até{" "}
          {size.maxFlavors} sabores
        </div>
      )}
      <fieldset>
        <legend className="option-heading">
          Escolha os sabores{" "}
          <span>
            {value.flavorIds.length}/{size.maxFlavors} selecionados
          </span>
        </legend>
        <p
          className={`field-hint ${value.flavorIds.length > size.maxFlavors ? "error-text" : ""}`}
          aria-live="polite"
        >
          {value.flavorIds.length > size.maxFlavors
            ? `Remova ${value.flavorIds.length - size.maxFlavors} sabor(es) para este tamanho.`
            : `Escolha de 1 a ${size.maxFlavors} ${size.maxFlavors === 1 ? "sabor" : "sabores"}. As partes são iguais.`}
        </p>
        <div className="compact-search">
          <Search size={17} />
          <input
            aria-label="Buscar sabores"
            placeholder="Buscar um sabor..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flavor-list">
          {(["Tradicionais", "Especiais", "Premium", "Doces"] as const).map(
            (group) => {
              const flavors = pizzas.filter(
                (flavor) =>
                  flavor.group === group &&
                  normalize(flavor.name).includes(normalize(query)),
              );
              return (
                flavors.length > 0 && (
                  <div key={group}>
                    <p className="flavor-group">{group}</p>
                    {flavors.map((flavor) => {
                      const selected = value.flavorIds.includes(flavor.id);
                      const price =
                        size.basePrice +
                        Math.round(flavor.surcharge * size.flavorMultiplier);
                      return (
                        <label
                          key={flavor.id}
                          className={`choice-row ${selected ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={
                              !selected &&
                              value.flavorIds.length >= size.maxFlavors
                            }
                            onChange={() => toggleFlavor(flavor.id)}
                          />
                          <span className="check-box">
                            {selected && <Check size={14} />}
                          </span>
                          <span className="choice-copy">
                            <strong>{flavor.name}</strong>
                            <small>{flavor.ingredients.join(", ")}</small>
                          </span>
                          <span className="choice-price">{money(price)}</span>
                        </label>
                      );
                    })}
                  </div>
                )
              );
            },
          )}
          {!pizzas.some((flavor) =>
            normalize(flavor.name).includes(normalize(query)),
          ) && (
            <p className="field-hint">
              Nenhum sabor encontrado. Tente outro nome.
            </p>
          )}
        </div>
        <p className="price-rule">
          {pizzaPricingRule === "highest"
            ? "O preço considera o sabor de maior valor no tamanho escolhido, sem somar os sabores."
            : "O preço considera a média dos sabores no tamanho escolhido."}{" "}
          A borda é cobrada à parte.
        </p>
      </fieldset>
      <fieldset>
        <legend className="option-heading">Uma borda para completar?</legend>
        {borders.map((border) => (
          <label key={border.id} className="choice-row border-choice">
            <input
              type="radio"
              name="pizza-border"
              checked={value.borderId === border.id}
              onChange={() => onChange({ ...value, borderId: border.id })}
            />
            <span>{border.name}</span>
            <span className="choice-price">
              {border.price ? `+ ${money(border.price)}` : "Sem custo"}
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
