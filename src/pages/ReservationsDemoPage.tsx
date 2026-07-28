// filepath: src/pages/ReservationsDemoPage.tsx
// Vista demo: panel estilo tablet con reservaciones a la izquierda y
// 3 mesas en un floor plan a la derecha. Datos 100% mockeados.
//
// Estado de reservas vive en esta página y se comparte entre:
//   • ReservationsSidebar (lista + filtro)
//   • NotificationsBell   (dropdown desde la campanita del header)
//   • FloorCanvas         (resaltar mesa de la reserva seleccionada)

import { useMemo, useState } from "react";
import HeaderBar from "../components/reservations/HeaderBar";
import NotificationsBell from "../components/reservations/NotificationsBell";
import ReservationsSidebar from "../components/reservations/ReservationsSidebar";
import FloorCanvas from "../components/reservations/FloorCanvas";
import { reservationsMock } from "../data/reservationsMock";

export default function ReservationsDemoPage() {
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);

  // Estado compartido de reservas (en real: vendría del backend)
  const [entries, setEntries] = useState(reservationsMock);

  const totalGuests = useMemo(
    () => entries.reduce((acc, r) => acc + r.partySize, 0),
    [entries],
  );

  // Las "recién llegadas" son las que no tienen mesa asignada
  const unassigned = useMemo(
    () =>
      entries
        .filter((r) => !r.mesaId)
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    [entries],
  );

  function assignReservation(id: string) {
    setEntries((curr) =>
      curr.map((r) =>
        r.id === id && !r.mesaId ? { ...r, mesaId: "auto" } : r,
      ),
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-cream-100 via-cream-50 to-cream-200">
      <HeaderBar
        reservationCount={totalGuests}
        rightSlot={
          <NotificationsBell
            count={unassigned.length}
            reservations={unassigned}
            onAssign={assignReservation}
            onSelectReservation={setSelectedReservationId}
          />
        }
      />

      <main className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0">
        <section className="col-span-12 md:col-span-4 lg:col-span-3 min-h-0">
          <ReservationsSidebar
            selectedMesaId={selectedMesaId}
            selectedReservationId={selectedReservationId}
            onSelectReservation={setSelectedReservationId}
            entries={entries}
            onAssign={assignReservation}
          />
        </section>

        <section className="col-span-12 md:col-span-8 lg:col-span-9 min-h-0">
          <FloorCanvas
            selectedMesaId={selectedMesaId}
            onSelectMesa={setSelectedMesaId}
          />
        </section>
      </main>
    </div>
  );
}