// filepath: src/components/reservations/HeaderBar.tsx
// Header del panel demo: usa la paleta RestaurantGo (forest + cream).
// La campanita de notificaciones vive fuera de este componente
// (en NotificationsBell) para poder abrir un dropdown sin acoplar
// lógica compleja al header.

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IcoCalendar,
  IcoChevronLeft,
  IcoChevronRight,
  IcoClock,
  IcoReceipt,
  IcoSearch,
  IcoSettings,
  IcoUser,
} from "./Icons";

interface Props {
  reservationCount?: number;
  /** Slot opcional para inyectar elementos a la derecha (ej: campanita) */
  rightSlot?: React.ReactNode;
}

function formatFecha(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function HeaderBar({
  reservationCount = 0,
  rightSlot,
}: Props) {
  const [fecha, setFecha] = useState(new Date());

  function shift(days: number) {
    const next = new Date(fecha);
    next.setDate(next.getDate() + days);
    setFecha(next);
  }

  return (
    <header className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-forest-700 via-forest-800 to-forest-900 text-cream-50 border-b-2 border-cream-300 shadow-sm">
      {/* Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-cream-100 text-forest-700 flex items-center justify-center shadow-inner">
            <IcoUser size={18} />
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-forest-900 text-[10px] font-bold flex items-center justify-center shadow">
            {reservationCount}
          </span>
        </div>
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="text-xs uppercase tracking-wider text-cream-200">
            Demo · Vista de mesa
          </span>
          <span className="text-sm font-semibold text-cream-50">
            RestaurantGo
          </span>
        </div>
      </div>

      {/* Fecha */}
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={() => shift(-1)}
          className="w-8 h-8 rounded-md hover:bg-forest-900 flex items-center justify-center text-cream-200 hover:text-cream-50 transition"
          aria-label="Día anterior"
        >
          <IcoChevronLeft size={16} />
        </button>
        <div className="px-3 h-8 rounded-md bg-forest-900/60 flex items-center gap-2 text-sm border border-forest-600">
          <IcoCalendar size={14} className="text-cream-300" />
          <span className="font-medium text-cream-50">{formatFecha(fecha)}</span>
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            title="En vivo"
          />
        </div>
        <button
          onClick={() => shift(1)}
          className="w-8 h-8 rounded-md hover:bg-forest-900 flex items-center justify-center text-cream-200 hover:text-cream-50 transition"
          aria-label="Día siguiente"
        >
          <IcoChevronRight size={16} />
        </button>
      </div>

      {/* Navegación entre vistas */}
      <nav className="flex items-center gap-1">
        <Link
          to="/dueno"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold text-cream-100 hover:bg-forest-900 hover:text-cream-50 transition"
          title="Mi restaurante"
        >
          Mi restaurante
        </Link>
        <Link
          to="/demo/timeline"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold text-cream-100 hover:bg-forest-900 hover:text-cream-50 transition"
          title="Cronograma del día"
        >
          <IcoClock size={14} />
          Timeline
        </Link>
      </nav>

      <div className="flex-1" />

      {/* Slot para acciones derechas (campanita, etc.) */}
      <div className="flex items-center gap-1">
        {rightSlot}
        <HeaderIcon title="Buscar">
          <IcoSearch size={16} />
        </HeaderIcon>
        <HeaderIcon title="Cuentas">
          <IcoReceipt size={16} />
        </HeaderIcon>
        <HeaderIcon title="Ajustes">
          <IcoSettings size={16} />
        </HeaderIcon>
      </div>
    </header>
  );
}

function HeaderIcon({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      title={title}
      className="relative w-9 h-9 rounded-md hover:bg-forest-900 flex items-center justify-center text-cream-100 transition"
    >
      {children}
    </button>
  );
}