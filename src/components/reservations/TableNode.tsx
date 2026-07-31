// filepath: src/components/reservations/TableNode.tsx
// Mesa individual en el canvas del "Vista de mesa".
// Diseño: mesa rectangular con sillas (cuadraditos grises) pegadas
// a la mesa, distribución según capacidad. Estilo RestaurantGo.
//
// Acepta una prop `size` (px) que actúa como el ALTO de la mesa; el
// ancho se calcula en función de la capacidad (factor 1.8:1).

import type { FloorTable } from "../../data/reservationsMock";
import { IcoClock, IcoReceipt } from "./Icons";

interface Props {
  table: FloorTable;
  /** Alto de la mesa en píxeles (el ancho se calcula). */
  size?: number;
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

/** Cuántas sillas van arriba y abajo según la capacidad */
function distribucionSillas(capacidad: number): { up: number; down: number } {
  const up = Math.max(1, Math.ceil(capacidad / 2));
  const down = Math.max(1, Math.floor(capacidad / 2));
  return { up, down };
}

export default function TableNode({
  table,
  size = 88,
  selected,
  reservationCount: _reservationCount,
  onSelect,
}: Props) {
  // Tamaño de cada silla: más alargada (ancho) que alta
  const chairHeight = Math.max(6, Math.round(size * 0.10));
  const chairWidth = Math.max(8, Math.round(size * 0.30)); // antes era 0.6 del height
  const { up, down } = distribucionSillas(table.capacidad);

  // Relación ancho/alto de la mesa: 1.6 a 2.0 según la capacidad
  const aspectRatio = table.capacidad <= 2 ? 1.4 : table.capacidad <= 6 ? 1.7 : 2.0;
  const tableHeight = size;
  const tableWidth = Math.max(size, tableHeight * aspectRatio);

  // Gap entre sillas: 2px para que no se amontonen
  const chairGap = 2;

  // ----- Sillas up -----
  const upTotalWidth = up * chairWidth + (up - 1) * chairGap;
  const upStartX = (tableWidth - upTotalWidth) / 2;

  // ----- Sillas down -----
  const downTotalWidth = down * chairWidth + (down - 1) * chairGap;
  const downStartX = (tableWidth - downTotalWidth) / 2;

  const base =
    "relative flex flex-col items-center justify-center select-none transition-all cursor-pointer " +
    STATUS_CLASSES[table.status];

  const style: React.CSSProperties = {
    width: `${tableWidth}px`,
    height: `${tableHeight}px`,
  };

  // Color del header de hora según status
  const headerBg =
    table.status === "libre"
      ? "bg-forest-700 text-cream-50"
      : table.status === "reservada"
        ? "bg-stone-900 text-cream-50"
        : table.status === "cuenta"
          ? "bg-stone-900/85 text-cream-50"
          : "bg-stone-700 text-stone-200";

  // Texto MUY chiquito: número 12-13px, "X pers" 9px
  const numFontSize = Math.max(11, Math.round(size * 0.14));
  const capFontSize = Math.max(8, Math.round(size * 0.09));
  const headerFontSize = Math.max(8, Math.round(size * 0.10));
  const iconSize = Math.max(8, Math.round(size * 0.10));

  return (
    <div
      className="relative"
      style={{
        width: `${tableWidth}px`,
        height: `${tableHeight + chairHeight * 2}px`,
      }}
    >
      {/* Sillas arriba (pegadas a la mesa) — estilo restaurant real: respaldo + asiento */}
      {Array.from({ length: up }).map((_, i) => (
        <Chair
          key={`u-${i}`}
          width={chairWidth}
          height={chairHeight}
          left={upStartX + i * (chairWidth + chairGap)}
          top={0}
        />
      ))}

      {/* Mesa */}
      <button
        type="button"
        onClick={() => onSelect?.(table.id)}
        disabled={table.status === "bloqueada"}
        className={`${base} rounded-md ${selected ? "ring-2 ring-forest-700 ring-offset-2 ring-offset-cream-100 shadow-lg" : ""}`}
        style={{
          ...style,
          position: "absolute",
          left: 0,
          top: `${chairHeight}px`,
        }}
        title={`Mesa ${table.numero} · ${table.capacidad} pers · ${table.status}`}
      >
        {/* Header de hora */}
        {table.horaEstimada && (
          <div
            className={`w-full flex items-center justify-center gap-1 px-1 py-0.5 font-bold rounded-t-md ${headerBg}`}
            style={{ fontSize: `${headerFontSize}px`, lineHeight: 1.1 }}
          >
            <IcoClock size={iconSize} />
            <span>{table.horaEstimada}</span>
          </div>
        )}

        {/* Badge absoluto (esquina sup. derecha) — sólo para cuenta */}
        {table.status === "cuenta" && (
          <span
            className="absolute top-0.5 right-0.5 rounded-full bg-white shadow border border-cream-300 flex items-center justify-center z-10 text-stone-700"
            style={{
              width: `${Math.max(12, size * 0.18)}px`,
              height: `${Math.max(12, size * 0.18)}px`,
            }}
          >
            <IcoReceipt size={iconSize} />
          </span>
        )}

        {/* Cuerpo: número + capacidad */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-1 py-0.5 gap-0">
          <span
            className="font-bold leading-none"
            style={{ fontSize: `${numFontSize}px` }}
          >
            {table.numero}
          </span>
          <span
            className="opacity-70 leading-none"
            style={{ fontSize: `${capFontSize}px` }}
          >
            {table.capacidad} pers
          </span>
        </div>
      </button>

      {/* Sillas abajo (pegadas a la mesa) */}
      {Array.from({ length: down }).map((_, i) => (
        <Chair
          key={`d-${i}`}
          width={chairWidth}
          height={chairHeight}
          left={downStartX + i * (chairWidth + chairGap)}
          top={chairHeight + tableHeight}
        />
      ))}
    </div>
  );
}

/**
 * Silla de restaurante: respaldo oscuro arriba + asiento más claro abajo.
 * Inspirado en mesas de restaurant reales con IU/notch en el respaldo.
 */
function Chair({
  width,
  height,
  left,
  top,
}: {
  width: number;
  height: number;
  left: number;
  top: number;
}) {
  // 60% respaldo, 40% asiento
  const respaldoH = Math.max(3, Math.round(height * 0.6));
  const asientoH = height - respaldoH;
  return (
    <span
      className="absolute"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      {/* Respaldo (parte de arriba, más oscura) */}
      <span
        className="absolute left-0 right-0 top-0 bg-stone-500 rounded-t-[2px] border border-stone-600"
        style={{ height: `${respaldoH}px` }}
      />
      {/* Asiento (parte de abajo, más claro) */}
      <span
        className="absolute left-0 right-0 bottom-0 bg-stone-300 rounded-b-[2px] border border-stone-500"
        style={{ height: `${asientoH}px` }}
      />
    </span>
  );
}
