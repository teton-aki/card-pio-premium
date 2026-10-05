import { Minus, Plus } from "lucide-react";

export function Quantity({
  value,
  onChange,
  min = 1,
  label = "Quantidade",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  label?: string;
}) {
  return (
    <div className="quantity" role="group" aria-label={label}>
      <button
        type="button"
        disabled={value <= min}
        aria-label={`Diminuir ${label.toLowerCase()}`}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        disabled={value >= 99}
        aria-label={`Aumentar ${label.toLowerCase()}`}
        onClick={() => onChange(Math.min(99, value + 1))}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
