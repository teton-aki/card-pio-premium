import Image from "next/image";
import { Plus, ArrowUpRight } from "lucide-react";
import { money } from "@/lib/order";
import type { MenuItem } from "@/lib/types";

export function ProductCard({
  item,
  onSelect,
  priority = false,
  compact = false,
}: {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <article
      className={`product-card ${item.kind === "combo" ? "combo-card" : ""} ${compact ? "compact-card" : ""}`}
    >
      <button
        className="card-image"
        aria-label={`Personalizar ${item.name}`}
        onClick={() => onSelect(item)}
      >
        <Image
          src={item.image}
          alt={`Imagem ilustrativa de ${item.kind === "product" && item.category === "drinks" ? "bebidas" : item.name}`}
          fill
          sizes={
            compact
              ? "112px"
              : "(max-width: 600px) 50vw, (max-width: 1000px) 50vw, 400px"
          }
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
        {item.kind === "combo" ? (
          <span className="card-badge savings-badge">
            Economize {money(item.originalPrice - item.price)}
          </span>
        ) : "badge" in item && item.badge ? (
          <span className="card-badge">{item.badge}</span>
        ) : null}
      </button>
      <div className="card-copy">
        <h3>
          <button onClick={() => onSelect(item)}>{item.name}</button>
        </h3>
        <p>{item.description}</p>
        <div className="card-bottom">
          <div className="card-price">
            {item.kind === "combo" && <del>{money(item.originalPrice)}</del>}
            <strong>{money(item.price)}</strong>
          </div>
          <button
            className={
              item.kind === "combo" ? "card-add combo-add" : "card-add"
            }
            aria-label={`${item.kind === "combo" ? "Montar" : "Adicionar"} ${item.name}`}
            onClick={() => onSelect(item)}
          >
            <span>{item.kind === "combo" ? "Montar combo" : "Adicionar"}</span>
            {item.kind === "combo" ? (
              <ArrowUpRight size={18} />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
