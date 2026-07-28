// filepath: src/components/reservations/NotificationsBell.tsx
// Botón de notificaciones con dropdown. Lista las reservas recién llegadas
// (sin mesa asignada) y permite asignarlas o descartarlas.
// Click fuera del dropdown → se cierra.

import { useEffect, useRef, useState } from "react";
import { IcoBell, IcoX } from "./Icons";
import type { Reservation } from "../../data/reservationsMock";

interface Props {
  count: number;
  reservations: Reservation[];
  onAssign: (id: string) => void;
  onSelectReservation?: (id: string) => void;
}

export default function NotificationsBell({
  count,
  reservations,
  onAssign,
  onSelectReservation,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Cerrar al click fuera
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Cerrar con ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={`${count} reserva(s) sin asignar`}
        aria-label="Notificaciones"
        className="relative w-9 h-9 rounded-md hover:bg-forest-900 flex items-center justify-center text-cream-100 transition"
      >
        <IcoBell size={16} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow border border-forest-900">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-cream-50 text-stone-800 rounded-xl border border-cream-300 shadow-xl overflow-hidden">
          {/* Header del dropdown */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-cream-100 to-cream-50 border-b border-cream-300">
            <h3 className="text-sm font-semibold text-forest-800 flex items-center gap-2">
              🆕 Reservas nuevas
              {count > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {count}
                </span>
              )}
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded hover:bg-cream-200 flex items-center justify-center text-stone-500"
              title="Cerrar"
            >
              <IcoX size={14} />
            </button>
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto">
            {reservations.length === 0 ? (
              <div className="text-center text-xs text-stone-500 py-8">
                No hay reservas sin asignar 🎉
              </div>
            ) : (
              reservations.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 px-3 py-2 border-b border-cream-200 last:border-b-0 hover:bg-cream-100 transition"
                >
                  <div className="flex flex-col items-center w-12 text-center shrink-0">
                    <span className="text-xs font-bold text-forest-700">
                      {r.hora}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-forest-800">
                        {r.partySize}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {r.nombre}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Tocá "Asignar" para mandarla a una mesa
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectReservation?.(r.id);
                      onAssign(r.id);
                      setOpen(false);
                    }}
                    className="text-[11px] px-2 py-1 rounded bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold shadow-sm shrink-0"
                    title="Asignar a mesa libre"
                  >
                    Asignar
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {reservations.length > 0 && (
            <div className="px-3 py-2 bg-cream-100 border-t border-cream-300 text-[11px] text-stone-500 text-center">
              Las reservas también aparecen en el panel izquierdo
            </div>
          )}
        </div>
      )}
    </div>
  );
}