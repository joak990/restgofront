// filepath: src/pages/TimelineDemoPage.tsx
// Vista demo: timeline de reservas del día (filas = mesas, columnas = horas).
// Datos 100% mockeados. Independiente de /demo/reservas.
//
// Layout:
//   • TimelineHeader   (navegación de fecha + leyenda)
//   • TimelineGrid     (cronograma almuerzo + cena, una fila por mesa)
//   • TimelineStats    (resumen del día)
//
// Incluye un toggle de modo oscuro: aplica la clase `dark` al <html>.

import { useEffect, useState } from "react";
import TimelineHeader from "../components/timeline/TimelineHeader";
import TimelineGrid from "../components/timeline/TimelineGrid";
import TimelineStats from "../components/timeline/TimelineStats";
import { reservasTimelineMock } from "../data/timelineMock";

function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function TimelineDemoPage() {
  const [fecha, setFecha] = useState(() => new Date());
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [dark, setDark] = useState(false);

  // Aplica (o quita) la clase `dark` del <html> para activar el modo oscuro.
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  const esHoy = mismoDia(fecha, new Date());

  function shift(days: number) {
    const next = new Date(fecha);
    next.setDate(next.getDate() + days);
    setFecha(next);
  }

  return (
    <div className="fixed inset-0 top-[120px] flex flex-col bg-gradient-to-b from-cream-100 via-cream-50 to-cream-200 dark:from-stone-900 dark:via-stone-900 dark:to-black">
      <TimelineHeader
        fecha={fecha}
        esHoy={esHoy}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        onHoy={() => setFecha(new Date())}
        dark={dark}
        onToggleDark={() => setDark((v) => !v)}
      />

      <main className="flex-1 grid p-3 min-h-0 overflow-x-auto overflow-y-auto">
        <TimelineGrid
          reservas={reservasTimelineMock}
          selectedReservationId={selectedReservationId}
          onSelectReservation={setSelectedReservationId}
        />
      </main>

      <TimelineStats reservas={reservasTimelineMock} />
    </div>
  );
}
