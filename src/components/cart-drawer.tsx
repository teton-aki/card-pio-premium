"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  Check,
  Copy,
  MessageCircle,
  Pencil,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";
import { Dialog } from "./dialog";
import { Quantity } from "./quantity";
import { useCart } from "@/lib/cart";
import { getMenuItem } from "@/data/catalog";
import { restaurant } from "@/data/restaurant";
import {
  customerErrors,
  itemDetails,
  itemPrice,
  money,
  whatsappMessage,
  whatsappUrl,
} from "@/lib/order";
import type { CartLine, Customer } from "@/lib/types";

export const initialCustomer: Customer = {
  method: "delivery",
  name: "",
  phone: "",
  street: "",
  number: "",
  neighborhood: "",
  city: restaurant.city,
  complement: "",
  reference: "",
  note: "",
};
export function CartDrawer({
  onClose,
  onEdit,
  customer,
  setCustomer,
}: {
  onClose: () => void;
  onEdit: (line: CartLine) => void;
  customer: Customer;
  setCustomer: (customer: Customer) => void;
}) {
  const cart = useCart();
  const [attempted, setAttempted] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const errors = attempted ? customerErrors(customer) : {};
  const fee =
    customer.method === "delivery" && cart.count > 0
      ? restaurant.deliveryFee
      : 0;
  const message = whatsappMessage(cart.lines, customer);
  const field = (
    key: keyof Customer,
    label: string,
    placeholder = "",
    optional = false,
  ) => (
    <label
      className={`checkout-field ${key === "street" || key === "complement" || key === "reference" ? "full-field" : ""}`}
    >
      <span>
        {label}
        {optional && <small>Opcional</small>}
      </span>
      <input
        id={`customer-${key}`}
        name={key}
        aria-label={label}
        type={key === "phone" ? "tel" : "text"}
        inputMode={key === "phone" ? "tel" : undefined}
        autoComplete={
          key === "name"
            ? "name"
            : key === "phone"
              ? "tel"
              : key === "street"
                ? "address-line1"
                : key === "city"
                  ? "address-level2"
                  : "off"
        }
        required={!optional}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `error-${key}` : undefined}
        maxLength={120}
        placeholder={placeholder}
        value={customer[key]}
        onChange={(event) => {
          setPrepared(false);
          setCustomer({ ...customer, [key]: event.target.value });
        }}
      />
      {errors[key] && (
        <small id={`error-${key}`} className="error-text">
          {errors[key]}
        </small>
      )}
    </label>
  );
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    const validation = customerErrors(customer);
    if (Object.keys(validation).length) {
      document
        .getElementById(`customer-${Object.keys(validation)[0]}`)
        ?.focus();
      return;
    }
    if (!cart.lines.length) return;
    setPrepared(true);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus("Mensagem copiada!");
    } catch {
      setCopyStatus("Selecione e copie o texto abaixo.");
    }
  };
  return (
    <Dialog title="Seu pedido" onClose={onClose} drawer>
      <div className="drawer-heading">
        <p className="eyebrow">QUASE NA SUA MESA</p>
        <h2>
          Seu pedido<span className="section-count">{cart.count}</span>
        </h2>
        <p>Confira, ajuste e peça do seu jeito.</p>
      </div>
      {cart.lines.length === 0 ? (
        <div className="empty-cart">
          <span>
            <ShoppingBag size={40} />
          </span>
          <h3>Tá faltando um favorito aqui.</h3>
          <p>Seu pedido começa com uma boa escolha.</p>
          <button className="button primary" onClick={onClose}>
            Explorar o cardápio
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.lines.map((line) => {
              const item = getMenuItem(line.productId)!;
              return (
                <article key={line.id} className="cart-item">
                  <div className="cart-item-top">
                    <div className="cart-item-image">
                      <Image src={item.image} alt="" fill sizes="76px" />
                    </div>
                    <div>
                      <h3>{item.name}</h3>
                      <strong>
                        {money(itemPrice(item, line.selection) * line.quantity)}
                      </strong>
                    </div>
                    <button
                      className="icon-button remove-item"
                      aria-label={`Remover ${item.name}`}
                      onClick={() => cart.remove(line.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <ul className="cart-item-details">
                    {itemDetails(item, line.selection).map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                  <div className="cart-item-actions">
                    <button className="edit-item" onClick={() => onEdit(line)}>
                      <Pencil size={14} />
                      Editar item
                    </button>
                    <Quantity
                      min={0}
                      label={`Quantidade de ${item.name}`}
                      value={line.quantity}
                      onChange={(quantity) => cart.quantity(line.id, quantity)}
                    />
                  </div>
                </article>
              );
            })}
          </div>
          <div className="clear-cart-row">
            {confirmClear ? (
              <>
                <span>Limpar todo o pedido?</span>
                <button
                  onClick={() => {
                    cart.clear();
                    setConfirmClear(false);
                  }}
                >
                  Sim, limpar
                </button>
                <button onClick={() => setConfirmClear(false)}>Cancelar</button>
              </>
            ) : (
              <button onClick={() => setConfirmClear(true)}>
                <Trash2 size={13} />
                Limpar pedido
              </button>
            )}
          </div>
          {cart.memoryOnly && (
            <p className="info-box">
              O navegador bloqueou o armazenamento. Mantenha esta página aberta
              para preservar seu pedido.
            </p>
          )}
          <form onSubmit={submit} noValidate className="checkout-form">
            <h3>Como vai ser?</h3>
            <div className="method-options">
              {(
                [
                  {
                    id: "delivery",
                    name: "Entrega",
                    icon: Bike,
                    caption: restaurant.deliveryEstimate,
                  },
                  {
                    id: "pickup",
                    name: "Retirada",
                    icon: Store,
                    caption: "Buscar na lanchonete",
                  },
                ] as const
              ).map((method) => (
                <label
                  key={method.id}
                  className={`method-option ${customer.method === method.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="delivery-method"
                    checked={customer.method === method.id}
                    onChange={() => {
                      setPrepared(false);
                      setCustomer({ ...customer, method: method.id });
                    }}
                  />
                  <method.icon size={22} />
                  <strong>{method.name}</strong>
                  <small>{method.caption}</small>
                  {customer.method === method.id && (
                    <Check size={14} className="method-check" />
                  )}
                </label>
              ))}
            </div>
            <h3>Seus dados</h3>
            <p className="field-hint">
              Só o necessário para preparar seu pedido.
            </p>
            <div className="checkout-grid">
              {field("name", "Nome", "Como podemos chamar você?")}
              {field("phone", "Celular", "(49) 99999-9999")}
            </div>
            {customer.method === "delivery" && (
              <div className="address-fields">
                <h3>Onde vamos entregar?</h3>
                <div className="checkout-grid">
                  {field("street", "Rua", "Nome da rua")}
                  {field("number", "Número", "123 ou s/n")}
                  {field("neighborhood", "Bairro", "Seu bairro")}
                  {field("city", "Cidade")}
                  {field(
                    "complement",
                    "Complemento",
                    "Apartamento, bloco...",
                    true,
                  )}
                  {field(
                    "reference",
                    "Ponto de referência",
                    "Algo que ajude a encontrar",
                    true,
                  )}
                </div>
              </div>
            )}
            {customer.method === "pickup" && (
              <p className="info-box">
                <Store size={17} />
                {restaurant.address}
                <br />
                <small>
                  Endereço demonstrativo. Confirme o local com a lanchonete.
                </small>
              </p>
            )}
            <label className="checkout-field">
              <span>
                Observações do pedido<small>Opcional</small>
              </span>
              <textarea
                rows={2}
                maxLength={500}
                placeholder="Algum detalhe que precisamos saber?"
                value={customer.note}
                onChange={(event) => {
                  setPrepared(false);
                  setCustomer({ ...customer, note: event.target.value });
                }}
              />
            </label>
            <div className="order-totals">
              <div>
                <span>Subtotal</span>
                <span>{money(cart.subtotal)}</span>
              </div>
              <div>
                <span>
                  {customer.method === "delivery"
                    ? "Entrega (demonstrativa)"
                    : "Retirada no local"}
                </span>
                <span>{fee ? money(fee) : "Sem taxa"}</span>
              </div>
              <div className="grand-total">
                <strong>Total estimado</strong>
                <strong>{money(cart.subtotal + fee)}</strong>
              </div>
            </div>
            <p className="confirmation-note">
              Pedido e valores sujeitos à confirmação da lanchonete.
            </p>
            {restaurant.isDemo && (
              <p className="demo-note">
                Demonstração: o WhatsApp pedirá que você escolha o contato da
                lanchonete.
              </p>
            )}
            <button type="submit" className="button whatsapp-button">
              <MessageCircle size={20} />
              <span>Finalizar pedido pelo WhatsApp</span>
              <ArrowUpRight size={18} />
            </button>
            <p className="checkout-privacy">
              Seus dados são usados apenas para compor a mensagem. Nenhum
              cadastro necessário.
            </p>
            {prepared && (
              <div className="message-ready" role="status">
                <strong>Mensagem pronta para enviar!</strong>
                <p>Confirme o contato e toque em enviar no WhatsApp.</p>
                <a
                  href={whatsappUrl(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir WhatsApp novamente
                  <ArrowUpRight size={14} />
                </a>
              </div>
            )}
            <details className="message-preview">
              <summary>Conferir a mensagem do pedido</summary>
              <pre>{message}</pre>
              <button type="button" className="copy-message" onClick={copy}>
                <Copy size={14} />
                Copiar mensagem
              </button>
              <span role="status">{copyStatus}</span>
            </details>
          </form>
        </>
      )}
    </Dialog>
  );
}
