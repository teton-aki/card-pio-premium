"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ShoppingBag } from "lucide-react";
import { Dialog } from "./dialog";
import { PizzaPicker } from "./pizza-picker";
import { Quantity } from "./quantity";
import { extras } from "@/data/extras";
import { burgers } from "@/data/burgers";
import { drinks } from "@/data/drinks";
import {
  defaultSelection,
  itemPrice,
  money,
  selectionError,
} from "@/lib/order";
import type { CartLine, ItemSelection, MenuItem } from "@/lib/types";

export function ProductModal({
  item,
  editing,
  flavorId,
  onClose,
  onSave,
}: {
  item: MenuItem;
  editing?: CartLine;
  flavorId?: string;
  onClose: () => void;
  onSave: (line: CartLine) => void;
}) {
  const [selection, setSelection] = useState<ItemSelection>(() =>
    editing
      ? structuredClone(editing.selection)
      : defaultSelection(item, flavorId),
  );
  const [quantity, setQuantity] = useState(editing?.quantity ?? 1);
  const error = selectionError(item, selection);
  const price = itemPrice(item, selection);
  const toggle = (key: "removed" | "extraIds", id: string) =>
    setSelection((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((value) => value !== id)
        : [...current[key], id],
    }));
  const save = () => {
    if (!error)
      onSave({
        id: editing?.id ?? crypto.randomUUID(),
        productId: item.id,
        quantity,
        selection,
      });
  };
  return (
    <Dialog
      title={editing ? `Editar ${item.name}` : item.name}
      onClose={onClose}
    >
      <div className="modal-image">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 640px"
        />
        <span className="photo-note">Imagem ilustrativa</span>
      </div>
      <div className="modal-copy">
        <p className="eyebrow">
          {item.kind === "combo"
            ? "Juntos fica ainda melhor"
            : item.kind === "pizza"
              ? "Sua combinação favorita"
              : "Feito na hora, do seu jeito"}
        </p>
        <h2>{item.name}</h2>
        <p className="muted">{item.description}</p>
        {item.kind === "combo" && (
          <div className="saving-line">
            Economize {money(item.originalPrice - item.price)} na combinação
            base. Trocas premium têm acréscimo.
          </div>
        )}
        {item.kind === "product" && item.ingredients.length > 0 && (
          <fieldset>
            <legend className="option-heading">
              Quer tirar algum ingrediente? <span>Opcional</span>
            </legend>
            <div className="ingredient-grid">
              {item.ingredients.map((ingredient) => (
                <label
                  key={ingredient}
                  className={`ingredient-option ${selection.removed.includes(ingredient) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selection.removed.includes(ingredient)}
                    onChange={() => toggle("removed", ingredient)}
                  />
                  {selection.removed.includes(ingredient) && (
                    <Check size={14} />
                  )}{" "}
                  Sem {ingredient.toLowerCase()}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {item.kind === "product" && item.extraIds.length > 0 && (
          <fieldset>
            <legend className="option-heading">
              Dê um toque a mais <span>Opcional</span>
            </legend>
            {extras
              .filter((extra) => item.extraIds.includes(extra.id))
              .map((extra) => (
                <label key={extra.id} className="choice-row">
                  <input
                    type="checkbox"
                    checked={selection.extraIds.includes(extra.id)}
                    onChange={() => toggle("extraIds", extra.id)}
                  />
                  <span>{extra.name}</span>
                  <span className="choice-price">+ {money(extra.price)}</span>
                </label>
              ))}
          </fieldset>
        )}
        {item.kind === "pizza" && selection.pizza && (
          <PizzaPicker
            value={selection.pizza}
            onChange={(pizza) => setSelection({ ...selection, pizza })}
          />
        )}
        {item.kind === "combo" && selection.combo && (
          <div className="combo-picker">
            {item.burgerSlots > 0 && (
              <fieldset>
                <legend className="option-heading">
                  {item.burgerSlots === 1
                    ? "Escolha seu lanche"
                    : `Escolha ${item.burgerSlots} lanches`}{" "}
                  <span>Incluídos no combo</span>
                </legend>
                <p className="field-hint">
                  Os acréscimos indicados são por lanche. A porção{" "}
                  {item.portion.toLowerCase()} já está incluída.
                </p>
                {Array.from({ length: item.burgerSlots }, (_, index) => (
                  <label className="select-field" key={index}>
                    Lanche {index + 1}
                    <select
                      value={selection.combo!.burgerIds[index]}
                      onChange={(event) =>
                        setSelection({
                          ...selection,
                          combo: {
                            ...selection.combo!,
                            burgerIds: selection.combo!.burgerIds.map(
                              (id, slot) =>
                                slot === index ? event.target.value : id,
                            ),
                          },
                        })
                      }
                    >
                      {burgers.map((burger) => (
                        <option key={burger.id} value={burger.id}>
                          {burger.name}
                          {burger.price > item.includedBurgerPrice
                            ? ` (+ ${money(burger.price - item.includedBurgerPrice)})`
                            : " (incluído)"}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </fieldset>
            )}
            {selection.combo.pizza && (
              <PizzaPicker
                fixedSize
                value={selection.combo.pizza}
                onChange={(pizza) =>
                  setSelection({
                    ...selection,
                    combo: { ...selection.combo!, pizza },
                  })
                }
              />
            )}
            <fieldset>
              <legend className="option-heading">
                Escolha sua bebida <span>Incluída</span>
              </legend>
              {drinks
                .filter((drink) => item.drinkIds.includes(drink.id))
                .map((drink) => (
                  <label key={drink.id} className="choice-row">
                    <input
                      type="radio"
                      name="combo-drink"
                      checked={selection.combo!.drinkId === drink.id}
                      onChange={() =>
                        setSelection({
                          ...selection,
                          combo: { ...selection.combo!, drinkId: drink.id },
                        })
                      }
                    />
                    <span>{drink.name}</span>
                    <span className="choice-price">Incluída</span>
                  </label>
                ))}
            </fieldset>
            {item.portion && item.burgerSlots === 0 && (
              <p className="info-box">{item.portion} incluída no combo.</p>
            )}
          </div>
        )}
        <label className="notes-field">
          <span className="option-heading">
            Alguma observação? <small>Opcional</small>
          </span>
          <textarea
            placeholder="Ex.: cortar ao meio, molho separado..."
            maxLength={280}
            rows={2}
            value={selection.note}
            onChange={(event) =>
              setSelection({ ...selection, note: event.target.value })
            }
          />
          <span className="character-count">{selection.note.length}/280</span>
        </label>
      </div>
      <div className="modal-footer">
        {error && (
          <p className="selection-hint" aria-live="polite">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <Quantity value={quantity} onChange={setQuantity} />
          <button className="button primary" disabled={!!error} onClick={save}>
            <ShoppingBag size={18} />
            <span>{editing ? "Salvar alterações" : "Adicionar ao pedido"}</span>
            <strong>{money(price * quantity)}</strong>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
