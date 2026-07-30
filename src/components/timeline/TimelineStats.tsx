// filepath: src/components/timeline/TimelineStats.tsx
// Barra inferior con métricas del día. Paleta RestaurantGo (cream + forest).

import { useMemo } from "react";
import type { TimelineReservation } from "../../data/timelineMock";
import { mesasTimelineMock } from "../../data/timelineMock";
import { IcoUser, IcoUsers } from "../reservations/Icons";

interface Props {
  reservas: TimelineReservation[];
}

export default function TimelineStats({ reservas }: Props) {
  const stats = useMemo(() => {
    const activas = reservas.filter((r) => r.estado !== "Cancelada");
    const comensales = activas.reduce((acc, r) => acc + r.partySize, 0);
    const almuerzo = activas.filter((r) => r.turno === "almuerzo");
    const cena = activas.filter((r) => r.turno === "cena");
    const capacidadTotal = mesasTimelineMock.reduce(
      (a, m) => a + m.capacidad,
      0,
    );
    return {
      total: activas.length,
      comensales,
      almuerzo: almuerzo.length,
      cena: cena.length,
      capacidadTotal,
    };
  }, [reservas]);

  return (
    <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 bg-gradient-to-r from-cream-100 to-cream-50 dark:from-stone-800 dark:to-stone-900 border-t-2 border-cream-300 dark:border-stone-700 text-stone-700 dark:text-stone-200">
      <Stat
        icon={<IcoUsers size={15} className="text-forest-600" />}
        label="Reservas"
        value={stats.total}
      />
      <Stat
        icon={<IcoUser size={15} className="text-forest-600" />}
        label="Comensales"
        value={stats.comensales}
      />
      <Divider />
      <span className="text-xs">
        <span className="font-bold text-forest-700 dark:text-forest-300">Almuerzo</span>{" "}
        <span className="text-stone-500 dark:text-stone-400">{stats.almuerzo}</span>
      </span>
      <span className="text-xs">
        <span className="font-bold text-forest-700 dark:text-forest-300">Cena</span>{" "}
        <span className="text-stone-500 dark:text-stone-400">{stats.cena}</span>
      </span>
      <Divider />
      <div className="flex-1" />
      <span className="text-xs text-stone-500 dark:text-stone-400">
        {mesasTimelineMock.length} mesas · capacidad{" "}
        <strong className="text-forest-800 dark:text-forest-300">{stats.capacidadTotal}</strong> pers
      </span>
    </footer>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      {icon}
      <strong className="text-sm font-bold text-forest-800 dark:text-forest-300">{value}</strong>
      <span className="text-stone-500 dark:text-stone-400">{label}</span>
    </span>
  );
}

function Divider() {
  return <span className="hidden sm:inline-block h-4 w-px bg-cream-300" />;
}
