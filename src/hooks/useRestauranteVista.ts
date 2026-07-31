// filepath: src/hooks/useRestauranteVista.ts
// Hook que carga:
//   • restaurantes del dueño
//   • mesas del restaurante seleccionado
//   • reservas del día seleccionado
// y los adapta al formato de FloorTable / Reservation que usan los
// componentes del panel de "Vista de mesa".

import { useEffect, useState } from "react";
import { duenosApi, type Restaurante, type Mesa, type Reserva } from "../api/duenos";
import type { FloorTable, Reservation } from "../data/reservationsMock";

export type EstadoCarga = "idle" | "cargando" | "ok" | "error";

export interface UseRestauranteVista {
  restaurantes: Restaurante[];
  cargando: boolean;
  error: string | null;
  restauranteActivo: Restaurante | null | undefined;
  mesas: FloorTable[];
  reservas: Reservation[];
  /** true: hay restaurantes pero no se eligió ninguno todavía */
  sinRestauranteSeleccionado: boolean;
  /** true: hay restaurante elegido pero no tiene mesas */
  sinMesas: boolean;
  /** true: el dueño no tiene restaurantes */
  sinRestaurantes: boolean;
  refrescar: () => Promise<void>;
}

function horaAMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

function isToday(iso: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return iso.startsWith(today);
}

/** Extrae el número de un nombre tipo "Mesa 10", "Mesa 2", "10", etc. */
function extraerNumero(nombre: string | null): number {
  if (!nombre) return Number.MAX_SAFE_INTEGER;
  const match = nombre.match(/\d+/);
  return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
}

function adaptarMesas(mesas: Mesa[], reservas: Reserva[]): FloorTable[] {
  // Construir un mapa de reservas por mesa en la fecha actual
  const reservasPorMesa: Record<string, Reserva[]> = {};
  for (const r of reservas) {
    if (!r.mesaId) continue;
    if (!isToday(r.fechaReserva)) continue;
    if (!reservasPorMesa[r.mesaId]) reservasPorMesa[r.mesaId] = [];
    reservasPorMesa[r.mesaId].push(r);
    reservasPorMesa[r.mesaId].sort((a, b) =>
      a.horaReserva.localeCompare(b.horaReserva),
    );
  }

  // Ordenar por número extraído del nombre (natural sort: 1, 2, 3... 10)
  const mesasOrdenadas = [...mesas].sort(
    (a, b) => extraerNumero(a.nombre) - extraerNumero(b.nombre),
  );

  return mesasOrdenadas.map((m, idx) => {
    const propias = reservasPorMesa[m.id] ?? [];
    let status: FloorTable["status"] = "libre";
    let horaEstimada: string | undefined;
    if (propias.length > 0) {
      // La más cercana a "ahora" o la primera del día
      const ahora = new Date();
      const minutos = ahora.getHours() * 60 + ahora.getMinutes();
      const hacia = propias.find(
        (r) => horaAMinutos(r.horaReserva) >= minutos - 60,
      );
      const objetivo = hacia ?? propias[0];
      horaEstimada = objetivo.horaReserva.slice(0, 5);
      if (objetivo.estado === "CONFIRMADA") status = "reservada";
      else if (objetivo.estado === "COMPLETADA") status = "cuenta";
      else if (objetivo.estado === "PENDIENTE") status = "reservada";
    }
    return {
      id: m.id,
      numero: m.nombre ?? `${idx + 1}`,
      capacidad: m.capacidad,
      forma: "rect" as const,
      ancho: 6,
      alto: 5,
      x: 0,
      y: 0,
      status,
      horaEstimada,
    };
  });
}

function adaptarReservas(reservas: Reserva[]): Reservation[] {
  return reservas
    .filter((r) => isToday(r.fechaReserva))
    .map((r) => {
      const hora = r.horaReserva.slice(0, 5);
      const horaNum = horaAMinutos(hora);
      const turno: Reservation["turno"] = horaNum < 17 ? "almuerzo" : "cena";
      return {
        id: r.id,
        turno,
        hora,
        partySize: r.cantidadPersonas,
        nombre: r.cliente?.nombreCompleto ?? r.nombreCliente ?? "Sin nombre",
        mesaId: r.mesaId,
        estado: r.estado,
        nota: r.canceladaEn
          ? "Cancelada"
          : r.confirmadaEn
            ? "Confirmada"
            : undefined,
      } satisfies Reservation;
    });
}

export function useRestauranteVista(
  restauranteId: string | null,
): UseRestauranteVista {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [detalleCargado, setDetalleCargado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const lista = await duenosApi.getMisRestaurantes();
      setRestaurantes(lista);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Cargar mesas y reservas cuando cambia restauranteId
  useEffect(() => {
    if (!restauranteId) {
      setMesas([]);
      setReservas([]);
      setDetalleCargado(false);
      return;
    }
    setCargandoDetalle(true);
    setDetalleCargado(false);
    let cancelado = false;
    (async () => {
      try {
        const [m, r] = await Promise.all([
          duenosApi.getMesas(restauranteId),
          duenosApi.getReservas(restauranteId, {
            desde: new Date().toISOString().slice(0, 10),
            hasta: new Date().toISOString().slice(0, 10),
          }),
        ]);
        if (!cancelado) {
          setMesas(m);
          setReservas(r);
          setDetalleCargado(true);
        }
      } catch (e) {
        if (!cancelado) setError((e as Error).message);
      } finally {
        if (!cancelado) setCargandoDetalle(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [restauranteId]);

  const restauranteActivo =
    restauranteId === null
      ? undefined
      : restaurantes.find((r) => r.id === restauranteId) ?? null;

  const mesasAdaptadas = (function () {
    return adaptarMesas(mesas, reservas);
  })();
  const reservasAdaptadas = adaptarReservas(reservas);

  return {
    restaurantes,
    cargando: cargando || cargandoDetalle,
    error,
    restauranteActivo,
    mesas: mesasAdaptadas,
    reservas: reservasAdaptadas,
    sinRestaurantes: !cargando && restaurantes.length === 0,
    sinRestauranteSeleccionado: restauranteId === null && restaurantes.length > 0,
    sinMesas:
      !!restauranteActivo &&
      !cargando &&
      detalleCargado &&
      mesas.length === 0 &&
      reservas.length === 0,
    refrescar: cargar,
  };
}

// Reserved for future use (helper export).
export const __helpers = { horaAMinutos, isToday };
