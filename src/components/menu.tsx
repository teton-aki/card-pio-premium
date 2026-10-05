"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  ChefHat,
  ChevronDown,
  Clock3,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { ProductCard } from "./product-card";
import { ProductModal } from "./product-modal";
import { CartDrawer, initialCustomer } from "./cart-drawer";
import { categories, catalog, getMenuItem } from "@/data/catalog";
import { burgers } from "@/data/burgers";
import { hotdogs } from "@/data/hotdogs";
import { combos } from "@/data/combos";
import { portions } from "@/data/portions";
import { drinks } from "@/data/drinks";
import { pizzas, pizzaProduct } from "@/data/pizzas";
import { pizzaSizes } from "@/data/pizza-sizes";
import { restaurant } from "@/data/restaurant";
import { money, normalize } from "@/lib/order";
import { useCart, useHydrated } from "@/lib/cart";
import type { CartLine, MenuItem, PizzaFlavor } from "@/lib/types";

function ProductSection({
  id,
  title,
  subtitle,
  items,
  query,
  onSelect,
  combo = false,
  compact = false,
}: {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
  query: string;
  onSelect: (item: MenuItem) => void;
  combo?: boolean;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const matches = items.filter((item) =>
    normalize(item.name).includes(normalize(query)),
  );
  const limit = combo ? 3 : compact ? 6 : 6;
  const visible = query || expanded ? matches : matches.slice(0, limit);
  if (!matches.length) return null;
  return (
    <section
      id={id}
      className={`menu-section ${combo ? "combo-section" : ""}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="section-heading">
        <div>
          {combo && (
            <p className="eyebrow">
              <Sparkles size={14} /> MAIS SABOR, MAIS VANTAGEM
            </p>
          )}
          <h2 id={`${id}-heading`}>
            {title}
            <span className="section-count">{matches.length}</span>
          </h2>
          <p>{subtitle}</p>
        </div>
        {combo && (
          <span className="section-stamp">Feitos para compartilhar</span>
        )}
      </div>
      <div className={`product-grid ${compact ? "drinks-grid" : ""}`}>
        {visible.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onSelect={onSelect}
            compact={compact}
          />
        ))}
      </div>
      {!query && matches.length > limit && (
        <button className="show-more" onClick={() => setExpanded(!expanded)}>
          {expanded
            ? "Mostrar menos"
            : `Ver ${matches.length - limit} ${combo ? "combos" : "opções"} a mais`}
          <ChevronDown size={17} className={expanded ? "rotate" : ""} />
        </button>
      )}
    </section>
  );
}
function PizzaSection({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (item: MenuItem, flavorId?: string) => void;
}) {
  const [group, setGroup] = useState<PizzaFlavor["group"]>("Tradicionais");
  const matches = pizzas.filter((flavor) =>
    normalize(`pizza ${flavor.name}`).includes(normalize(query)),
  );
  const startingSize = pizzaSizes.reduce((lowest, size) =>
    size.basePrice < lowest.basePrice ? size : lowest,
  );
  const visible = query
    ? matches
    : matches.filter((flavor) => flavor.group === group);
  if (
    query &&
    !matches.length &&
    !normalize("pizza").includes(normalize(query))
  )
    return null;
  return (
    <section
      id="pizzas"
      className="menu-section"
      aria-labelledby="pizzas-heading"
    >
      <div className="section-heading">
        <div>
          <h2 id="pizzas-heading">
            Pizza do seu jeito<span className="section-count">40 sabores</span>
          </h2>
          <p>Uma pizza. Várias possibilidades. Encontre sua combinação.</p>
        </div>
      </div>
      <div className="pizza-feature">
        <div className="pizza-feature-copy">
          <p className="eyebrow">MASSA ARTESANAL · FEITA NA HORA</p>
          <h3>
            Metade de um,
            <br />
            um pouquinho de outro.
          </h3>
          <p>5 tamanhos, até 4 sabores e aquela borda que faz a diferença.</p>
          <button
            className="button primary"
            onClick={() => onSelect(pizzaProduct)}
          >
            Montar pizza
            <ArrowRight size={18} />
          </button>
          <small>
            A partir de {money(pizzaProduct.price)} · Brotinho, 4 fatias
          </small>
        </div>
        <div className="pizza-feature-image">
          <Image
            src="/images/pizza.png"
            alt="Pizza artesanal de calabresa, imagem ilustrativa"
            fill
            sizes="(max-width: 600px) 100vw, 600px"
          />
        </div>
      </div>
      {!query && (
        <div className="pizza-tabs" role="tablist" aria-label="Tipos de pizza">
          {(["Tradicionais", "Especiais", "Premium", "Doces"] as const).map(
            (tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                role="tab"
                aria-selected={group === tab}
                aria-controls="pizza-flavors"
                onClick={() => setGroup(tab)}
              >
                {tab}
                <span>10</span>
              </button>
            ),
          )}
        </div>
      )}
      <div
        id="pizza-flavors"
        role={query ? undefined : "tabpanel"}
        aria-labelledby={query ? undefined : `tab-${group}`}
        className="flavor-grid"
      >
        {visible.map((flavor) => (
          <button
            key={flavor.id}
            className="flavor-card"
            onClick={() => onSelect(pizzaProduct, flavor.id)}
          >
            <span>
              <strong>{flavor.name}</strong>
              <small>{flavor.ingredients.join(", ")}</small>
              <span className="flavor-start">
                {startingSize.name} a partir de{" "}
                {money(
                  startingSize.basePrice +
                    Math.round(
                      flavor.surcharge * startingSize.flavorMultiplier,
                    ),
                )}
              </span>
            </span>
            <PlusIcon />
          </button>
        ))}
      </div>
    </section>
  );
}
function PlusIcon() {
  return (
    <span className="flavor-plus" aria-hidden="true">
      +
    </span>
  );
}

export function Menu() {
  const cart = useCart();
  const ready = useHydrated();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("destaques");
  const [selected, setSelected] = useState<{
    item: MenuItem;
    editing?: CartLine;
    flavorId?: string;
  } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState(initialCustomer);
  const [toast, setToast] = useState("");
  const [clearQueryHint, setClearQueryHint] = useState("");
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-160px 0px -55% 0px", threshold: 0 },
    );
    document
      .querySelectorAll(".menu-section")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [query]);
  const select = (item: MenuItem, flavorId?: string) =>
    setSelected({ item, flavorId });
  const goToCategory = (id: string) => {
    if (query) {
      setQuery("");
      setClearQueryHint("Busca limpa para mostrar a categoria.");
    }
    setActive(id);
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document
          .getElementById(id)
          ?.scrollIntoView({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
            block: "start",
          }),
      ),
    );
  };
  const resultCount =
    catalog.filter(
      (item) =>
        item.kind !== "pizza" &&
        normalize(item.name).includes(normalize(query)),
    ).length +
    pizzas.filter((flavor) =>
      normalize(`pizza ${flavor.name}`).includes(normalize(query)),
    ).length;
  return (
    <>
      <a className="skip-link" href="#cardapio">
        Pular para o cardápio
      </a>
      <div className="top-note">
        <MapPin size={12} />
        <span>Lages, SC</span>
        <span className="top-note-dot">·</span>
        <span>Seu próximo pedido começa aqui.</span>
      </div>
      <header className="menu-header">
        <div className="header-inner">
          <Brand />
          <div className="header-details">
            <span className="open-status">
              <i />
              Aberto agora <small>demo</small>
            </span>
            <span className="delivery-time">
              <Clock3 size={14} />
              {restaurant.deliveryEstimate}
            </span>
          </div>
          <div className="header-links">
            <Link href="/inicio">
              Início
              <ArrowUpRight size={15} />
            </Link>
            <button
              className="button cart-button"
              disabled={!ready}
              aria-label={`Ver pedido, ${cart.count} itens`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={19} />
              <span>Meu pedido</span>
              <b key={cart.count} className="cart-count">
                {cart.count}
              </b>
            </button>
          </div>
        </div>
      </header>
      <div className="category-bar">
        <div className="category-inner">
          <nav
            className="category-links"
            inert={!ready}
            aria-label="Categorias do cardápio"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                className={active === category.id ? "active" : ""}
                aria-current={active === category.id ? "true" : undefined}
                onClick={() => goToCategory(category.id)}
              >
                <span aria-hidden="true">{category.emoji}</span>
                {category.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <main id="cardapio" className="menu-main" inert={!ready}>
        <div className="menu-intro">
          <div>
            <p className="eyebrow">BOM SABOR. BOAS ESCOLHAS.</p>
            <h1>
              Bateu a fome<span>?</span>
            </h1>
            <p>Escolha seu favorito. O resto é com a gente.</p>
          </div>
          <div className="menu-search">
            <Search size={21} />
            <input
              type="search"
              placeholder="O que você quer comer hoje?"
              aria-label="Buscar produtos"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setClearQueryHint("");
              }}
            />
            {query && (
              <button
                className="icon-button"
                aria-label="Limpar busca"
                onClick={() => setQuery("")}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <span className="sr-only" role="status">
          {clearQueryHint}
        </span>
        {query && (
          <div className="search-summary" role="status">
            {resultCount} {resultCount === 1 ? "resultado" : "resultados"} para
            “{query}”<button onClick={() => setQuery("")}>Limpar busca</button>
          </div>
        )}
        {!query && (
          <section
            id="destaques"
            className="menu-section highlights"
            aria-labelledby="destaques-heading"
          >
            <div className="section-heading">
              <div>
                <h2 id="destaques-heading">
                  Os queridinhos da casa<span className="heading-spark">✦</span>
                </h2>
                <p>Se é sua primeira vez, pode começar por aqui.</p>
              </div>
              <span className="crafted-note">
                <ChefHat size={17} />
                Feito na hora, com capricho
              </span>
            </div>
            <div className="product-grid highlight-grid">
              {[combos[0], combos[2], burgers[1]].map((item, index) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onSelect={select}
                  priority={index < 2}
                />
              ))}
            </div>
          </section>
        )}
        {query && resultCount === 0 && (
          <div className="empty-search">
            <Search size={36} />
            <h2>Nada por aqui... ainda.</h2>
            <p>Tente “bacon”, “pizza” ou o nome do seu favorito.</p>
            <button className="button primary" onClick={() => setQuery("")}>
              Ver todo o cardápio
            </button>
          </div>
        )}
        <ProductSection
          id="combos"
          title="Combos que valem a pena"
          subtitle="Seu pedido completo, com um preço que dá gosto."
          items={combos}
          query={query}
          onSelect={select}
          combo
        />
        <ProductSection
          id="burgers"
          title="X-Lanches"
          subtitle="Pão macio, recheio generoso e aquele sabor de verdade."
          items={burgers}
          query={query}
          onSelect={select}
        />
        <ProductSection
          id="hotdogs"
          title="Cachorro-quente"
          subtitle="Do clássico ao caprichado. Sempre uma boa pedida."
          items={hotdogs}
          query={query}
          onSelect={select}
        />
        <PizzaSection query={query} onSelect={select} />
        <ProductSection
          id="portions"
          title="Porções para dividir"
          subtitle="Crocantes, quentinhas e perfeitas para acompanhar."
          items={portions}
          query={query}
          onSelect={select}
        />
        <ProductSection
          id="drinks"
          title="Pra matar a sede"
          subtitle="Geladinhas, do jeito que seu pedido merece."
          items={drinks}
          query={query}
          onSelect={select}
          compact
        />
        <div className="menu-bottom-note">
          <ChefHat size={24} />
          <p>
            <strong>Seu pedido tem nosso capricho.</strong>
            <span>
              Precisa de alguma adaptação? Conte pra gente nas observações.
            </span>
          </p>
        </div>
      </main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>Feito com carinho em Lages, SC.</p>
        </div>
        <div>
          <Link href="/inicio">
            Conheça a lanchonete
            <ArrowUpRight size={15} />
          </Link>
          <p>
            Cardápio demonstrativo · fotos ilustrativas
            <br />
            Preços e pedidos sujeitos à confirmação.
          </p>
        </div>
      </footer>
      {cart.count > 0 && (
        <button
          className="mobile-cart-bar"
          onClick={() => setCartOpen(true)}
          aria-label="Ver pedido"
        >
          <span className="mobile-cart-count">
            <ShoppingBag size={19} />
            {cart.count}
          </span>
          <span>
            {cart.count} {cart.count === 1 ? "item" : "itens"} •{" "}
            <strong>{money(cart.subtotal)}</strong>
          </span>
          <span>
            Ver pedido
            <ArrowRight size={17} />
          </span>
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckToast />
          <span>{toast}</span>
          <button
            onClick={() => {
              setToast("");
              setCartOpen(true);
            }}
          >
            Ver pedido
          </button>
        </div>
      )}
      {selected && (
        <ProductModal
          key={
            selected.editing?.id ??
            `${selected.item.id}-${selected.flavorId ?? "new"}`
          }
          {...selected}
          onClose={() => setSelected(null)}
          onSave={(line) => {
            if (selected.editing) cart.update(line);
            else cart.add(line);
            setToast(
              selected.editing
                ? "Pedido atualizado com capricho."
                : `${selected.item.name} adicionado!`,
            );
            setSelected(null);
          }}
        />
      )}
      {cartOpen && (
        <CartDrawer
          customer={customer}
          setCustomer={setCustomer}
          onClose={() => setCartOpen(false)}
          onEdit={(line) => {
            const item = getMenuItem(line.productId);
            if (item) {
              setCartOpen(false);
              setSelected({ item, editing: line });
            }
          }}
        />
      )}
    </>
  );
}
function CheckToast() {
  return (
    <span className="toast-check" aria-hidden="true">
      ✓
    </span>
  );
}
