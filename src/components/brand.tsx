import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function Brand() {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="Sua Lanchonete Aqui — cardápio"
    >
      <span className="brand-mark">
        <UtensilsCrossed size={26} strokeWidth={1.8} />
      </span>
      <span>
        <strong>
          Sua Lanchonete
          <span>
            Aqui<span className="brand-dot">.</span>
          </span>
        </strong>
        <small>CAPRICHO EM CADA MORDIDA</small>
      </span>
    </Link>
  );
}
