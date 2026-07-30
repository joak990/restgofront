// filepath: src/components/timeline/ReservationBlock.tsx
// Tarjeta de reserva dentro del timeline. Se posiciona absolutamente según
// la hora de inicio y la duración, y se colorea según el estado.
// Paleta RestaurantGo (forest + cream + acentos amber/emerald).

import type { TimelineReservation } from "../../data/timelineMock";
import { IcoClock, IcoUsers } from "../reservations/Icons";

interface Props {
  reserva: TimelineReservation;
  /** offset horizontal en px desde el inicio del bloque de turno */
  leftPx: number;
  /** ancho en px según la duración */
  widthPx: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const ESTADO_STYLES: Record<
  TimelineReservation["estado"],
  { bg: string; text: string; ring: string; accent: string }
> = {
  Confirmada: {
    bg: "bg-white dark:bg-stone-800",
    text: "text-stone-800 dark:text-stone-100",
    ring: "ring-forest-400",
    accent: "border-l-4 border-forest-500",
  },
  Pendiente: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-900 dark:text-amber-200",
    ring: "ring-amber-400",
    accent: "border-l-4 border-amber-500",
  },
  Sentada: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-900 dark:text-emerald-200",
    ring: "ring-emerald-400",
    accent: "border-l-4 border-emerald-600",
  },
  Cancelada: {
    bg: "bg-stone-100 dark:bg-stone-800",
    text: "text-stone-400 line-through",
    ring: "ring-stone-300",
    accent: "border-l-4 border-stone-300",
  },
};

export default function ReservationBlock({
  reserva,
  leftPx,
  widthPx,
  selected,
  onSelect,
}: Props) {
  const s = ESTADO_STYLES[reserva.estado];

  return (
    <button
      type="button"
      data-reserva
      onClick={() => onSelect?.(reserva.id)}
      // Bloque claro con barra de color a la izquierda (accent) según estado.
      // Fondo blanco/crema + texto oscuro: deja de verse todo verde.
      className={`absolute top-1 bottom-1 rounded-lg ${s.bg} ${s.text} ${s.accent} border border-cream-300 dark:border-stone-600 shadow-sm hover:shadow-md hover:z-20 transition-all text-left overflow-hidden ${
        selected ? `ring-2 ${s.ring} z-20 shadow-md` : ""
      }`}
      style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
      title={`${reserva.nombre} · ${reserva.partySize} pers · ${reserva.estado}`}
    >
      <div className="flex flex-col h-full px-2 py-1 gap-0.5 justify-center">
        {/* Nombre (siempre visible, es lo principal) */}
        <span className="text-xs font-semibold leading-tight truncate">
          {reserva.nombre}
        </span>

        {/* Hora · party · tag (sin notas/motivos) */}
        <div className="flex items-center gap-1 text-[10px] opacity-90 leading-none">
          <IcoClock size={10} className="shrink-0" />
          <span className="font-bold">{reserva.hora}</span>
          <span className="opacity-60">·</span>
          <IcoUsers size={10} className="shrink-0" />
          <span className="font-semibold">{reserva.partySize}</span>
          {reserva.tag && <span className="ml-auto shrink-0">{reserva.tag}</span>}
        </div>
      </div>
    </button>
  );
}
