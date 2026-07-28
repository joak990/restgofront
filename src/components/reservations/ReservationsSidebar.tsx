// filepath: src/components/reservations/ReservationsSidebar.tsx
// Sidebar de reservaciones con paleta RestaurantGo (cream + forest).
// Dos secciones colapsables (solapas):
//   • 🆕 Recién llegadas (sin mesa)
//   • Asignadas (con mesa)
// Cada fila es minimal: hora · party · nombre · mesa asignada.

import { useMemo, useState } from "react";
import { mesasMock, type Reservation } from "../../data/reservationsMock";
import { IcoChevronDown, IcoSearch, IcoUsers, IcoUser } from "./Icons";

interface Props {
  selectedMesaId?: string | null;
  selectedReservationId?: string | null;
  onSelectReservation?: (id: string) => void;
  entries: Reservation[];
  onAssign: (id: string) => void;
}

const QUICK_FILTERS: { label: string; value: number }[] = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "—", value: 0 },
];

export default function ReservationsSidebar({
  selectedMesaId,
  selectedReservationId,
  onSelectReservation,
  entries,
  onAssign,
}: Props) {
  const [partyFilter, setPartyFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const totalReservas = entries.length;
  const totalGuests = entries.reduce((acc, r) => acc + r.partySize, 0);

  const { unassigned, filtered } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = entries.filter((r) => {
      if (partyFilter && r.partySize !== partyFilter) return false;
      if (q.length > 0 && !r.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
    const sinMesa = list.filter((r) => !r.mesaId);
    const conMesa = list.filter((r) => !!r.mesaId);
    return {
      unassigned: sinMesa.sort((a, b) => a.hora.localeCompare(b.hora)),
      filtered: conMesa.sort((a, b) => a.hora.localeCompare(b.hora)),
    };
  }, [entries, partyFilter, search]);

  function togglePartyFilter(n: number) {
    setPartyFilter((curr) => (curr === n ? null : n));
  }

  // Estado de colapso de cada solapa
  const [openRecien, setOpenRecien] = useState(true);
  const [openAsignadas, setOpenAsignadas] = useState(true);

  return (
    <aside className="flex flex-col h-full bg-cream-50 text-stone-800 rounded-2xl border border-cream-300 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cream-300 bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-forest-800">
            Reservaciones
          </h2>
          <button
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-forest-700 text-cream-50 font-semibold hover:bg-forest-800 transition shadow-sm"
            title="Nueva reservación"
          >
            + Nueva
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
          <span>Ordenadas por hora</span>
        </div>

        {/* Métricas */}
        <div className="flex items-center gap-4 text-xs mb-3">
          <Metric
            icon={<IcoUsers size={14} className="text-forest-600" />}
            label="Reservas"
            value={totalReservas}
          />
          <Metric
            icon={<IcoUser size={14} className="text-forest-600" />}
            label="Comensales"
            value={totalGuests}
          />
        </div>

        {/* Filtros rápidos por tamaño */}
        <div className="flex items-center gap-1.5">
          {QUICK_FILTERS.map((q) => {
            const active = partyFilter === q.value;
            return (
              <button
                key={q.value}
                onClick={() => togglePartyFilter(q.value)}
                className={`min-w-[40px] h-9 px-2 rounded-md text-xs font-semibold transition border ${
                  active
                    ? "bg-forest-700 text-cream-50 border-forest-800 shadow"
                    : "bg-white text-stone-700 border-cream-300 hover:bg-cream-100"
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="mt-3 relative">
          <IcoSearch
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-white border border-cream-300 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Listado */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Solapa: Recién llegadas (colapsable) */}
        {unassigned.length > 0 && (
          <CollapsibleSection
            title="Recién llegadas"
            count={unassigned.length}
            open={openRecien}
            onToggle={() => setOpenRecien((v) => !v)}
            tone="amber"
            pulse
          >
            <div className="space-y-1">
              {unassigned.map((r) => (
                <ReservationRow
                  key={r.id}
                  r={r}
                  isOnSelectedTable={
                    !!selectedMesaId && r.mesaId === selectedMesaId
                  }
                  isSelected={selectedReservationId === r.id}
                  onClick={() => onSelectReservation?.(r.id)}
                  onAssign={() => onAssign(r.id)}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Solapa: Asignadas (colapsable) */}
        <CollapsibleSection
          title="Asignadas"
          count={filtered.length}
          open={openAsignadas}
          onToggle={() => setOpenAsignadas((v) => !v)}
          tone="forest"
        >
          {filtered.length === 0 ? (
            unassigned.length === 0 ? (
              <div className="text-center text-sm text-stone-500 py-10">
                Sin reservaciones para mostrar
              </div>
            ) : (
              <div className="text-center text-xs text-stone-500 py-6 italic">
                No hay reservas asignadas todavía
              </div>
            )
          ) : (
            <div className="space-y-1">
              {filtered.map((r) => (
                <ReservationRow
                  key={r.id}
                  r={r}
                  isOnSelectedTable={
                    !!selectedMesaId && r.mesaId === selectedMesaId
                  }
                  isSelected={selectedReservationId === r.id}
                  onClick={() => onSelectReservation?.(r.id)}
                  onAssign={() => onAssign(r.id)}
                />
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </aside>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{icon}</span>
      <span className="font-semibold text-stone-800">{value}</span>
      <span className="text-stone-500">{label}</span>
    </div>
  );
}

/** Solapa colapsable con cabecera tipo menú */
function CollapsibleSection({
  title,
  count,
  open,
  onToggle,
  tone,
  pulse,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  tone: "amber" | "forest";
  pulse?: boolean;
  children: React.ReactNode;
}) {
  const toneClasses =
    tone === "amber"
      ? {
          wrap: "bg-amber-50/70 border-y-2 border-amber-300",
          dot: "bg-amber-500",
          badge: "bg-amber-500 text-white",
          text: "text-amber-800",
        }
      : {
          wrap: "bg-cream-100/50 border-y border-cream-300",
          dot: "bg-forest-600",
          badge: "bg-forest-700 text-cream-50",
          text: "text-forest-700",
        };

  return (
    <section className={`${toneClasses.wrap} mb-1`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-black/5 transition"
        aria-expanded={open}
      >
        <h3
          className={`text-[11px] font-extrabold uppercase tracking-wider ${toneClasses.text} flex items-center gap-1.5`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${toneClasses.dot} ${
              pulse ? "animate-pulse" : ""
            }`}
          />
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-bold ${toneClasses.badge}`}
          >
            {count}
          </span>
          <IcoChevronDown
            size={14}
            className={`${toneClasses.text} transition-transform ${
              open ? "" : "-rotate-90"
            }`}
          />
        </div>
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </section>
  );
}

function ReservationRow({
  r,
  isOnSelectedTable,
  isSelected,
  onClick,
  onAssign,
}: {
  r: Reservation;
  isOnSelectedTable: boolean;
  isSelected: boolean;
  onClick: () => void;
  onAssign: () => void;
}) {
  const placed = !!r.mesaId;
  const mesaNumero = mesasMock.find((m) => m.id === r.mesaId)?.numero;

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition border ${
        isSelected
          ? "bg-amber-100 border-amber-400 shadow-sm"
          : isOnSelectedTable
            ? "bg-forest-100 border-forest-400"
            : "border-transparent bg-white hover:bg-cream-100 hover:border-cream-300"
      }`}
    >
      {/* Hora */}
      <div className="flex flex-col items-center w-14 text-center">
        <span className="text-[11px] font-semibold text-forest-700">
          {r.hora}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-forest-800">
            {r.partySize}
          </span>
          <span className="text-sm font-semibold text-stone-800 truncate">
            {r.nombre}
          </span>
        </div>
        <div className="text-[11px] text-stone-500 truncate">
          {placed ? (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest-500 mr-1" />
              Mesa {mesaNumero}
            </>
          ) : (
            <span className="italic">Sin mesa asignada</span>
          )}
        </div>
      </div>

      {/* Acción on hover */}
      {!placed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssign();
          }}
          className="text-[11px] px-2 py-1 rounded bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold shadow-sm opacity-0 group-hover:opacity-100 transition"
          title="Asignar mesa"
        >
          Asignar
        </button>
      )}
    </div>
  );
}