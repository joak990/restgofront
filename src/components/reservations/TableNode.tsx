// filepath: src/components/reservations/TableNode.tsx
// Mesa individual en el canvas. La hora se renderiza SIEMPRE dentro de la
// mesa como una banda superior (no flota fuera), garantizando que se vea
// siempre sin importar el overflow del canvas. Estilo coherente con la
// paleta RestaurantGo (cream / forest).

import type { FloorTable } from "../../data/reservationsMock";
import { IcoClock, IcoReceipt } from "./Icons";

interface Props {
  table: FloorTable;
  selected?: boolean;
  reservationCount?: number;
  onSelect?: (id: string) => void;
}

const STATUS_CLASSES: Record<FloorTable["status"], string> = {
  libre:
    "bg-cream-200 text-forest-800 border-2 border-forest-400 hover:border-forest-600 shadow-sm",
  reservada:
    "bg-amber-300 text-stone-900 border border-amber-500 hover:border-amber-600 shadow-sm",
  cuenta:
    "bg-emerald-500 text-white border border-emerald-700 shadow-md shadow-emerald-900/20",
  bloqueada:
    "bg-stone-300 text-stone-500 border border-stone-400 cursor-not-allowed opacity-70",
};

export default function TableNode({
  table,
  selected,
  reservationCount,
  onSelect,
}: Props) {
  const base =
    "relative flex flex-col items-center justify-center select-none transition-all cursor-pointer overflow-hidden " +
    STATUS_CLASSES[table.status];

  const style: React.CSSProperties = {
    width: `${table.ancho * 32}px`,
    minHeight: `${table.alto * 32}px`,
  };

  const shapeClass = table.forma === "round" ? "rounded-full" : "rounded-xl";

  // Color del header de hora según status
  const headerBg =
    table.status === "libre"
      ? "bg-forest-700 text-cream-50"
      : table.status === "reservada"
        ? "bg-stone-900 text-cream-50"
        : table.status === "cuenta"
          ? "bg-stone-900/85 text-cream-50"
          : "bg-stone-700 text-stone-200";

  const headerShape =
    table.forma === "round"
      ? "rounded-full"
      : "rounded-t-xl";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(table.id)}
      disabled={table.status === "bloqueada"}
      className={`${base} ${shapeClass} ${
        selected
          ? "ring-2 ring-forest-700 ring-offset-2 ring-offset-cream-100 shadow-lg"
          : ""
      }`}
      style={style}
      title={`Mesa ${table.numero} · ${table.capacidad} pers · ${table.status}`}
    >
      {/* Header de hora — banda oscura dentro de la mesa */}
      {table.horaEstimada && (
        <div
          className={`w-full flex items-center justify-center gap-1 px-1 py-1 text-[11px] font-bold ${headerShape} ${headerBg}`}
        >
          <IcoClock size={11} />
          <span>{table.horaEstimada}</span>
        </div>
      )}

      {/* Badge absoluto (esquina sup. derecha) — sólo para cuenta */}
      {table.status === "cuenta" && (
        <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow border border-cream-300 flex items-center justify-center z-10 text-stone-700">
          <IcoReceipt size={11} />
        </span>
      )}

      {/* Cuerpo: número + capacidad */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-1 gap-0.5">
        <span className="text-xl font-bold leading-none">{table.numero}</span>
        <span className="text-[11px] opacity-70">
          {table.capacidad} pers
        </span>
      </div>

      {/* Footer: badge de reservas */}
      {typeof reservationCount === "number" && reservationCount > 0 && (
        <div className="w-full pb-1.5 flex justify-center">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/25 text-current">
            {reservationCount} reserva{reservationCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </button>
  );
}