// filepath: src/components/timeline/TimelineHeader.tsx
// Header de la vista timeline: navegación de fecha + leyenda de estados.
// Paleta RestaurantGo (forest + cream).

import {
  IcoCalendar,
  IcoChevronLeft,
  IcoChevronRight,
  IcoUser,
} from "../reservations/Icons";

interface Props {
  fecha: Date;
  esHoy: boolean;
  onPrev: () => void;
  onNext: () => void;
  onHoy: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

function formatFechaLarga(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TimelineHeader({
  fecha,
  esHoy,
  onPrev,
  onNext,
  onHoy,
  dark,
  onToggleDark,
}: Props) {
  return (
    <header className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-forest-700 via-forest-800 to-forest-900 text-cream-50 border-b-2 border-cream-300 shadow-sm">
      {/* Marca + título */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-cream-100 text-forest-700 flex items-center justify-center shadow-inner">
          <IcoUser size={18} />
        </div>
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="text-xs uppercase tracking-wider text-cream-200">
Agenda del día
          </span>
          <span className="text-sm font-semibold text-cream-50">
            RestaurantGo
          </span>
        </div>
      </div>

      <div className="hidden md:block h-8 w-px bg-forest-600 mx-1" />

      {/* Navegación de fecha */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="w-8 h-8 rounded-md hover:bg-forest-900 flex items-center justify-center text-cream-200 hover:text-cream-50 transition"
          aria-label="Día anterior"
        >
          <IcoChevronLeft size={16} />
        </button>

        <button
          onClick={onHoy}
          className="px-3 h-8 rounded-md bg-forest-900/60 flex items-center gap-2 text-sm border border-forest-600 hover:bg-forest-900 transition capitalize"
          title="Ir a hoy"
        >
          <IcoCalendar size={14} className="text-cream-300" />
          <span className="font-medium text-cream-50">
            {formatFechaLarga(fecha)}
          </span>
          {esHoy && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              title="Hoy"
            />
          )}
        </button>

        <button
          onClick={onNext}
          className="w-8 h-8 rounded-md hover:bg-forest-900 flex items-center justify-center text-cream-200 hover:text-cream-50 transition"
          aria-label="Día siguiente"
        >
          <IcoChevronRight size={16} />
        </button>
      </div>

      <div className="flex-1" />

      {/* Toggle modo oscuro */}
      <button
        onClick={onToggleDark}
        title={dark ? "Modo claro" : "Modo oscuro"}
        aria-label="Cambiar modo claro/oscuro"
        className="w-8 h-8 rounded-md hover:bg-forest-900 flex items-center justify-center text-cream-100 transition"
      >
        {dark ? (
          // sol
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
          </svg>
        ) : (
          // luna
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </button>

      {/* Leyenda de estados */}
      <div className="hidden lg:flex items-center gap-3 text-[11px] text-cream-100">
        <Legend color="bg-forest-500" label="Confirmada" />
        <Legend color="bg-amber-500" label="Pendiente" />
        <Legend color="bg-emerald-600" label="Sentada" />
      </div>
    </header>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}
