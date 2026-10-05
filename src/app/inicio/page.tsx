import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChefHat,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  UtensilsCrossed,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { restaurant } from "@/data/restaurant";
import { whatsappUrl } from "@/lib/order";

export const metadata: Metadata = { title: "Nossa casa" };
export default function Inicio() {
  return (
    <>
      <div className="top-note">
        <MapPin size={12} />
        Lages, SC<span className="top-note-dot">·</span>Capricho em cada
        mordida.
      </div>
      <header className="menu-header institutional-header">
        <div className="header-inner">
          <Brand />
          <Link className="button primary" href="/">
            Abrir cardápio
            <ArrowRight size={18} />
          </Link>
        </div>
      </header>
      <main className="institutional-main">
        <section className="about-hero">
          <div>
            <p className="eyebrow">BEM-VINDO À NOSSA CASA</p>
            <h1>
              Sabor que reúne.
              <br />
              Capricho que
              <br />
              <span>fica na memória.</span>
            </h1>
            <p>
              Lanches generosos, pizzas para compartilhar e um motivo a mais
              para reunir quem você gosta. Aqui, cada pedido é preparado com
              carinho.
            </p>
            <Link href="/" className="button primary">
              Encontre seu próximo favorito
              <ArrowRight size={18} />
            </Link>
            <span className="about-location">
              <MapPin size={15} />
              De Lages, com muito sabor.
            </span>
          </div>
          <div className="about-hero-image">
            <Image
              src="/images/burger.png"
              alt="Hambúrguer artesanal, batatas e pizza, imagem ilustrativa"
              fill
              preload
              sizes="(max-width: 700px) 100vw, 600px"
            />
            <span className="about-image-caption">
              <ChefHat size={22} />
              <strong>
                Feito na hora.<small>Do primeiro ao último detalhe.</small>
              </strong>
            </span>
          </div>
        </section>
        <section className="about-story">
          <p className="eyebrow">UMA BOA COMIDA MUDA O DIA</p>
          <h2>
            Mais que um pedido.
            <br />
            Um momento gostoso.
          </h2>
          <p>
            Uma mesa cheia, uma conversa boa e aquele lanche que chega
            quentinho. É essa experiência que inspira Sua Lanchonete Aqui:
            comida sem complicação, ingredientes selecionados e porções com
            vontade de repetir.
          </p>
          <p className="demo-story">
            Esta é uma marca fictícia para demonstração. A história, o endereço,
            os horários e os valores podem ser adaptados para a sua lanchonete.
          </p>
        </section>
        <section className="about-values">
          {[
            {
              icon: ChefHat,
              title: "Feito na hora",
              text: "Do pão à última batatinha, cada pedido recebe atenção.",
            },
            {
              icon: UtensilsCrossed,
              title: "Do seu jeito",
              text: "Seu lanche, sua pizza, sua combinação. Você escolhe.",
            },
            {
              icon: Heart,
              title: "Bom para dividir",
              text: "Combos generosos para os encontros que merecem sabor.",
            },
          ].map((value) => (
            <article key={value.title}>
              <value.icon size={28} strokeWidth={1.5} />
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}
        </section>
        <section className="about-visit">
          <div>
            <p className="eyebrow">TEM SEMPRE UM LUGAR PRA VOCÊ</p>
            <h2>
              Peça em casa.
              <br />
              Ou venha nos ver.
            </h2>
            <div className="visit-detail">
              <Clock3 size={22} />
              <div>
                <strong>Horários demonstrativos</strong>
                <p>{restaurant.hours}</p>
              </div>
            </div>
            <div className="visit-detail">
              <MapPin size={22} />
              <div>
                <strong>Endereço demonstrativo</strong>
                <p>{restaurant.address}</p>
              </div>
            </div>
            <a
              className="text-link"
              href={whatsappUrl(
                "Olá! Gostaria de saber mais sobre a lanchonete.",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} />
              Conversar pelo WhatsApp
              <ArrowUpRight size={16} />
            </a>
            <p className="field-hint">
              Na demonstração, escolha o contato ao abrir o WhatsApp.
            </p>
            {restaurant.instagram && (
              <a
                className="text-link"
                href={restaurant.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Nosso Instagram
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>
          <div className="location-card">
            <div className="map-art" aria-hidden="true">
              <span className="map-pin">
                <MapPin size={35} fill="currentColor" />
                <i />
              </span>
              <span className="map-city">LAGES</span>
              <span className="map-caption">SERRA CATARINENSE</span>
            </div>
            <div>
              <strong>Nosso sabor é daqui.</strong>
              <p>Lages, Santa Catarina · localização da cidade</p>
              <a
                href={restaurant.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver Lages no Google Maps
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>
        <section className="about-cta">
          <p className="eyebrow">AGORA A PARTE MAIS GOSTOSA</p>
          <h2>O que vai ser hoje?</h2>
          <p>Seu favorito está a um pedido de distância.</p>
          <Link className="button primary" href="/">
            Ver cardápio
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>Feito com carinho em Lages, SC.</p>
        </div>
        <p>
          Marca fictícia · cardápio demonstrativo.
          <br />
          Fotos ilustrativas. Informações sujeitas à confirmação.
        </p>
      </footer>
    </>
  );
}
