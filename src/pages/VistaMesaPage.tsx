// filepath: src/pages/VistaMesaPage.tsx
// Vista de mesa del dueño:
//   • Recibe :restauranteId por URL
//   • Si no tiene restaurantes → muestra CTA para crear uno
//   • Si no tiene restó seleccionado → redirige al listado
//   • Si tiene restaurante sin mesas → CTA para crear mesas
//   • Si tiene todo → muestra planta + sidebar de reservas
//
// Datos en vivo (no mock).

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import HeaderBar from "../components/reservations/HeaderBar";
import NotificationsBell from "../components/reservations/NotificationsBell";
import ReservationsSidebar from "../components/reservations/ReservationsSidebar";
import FloorCanvas from "../components/reservations/FloorCanvas";
import { useRestauranteVista } from "../hooks/useRestauranteVista";
import { duenosApi } from "../api/duenos";

export default function VistaMesaPage() {
  const { restauranteId: idFromUrl } = useParams<{ restauranteId: string }>();
  const navigate = useNavigate();
  const restauranteId = idFromUrl ?? null;
  const [fecha, setFecha] = useState(new Date());

  const {
    restaurantes,
    cargando,
    error,
    restauranteActivo,
    mesas,
    reservas,
    sinRestaurantes,
    sinMesas,
    refrescar,
  } = useRestauranteVista(restauranteId);

  // Si no hay :restauranteId en la URL pero hay restós, redirigir al primero
  useEffect(() => {
    if (!idFromUrl && !cargando && restaurantes.length > 0) {
      navigate(`/dueno/restaurantes/${restaurantes[0].id}/vista-mesa`, {
        replace: true,
      });
    }
  }, [idFromUrl, cargando, restaurantes, navigate]);

  // 🛡️ Defensa contra IDOR: si el usuario mete un :restauranteId en la URL
  // que NO está en su lista de restaurantes, redirigir al dashboard.
  // (El backend igual responde 403, pero evitamos la navegación inválida.)
  useEffect(() => {
    if (
      idFromUrl &&
      !cargando &&
      restaurantes.length > 0 &&
      !restaurantes.some((r) => r.id === idFromUrl)
    ) {
      navigate("/dueno", { replace: true });
    }
  }, [idFromUrl, cargando, restaurantes, navigate]);

  // Cuando el dueño asigna una reserva desde el sidebar
  async function asignarReserva(reservaId: string) {
    if (!restauranteId) return;
    try {
      await duenosApi.actualizarEstadoReserva(
        restauranteId,
        reservaId,
        "CONFIRMADA",
      );
      refrescar();
    } catch (e) {
      console.error("Error asignado reserva:", e);
    }
  }

  function cambiarRestaurante(nuevoId: string) {
    navigate(`/dueno/restaurantes/${nuevoId}/vista-mesa`);
  }

  // Filtrar reservas del día seleccionado
  const reservasDelDia = useMemo(
    () => reservas.filter((r) => r.hora.slice(0, 5) && r.turno),
    [reservas],
  );

  // Recién llegadas: sin mesa asignada
  const unassigned = useMemo(
    () =>
      reservasDelDia
        .filter((r) => !r.mesaId)
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    [reservasDelDia],
  );

  const totalGuests = useMemo(
    () => reservasDelDia.reduce((acc, r) => acc + r.partySize, 0),
    [reservasDelDia],
  );

  // ---------- RENDER ----------

  // Cargando
  if (cargando && restaurantes.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-cream-100 to-cream-200">
        <div className="text-stone-600 text-sm">Cargando tus restaurantes…</div>
      </div>
    );
  }

  // Error
  if (error && restaurantes.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-cream-100 to-cream-200">
        <div className="text-red-700 text-sm">Error: {error}</div>
      </div>
    );
  }

  // No hay restaurantes
  if (sinRestaurantes) {
    return <SinRestaurantes />;
  }

  // No hay restauranteId en URL → redirigir (lo maneja el useEffect)
  if (!restauranteId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-cream-100 to-cream-200">
        <div className="text-stone-600 text-sm">Cargando…</div>
      </div>
    );
  }

  // Hay restaurante seleccionado pero no tiene mesas
  if (sinMesas && restauranteActivo) {
    return (
      <SinMesas
        restauranteId={restauranteActivo.id}
        restauranteNombre={restauranteActivo.nombre}
      />
    );
  }

  // Todo OK: planta + sidebar
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-cream-100 via-cream-50 to-cream-200">
      <HeaderBar
        reservationCount={totalGuests}
        fecha={fecha}
        onChangeFecha={setFecha}
        restauranteNombre={restauranteActivo?.nombre}
        restaurantes={restaurantes.map((r) => ({ id: r.id, nombre: r.nombre }))}
        restauranteId={restauranteId}
        onCambiarRestaurante={cambiarRestaurante}
        rightSlot={
          <NotificationsBell
            count={unassigned.length}
            reservations={unassigned}
            onAssign={asignarReserva}
          />
        }
      />

      <main className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0">
        <section className="col-span-12 md:col-span-4 lg:col-span-3 min-h-0">
          <ReservationsSidebar
            mesas={mesas}
            entries={reservasDelDia}
            onAssign={asignarReserva}
          />
        </section>

        <section className="col-span-12 md:col-span-8 lg:col-span-9 min-h-0">
          <FloorCanvas mesas={mesas} reservas={reservasDelDia} />
        </section>
      </main>
    </div>
  );
}

// ---------- Sub-vistas vacías ----------

function SinRestaurantes() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-cream-100 to-cream-200 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-cream-300 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
          🍽️
        </div>
        <h2 className="text-xl font-bold text-forest-800 mb-2">
          Aún no tienes restaurantes
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          Crea tu primer restaurante para empezar a gestionar las mesas y
          reservas desde aquí.
        </p>
        <Link
          to="/dueno"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-forest-700 text-cream-50 font-semibold text-sm hover:bg-forest-800 transition shadow-sm"
        >
          + Crear restaurante
        </Link>
      </div>
    </div>
  );
}

function SinMesas({
  restauranteId,
  restauranteNombre,
}: {
  restauranteId: string;
  restauranteNombre: string;
}) {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-cream-100 to-cream-200 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-cream-300 p-8 text-center">
        
        <h2 className="text-xl font-bold text-forest-800 mb-2">
          {restauranteNombre} aún no tiene mesas
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          Crea la primera mesa para empezar a recibir reservas y administrar
          la planta de tu local.
        </p>
        <Link
          to={`/dueno/restaurantes/${restauranteId}/mesas`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-forest-700 text-cream-50 font-semibold text-sm hover:bg-forest-800 transition shadow-sm"
        >
          + Crear mesas
        </Link>
      </div>
    </div>
  );
}
