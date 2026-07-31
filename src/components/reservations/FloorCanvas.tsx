// filepath: src/components/reservations/FloorCanvas.tsx
// Canvas del piso: dibuja las mesas del restaurante activo (recibidas por props)
// en un layout responsivo (flex-wrap) que entra SIEMPRE en el viewport sin
// scroll horizontal, sin importar la cantidad de mesas.

import { useEffect, useMemo, useRef, useState } from "react";
import type { FloorTable, Reservation } from "../../data/reservationsMock";
import TableNode from "./TableNode";
import { IcoLayers } from "./Icons";

interface Props {
  mesas: FloorTable[];
  reservas: Reservation[];
  selectedMesaId?: string | null;
  onSelectMesa?: (id: string | null) => void;
}

export default function FloorCanvas({
  mesas,
  reservas,
  selectedMesaId,
  onSelectMesa,
}: Props) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);

  const selectedId = selectedMesaId ?? internalSelected;

  function handleSelect(id: string) {
    const next = selectedId === id ? null : id;
    setInternalSelected(next);
    onSelectMesa?.(next);
  }

  const reservationsByMesa = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of reservas) {
      if (r.mesaId) map[r.mesaId] = (map[r.mesaId] ?? 0) + 1;
    }
    return map;
  }, [reservas]);

  // ----- Calcular tamaño responsivo de cada mesa para que entren todas -----
  // Cada mesa mide aprox. su capacidad + 2 unidades de grid;
  // reservamos 1 unidad de gap. El grid completa con flex-wrap.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function measure() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Tamaño base de cada mesa en px (calculado para que entren todas)
  const mesaTamanio = useMemo(() => {
    if (mesas.length === 0) return { size: 72, gap: 14 };
    const total = mesas.length;
    const padding = 32;
    const gap = 14;
    const usableW = Math.max(200, containerSize.w - padding);
    const usableH = Math.max(200, containerSize.h - padding);
    // Empezamos con 6 columnas para mesas más chicas
    let cols = Math.min(total, 6);
    let size = Math.floor((usableW - gap * (cols - 1)) / cols);
    const totalHeightForSize = (s: number) => {
      const chair = Math.max(6, Math.round(s * 0.13));
      return s + chair * 2 + 2;
    };
    let rows = Math.ceil(total / cols);
    while (
      rows > 1 &&
      totalHeightForSize(size) * rows + gap * (rows - 1) > usableH &&
      size > 40
    ) {
      cols = Math.min(total, cols + 1);
      size = Math.floor((usableW - gap * (cols - 1)) / cols);
      rows = Math.ceil(total / cols);
    }
    // Mesas más chicas: entre 48 y 100px
    return { size: Math.max(48, Math.min(100, size)), gap };
  }, [mesas.length, containerSize]);

  const selected = mesas.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="relative flex flex-col h-full bg-cream-50 text-stone-800 rounded-2xl overflow-hidden border border-cream-300 shadow-sm">
      {/* Tira superior */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cream-300 bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="flex items-center gap-2 text-sm">
          <IcoLayers size={16} className="text-forest-700" />
          <span className="font-semibold text-forest-800">Planta Principal</span>
          <span className="text-stone-400">·</span>
          <span className="text-xs text-stone-500">
            {mesas.length} mesa{mesas.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-600">
          <Legend color="bg-cream-200 border-2 border-forest-400" label="Libre" />
          <Legend color="bg-amber-300 border border-amber-500" label="Reservada" />
          <Legend color="bg-emerald-500 border border-emerald-700" label="Cuenta" />
          <Legend color="bg-stone-300 border border-stone-400" label="Bloqueada" />
        </div>
      </div>

      {/* Canvas sin scroll: flex-wrap adapta las mesas al viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-cream-100 p-4"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(231, 210, 155, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(231, 210, 155, 0.45) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <div
          className="w-full h-full flex flex-wrap items-center justify-center content-center"
          style={{ gap: `${mesaTamanio.gap}px` }}
        >
          {mesas.map((m) => (
            <TableNode
              key={m.id}
              table={m}
              size={mesaTamanio.size}
              selected={selectedId === m.id}
              reservationCount={reservationsByMesa[m.id]}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-cream-300 bg-cream-100">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>
            {mesas.length} mesa{mesas.length === 1 ? "" : "s"} · capacidad total{" "}
            <strong className="text-forest-800">
              {mesas.reduce((a, m) => a + m.capacidad, 0)}
            </strong>{" "}
            pers
          </span>
        </div>

        {selected ? (
          <div className="text-xs text-stone-700 flex items-center gap-3">
            <span>
              <strong className="text-forest-800">Mesa {selected.numero}</strong>{" "}
              · {selected.capacidad} pers
            </span>
            <span className="px-2 py-0.5 rounded bg-cream-200 capitalize border border-cream-300">
              {selected.status}
            </span>
            {selected.status === "cuenta" && (
              <span className="text-stone-500">· cuenta pedida</span>
            )}
            {reservationsByMesa[selected.id] ? (
              <span className="px-2 py-0.5 rounded bg-forest-100 text-forest-800 border border-forest-300">
                {reservationsByMesa[selected.id]} reserva(s)
              </span>
            ) : null}
          </div>
        ) : (
          <div className="text-xs text-stone-500">
            Toca una mesa para ver detalles
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded ${color}`} />
      {label}
    </span>
  );
}