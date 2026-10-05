import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>Esse sabor não está no cardápio.</h1>
      <p>Mas seu próximo favorito está logo ali.</p>
      <Link className="button primary" href="/">
        Voltar ao cardápio
      </Link>
    </main>
  );
}
