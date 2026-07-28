// filepath: src/components/reservations/FloorCanvas.tsx
// Canvas del piso (3 mesas) con paleta RestaurantGo: fondo crema cálido
// y grid en tono crema-300 para mantener calidez visual.

import { useMemo, useState } from "react";
import { mesasMock, reservationsMock } from "../../data/reservationsMock";
import TableNode from "./TableNode";
import { IcoLayers } from "./Icons";

interface Props {
  selectedMesaId?: string | null;
  onSelectMesa?: (id: string | null) => void;
}

export default function FloorCanvas({ selectedMesaId, onSelectMesa }: Props) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);

  const selectedId = selectedMesaId ?? internalSelected;

  function handleSelect(id: string) {
    const next = selectedId === id ? null : id;
    setInternalSelected(next);
    onSelectMesa?.(next);
  }

  const reservationsByMesa = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of reservationsMock) {
      if (r.mesaId) map[r.mesaId] = (map[r.mesaId] ?? 0) + 1;
    }
    return map;
  }, []);

  const maxX = Math.max(...mesasMock.map((m) => m.x + m.ancho));
  const maxY = Math.max(...mesasMock.map((m) => m.y + m.alto));
  const width = (maxX + 3) * 32;
  const height = (maxY + 3) * 32;

  const selected = mesasMock.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="relative flex flex-col h-full bg-cream-50 text-stone-800 rounded-2xl overflow-hidden border border-cream-300 shadow-sm">
      {/* Tira superior */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cream-300 bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="flex items-center gap-2 text-sm">
          <IcoLayers size={16} className="text-forest-700" />
          <span className="font-semibold text-forest-800">Planta Principal</span>
          <span className="text-stone-400">·</span>
          <span className="text-xs text-stone-500">
            {mesasMock.length} mesas
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-600">
          <Legend color="bg-cream-200 border-2 border-forest-400" label="Libre" />
          <Legend color="bg-amber-300 border border-amber-500" label="Reservada" />
          <Legend color="bg-emerald-500 border border-emerald-700" label="Cuenta" />
          <Legend color="bg-stone-300 border border-stone-400" label="Bloqueada" />
        </div>
      </div>

      {/* Canvas scrolleable */}
      <div className="relative flex-1 overflow-auto bg-cream-100">
        <div
          className="relative mx-auto my-4"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* grid decorativo */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={width}
            height={height}
          >
            <defs>
              <pattern
                id="grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="#e7d29b"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#grid)" />
          </svg>

          {mesasMock.map((m) => (
            <div
              key={m.id}
              className="absolute"
              style={{
                left: `${m.x * 32}px`,
                top: `${m.y * 32}px`,
              }}
            >
              <TableNode
                table={m}
                selected={selectedId === m.id}
                reservationCount={reservationsByMesa[m.id]}
                onSelect={handleSelect}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-cream-300 bg-cream-100">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>
            {mesasMock.length} mesas · capacidad total{" "}
            <strong className="text-forest-800">
              {mesasMock.reduce((a, m) => a + m.capacidad, 0)}
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