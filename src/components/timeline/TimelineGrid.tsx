// filepath: src/components/timeline/TimelineGrid.tsx
// Grilla timeline unificada: un solo eje corrido de HORA_INICIO a HORA_FIN
// (sin separar almuerzo/cena). El gap entre turnos se muestra como zona
// "Cerrado". Filas = mesas, columnas = horas.
//
// Incluye una línea de tiempo (scrubber) vertical arrastrable: al moverla
// recalcula y muestra la hora a la que apunta.

import { useMemo, useRef, useState } from "react";
import {
  GAP_FIN,
  GAP_INICIO,
  HORA_FIN,
  HORA_INICIO,
  PX_POR_HORA,
  mesasTimelineMock,
  type TimelineReservation,
} from "../../data/timelineMock";
import ReservationBlock from "./ReservationBlock";

interface Props {
  reservas: TimelineReservation[];
  selectedReservationId?: string | null;
  onSelectReservation?: (id: string) => void;
}

/** "HH:MM" -> número decimal de horas (ej: "13:30" -> 13.5) */
function horaADecimal(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
}

/** etiqueta bonita para una hora decimal (13.5 -> "13:30") */
function etiquetaHora(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** genera marcas de hora cada 30' dentro de un rango */
function marcasDeHora(inicio: number, fin: number): number[] {
  const out: number[] = [];
  for (let t = inicio; t <= fin + 1e-9; t += 0.5) out.push(t);
  return out;
}

const MARCAS = marcasDeHora(HORA_INICIO, HORA_FIN);
const LANE_WIDTH = (HORA_FIN - HORA_INICIO) * PX_POR_HORA;
const COL_MESA = 84; // ancho fijo de la columna de mesas
const HEADER_H = 40; // alto de la cabecera del eje de horas
const SNAP = 0.25; // snapping del scrubber (15 min)

/** hora "ahora" acotada al rango del timeline, o un default razonable */
function horaInicial(): number {
  const ahora = new Date();
  const d = ahora.getHours() + ahora.getMinutes() / 60;
  if (d >= HORA_INICIO && d <= HORA_FIN) return Math.round(d / SNAP) * SNAP;
  return 13.5;
}

export default function TimelineGrid({
  reservas,
  selectedReservationId,
  onSelectReservation,
}: Props) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [tiempo, setTiempo] = useState<number>(horaInicial);
  const [dragging, setDragging] = useState(false);

  // Reservas por mesa (unificadas, sin importar el turno).
  // Se excluyen las canceladas: no se muestran en el timeline.
  const porMesa = useMemo(() => {
    const map: Record<string, TimelineReservation[]> = {};
    for (const r of reservas) {
      if (r.estado === "Cancelada") continue;
      // Sólo reservas con mesa asignada: las demás no se muestran acá.
      if (r.mesaId) (map[r.mesaId] ??= []).push(r);
    }
    return map;
  }, [reservas]);

  /** Convierte la posición X del puntero (dentro de innerTimeline) a hora decimal */
  function xAHora(clientX: number): number {
    const el = innerRef.current;
    if (!el) return tiempo;
    const rect = el.getBoundingClientRect();
    const xEnLane = clientX - rect.left - COL_MESA;
    let h = HORA_INICIO + xEnLane / PX_POR_HORA;
    // snapping a 15 min
    h = Math.round(h / SNAP) * SNAP;
    return Math.max(HORA_INICIO, Math.min(HORA_FIN, h));
  }

  function onPointerDown(e: React.PointerEvent) {
    // Ignorar clicks sobre el botón de una reserva (ya tienen su handler)
    if ((e.target as HTMLElement).closest("button[data-reserva]")) return;
    setDragging(true);
    setTiempo(xAHora(e.clientX));
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setTiempo(xAHora(e.clientX));
  }
  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  const scrubberLeft = COL_MESA + (tiempo - HORA_INICIO) * PX_POR_HORA;

  return (
    <div className="flex flex-col h-full bg-cream-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-2xl overflow-hidden border border-cream-300 dark:border-stone-700 shadow-sm">
      {/* Tira superior */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cream-300 dark:border-stone-700 bg-gradient-to-b from-cream-100 to-cream-50 dark:from-stone-800 dark:to-stone-900">
        <span className="text-sm font-semibold text-forest-800 dark:text-forest-200">
          Cronograma del día
        </span>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {reservas.length} reservas · arrastrá la línea para ver la hora
        </span>
      </div>

      {/* Grilla scrolleable */}
      <div className="flex-1 overflow-auto">
        <div
          ref={innerRef}
          className="relative select-none flex flex-col min-h-full"
          style={{ width: `${COL_MESA + LANE_WIDTH + PX_POR_HORA}px` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* --- Cabecera: esquina + eje de horas --- */}
          <div
            className="sticky top-0 z-40 flex bg-forest-800 text-cream-50 shadow-md"
            style={{ height: `${HEADER_H}px` }}
          >
            {/* Esquina "Mesa" — fondo sólido + z propio para que las horas no
                la tapen al desplazar el scroll horizontal. */}
            <div
              className="sticky left-0 z-10 shrink-0 bg-forest-800 border-r border-cream-300/40 px-3 flex items-center"
              style={{ width: `${COL_MESA}px` }}
            >
              <span className="text-[10px] uppercase tracking-wider text-cream-200">
                Mesa
              </span>
            </div>
            <div className="relative" style={{ width: `${LANE_WIDTH + PX_POR_HORA}px` }}>
              {MARCAS.map((t, i) => {
                const cadaHora = Number.isInteger(t);
                // Última columna: ancho proporcional al espacio restante
                const esUltima = i === MARCAS.length - 1;
                const anchoCol = esUltima
                  ? LANE_WIDTH + PX_POR_HORA - (t - HORA_INICIO) * PX_POR_HORA
                  : PX_POR_HORA;
                return (
                  <div
                    key={t}
                    className={`absolute top-0 bottom-0 flex items-center px-1.5 ${
                      cadaHora ? "text-cream-50" : "text-cream-300/70"
                    }`}
                    style={{
                      left: `${(t - HORA_INICIO) * PX_POR_HORA}px`,
                      width: `${anchoCol}px`,
                    }}
                  >
                    <span
                      className={`text-[10px] ${
                        cadaHora ? "font-semibold" : ""
                      }`}
                    >
                      {cadaHora ? etiquetaHora(t) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Filas por mesa (cada una ocupa 1/N del alto) --- */}
          {mesasTimelineMock.map((mesa, idx) => (
            <FilaMesa
              key={mesa.id}
              mesa={mesa}
              index={idx}
              reservas={porMesa[mesa.id] ?? []}
              selectedReservationId={selectedReservationId}
              onSelectReservation={onSelectReservation}
            />
          ))}

          {/* --- Zona "Cerrado" entre turnos --- */}
          <div
            className="absolute pointer-events-none bg-stone-200/40 border-x border-dashed border-stone-300"
            style={{
              left: `${COL_MESA + (GAP_INICIO - HORA_INICIO) * PX_POR_HORA}px`,
              width: `${(GAP_FIN - GAP_INICIO) * PX_POR_HORA}px`,
              top: `${HEADER_H}px`,
              bottom: 0,
            }}
          >
            <span className="sticky top-1/2 inline-block -translate-y-1/2 mx-auto w-full text-center text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
              Cerrado
            </span>
          </div>

          {/* --- Scrubber (línea de tiempo arrastrable) --- */}
          <div
            className={`absolute z-40 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{
              left: `${scrubberLeft}px`,
              top: 0,
              bottom: 0,
              width: "2px",
            }}
          >
            {/* línea */}
            <div className="absolute inset-0 bg-rose-500 shadow-[0_0_0_1px_rgba(255,255,255,0.6)]" />
            {/* mango en la cabecera */}
            <div
              className="absolute -left-[10px] flex items-center justify-center"
              style={{ top: "2px" }}
            >
              <div className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow border border-rose-700 whitespace-nowrap">
                {etiquetaHora(tiempo)}
              </div>
            </div>
            {/* hit area más ancha para agarrar fácil */}
            <div className="absolute -left-[8px] top-0 bottom-0 w-[18px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Una fila: etiqueta de mesa (sticky izq.) + calle horizontal con reservas.
 *  Altura fija y compacta, igual para cualquier cantidad de mesas. */
function FilaMesa({
  mesa,
  index,
  reservas,
  selectedReservationId,
  onSelectReservation,
}: {
  mesa: (typeof mesasTimelineMock)[number];
  index: number;
  reservas: TimelineReservation[];
  selectedReservationId?: string | null;
  onSelectReservation?: (id: string) => void;
}) {
  return (
    <div
      className={`flex ${
        index % 2 === 0
          ? "bg-cream-50 dark:bg-stone-900"
          : "bg-cream-100/50 dark:bg-stone-800/50"
      } border-b border-cream-200 dark:border-stone-700/60`}
    >
      {/* Etiqueta de mesa — fondo sólido opaco + z alto para que al desplazar
          el scroll horizontal tape a las reservas que pasan por debajo. */}
      <div
        className="sticky left-0 z-30 shrink-0 border-r-2 border-cream-400 dark:border-stone-600 px-2 flex items-center gap-1.5 bg-cream-100 dark:bg-stone-900 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]"
        style={{ width: `${COL_MESA}px` }}
      >
        <span className="w-7 h-7 rounded-md bg-white dark:bg-stone-700 border-2 border-forest-600 dark:border-forest-400 text-forest-700 dark:text-forest-200 text-xs font-bold flex items-center justify-center shadow-sm shrink-0">
          {mesa.numero}
        </span>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[11px] font-bold text-stone-800 dark:text-stone-100">
            {mesa.capacidad} pers
          </span>
          <span className="text-[10px] font-medium text-forest-700/80 dark:text-forest-300/80 truncate">
            {mesa.zona}
          </span>
        </div>
      </div>

      {/* Calle de reservas: altura fija compacta (igual para N mesas). */}
      <div className="relative h-[52px]" style={{ width: `${LANE_WIDTH + PX_POR_HORA}px` }}>
        {/* líneas verticales de hora */}
        {MARCAS.map((t) => (
          <div
            key={t}
            className={`absolute top-0 bottom-0 ${
              Number.isInteger(t)
                ? "border-l border-cream-300 dark:border-stone-700"
                : "border-l border-dashed border-cream-200 dark:border-stone-700/60"
            }`}
            style={{ left: `${(t - HORA_INICIO) * PX_POR_HORA}px` }}
          />
        ))}

        {/* bloques de reserva */}
        {reservas.map((r) => (
          <ReservationBlock
            key={r.id}
            reserva={r}
            leftPx={(horaADecimal(r.hora) - HORA_INICIO) * PX_POR_HORA}
            widthPx={(r.duracionMin / 60) * PX_POR_HORA - 3}
            selected={selectedReservationId === r.id}
            onSelect={onSelectReservation}
          />
        ))}
      </div>
    </div>
  );
}
