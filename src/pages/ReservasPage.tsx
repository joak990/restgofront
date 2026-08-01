// filepath: src/pages/ReservasPage.tsx
import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import PhoneInput, { type Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  duenosApi,
  type Reserva,
  type EstadoReserva,
  type CalendarioResponse,
  type CalendarioReserva,
  type CalendarioSlot,
  type Mesa,
} from "../api/duenos";

const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const ESTADOS: { value: EstadoReserva | ""; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "CONFIRMADA", label: "Confirmadas" },
  { value: "CANCELADA", label: "Canceladas" },
  { value: "NO_ASISTIO", label: "No asistió" },
  { value: "COMPLETADA", label: "Completadas" },
];

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function EstadoBadge({ estado }: { estado: string }) {
  const clases: Record<string, string> = {
    CONFIRMADA: "pill-green",
    PENDIENTE: "pill-yellow",
    CANCELADA: "pill-gray",
    NO_ASISTIO: "pill-red",
    COMPLETADA: "pill-blue",
  };
  const etiquetas: Record<string, string> = {
    CONFIRMADA: "✓ Confirmada",
    PENDIENTE: "⏳ Pendiente",
    CANCELADA: "✕ Cancelada",
    NO_ASISTIO: "✕ No asistió",
    COMPLETADA: "✓ Completada",
  };
  return (
    <span className={clases[estado] ?? "pill-gray"}>
      {etiquetas[estado] ?? estado}
    </span>
  );
}

function slotColor(slot: CalendarioSlot): string {
  if (slot.mesasDisponibles === slot.totalMesas)
    return "bg-emerald-100 border-emerald-300 text-emerald-800";
  if (slot.mesasDisponibles === 0)
    return "bg-red-100 border-red-300 text-red-800";
  return "bg-amber-100 border-amber-300 text-amber-800";
}

export default function ReservasPage() {
  const { id: restauranteId } = useParams<{ id: string }>();

  // Vista: calendario o tabla
  const [vista, setVista] = useState<"calendario" | "tabla">("calendario");

  // Estado del calendario
  const [fechaCalendario, setFechaCalendario] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [calendario, setCalendario] = useState<CalendarioResponse | null>(null);
  const [calendarioLoading, setCalendarioLoading] = useState(false);
  const [calendarioError, setCalendarioError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarioSlot | null>(null);

  // Modal nueva reserva
  const [showNuevaReserva, setShowNuevaReserva] = useState(false);
  const [nuevaReservaHora, setNuevaReservaHora] = useState("");
  const [nuevaReservaPersonas, setNuevaReservaPersonas] = useState(2);
  const [nuevaReservaNombre, setNuevaReservaNombre] = useState("");
  const [nuevaReservaTelefono, setNuevaReservaTelefono] = useState("");
  const [nuevaReservaMesaId, setNuevaReservaMesaId] = useState("");
  const [nuevaReservaNotas, setNuevaReservaNotas] = useState("");
  const [nuevaReservaSaving, setNuevaReservaSaving] = useState(false);
  const [mesas, setMesas] = useState<Mesa[]>([]);

  // Estado de la tabla (reservas con filtros)
  const [reservas, setReservas] = useState<Reserva[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | "">("");
  const [filtroDesde, setFiltroDesde] = useState<string>("");
  const [filtroHasta, setFiltroHasta] = useState<string>("");

  // Cargar calendario
  const cargarCalendario = useCallback(async () => {
    if (!restauranteId) return;
    setCalendarioLoading(true);
    setCalendarioError(null);
    setSelectedSlot(null);
    try {
      const data = await duenosApi.getCalendario(
        restauranteId,
        fechaCalendario,
      );
      setCalendario(data);
    } catch (e) {
      setCalendarioError((e as Error).message);
    } finally {
      setCalendarioLoading(false);
    }
  }, [restauranteId, fechaCalendario]);

  useEffect(() => {
    cargarCalendario();
  }, [cargarCalendario]);

  // Cargar reservas (tabla)
  async function cargarReservas() {
    if (!restauranteId) return;
    setCargando(true);
    setError(null);
    try {
      const filtros: { desde?: string; hasta?: string; estado?: string } = {};
      if (filtroDesde) filtros.desde = filtroDesde;
      if (filtroHasta) filtros.hasta = filtroHasta;
      if (filtroEstado) filtros.estado = filtroEstado;
      const data = await duenosApi.getReservas(restauranteId, filtros);
      setReservas(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restauranteId]);

  async function cambiarEstado(
    reservaId: string,
    nuevoEstado: "CONFIRMADA" | "CANCELADA" | "NO_ASISTIO" | "COMPLETADA",
  ) {
    if (!restauranteId) return;
    const mensajes: Record<string, string> = {
      CONFIRMADA: "¿Confirmar esta reserva?",
      CANCELADA: "¿Cancelar esta reserva?",
      NO_ASISTIO: "¿Marcar como no asistió?",
      COMPLETADA: "¿Marcar como completada?",
    };
    if (!confirm(mensajes[nuevoEstado])) return;
    try {
      await duenosApi.actualizarEstadoReserva(
        restauranteId,
        reservaId,
        nuevoEstado,
      );
      await cargarCalendario();
      if (vista === "tabla") await cargarReservas();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function limpiarFiltros() {
    setFiltroEstado("");
    setFiltroDesde("");
    setFiltroHasta("");
    setTimeout(cargarReservas, 0);
  }

  function navegarFecha(offset: number) {
    const d = new Date(fechaCalendario + "T00:00:00");
    d.setDate(d.getDate() + offset);
    setFechaCalendario(d.toISOString().slice(0, 10));
  }

  async function abrirNuevaReserva(horaPreseleccionada?: string) {
    if (!restauranteId) return;
    try {
      const m = await duenosApi.getMesas(restauranteId);
      setMesas(m.filter((mesa) => mesa.activo));
    } catch {
      setMesas([]);
    }
    setNuevaReservaHora(horaPreseleccionada ?? "");
    setNuevaReservaPersonas(2);
    setNuevaReservaNombre("");
    setNuevaReservaTelefono("");
    setNuevaReservaMesaId("");
    setNuevaReservaNotas("");
    setShowNuevaReserva(true);
  }

  async function crearReservaManual(e: React.FormEvent) {
    e.preventDefault();
    if (!restauranteId || !nuevaReservaHora) return;
    setNuevaReservaSaving(true);
    try {
      await duenosApi.crearReservaDueno(restauranteId, {
        fecha: fechaCalendario,
        hora: nuevaReservaHora,
        cantidadPersonas: nuevaReservaPersonas,
        nombreCliente: nuevaReservaNombre || undefined,
        telefonoCliente: nuevaReservaTelefono || undefined,
        mesaId: nuevaReservaMesaId || undefined,
        pedidosEspeciales: nuevaReservaNotas || undefined,
      });
      setShowNuevaReserva(false);
      await cargarCalendario();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setNuevaReservaSaving(false);
    }
  }

  // Reservas que se solapan con un slot seleccionado
  function reservasDelSlot(slot: CalendarioSlot): CalendarioReserva[] {
    if (!calendario) return [];
    return calendario.reservas.filter((r) => {
      const [rh, rm] = r.horaReserva.split(":").map(Number);
      const [sh, sm] = slot.hora.split(":").map(Number);
      const rMin = rh * 60 + rm;
      const sMin = sh * 60 + sm;
      return !(rMin + 90 <= sMin || rMin >= sMin + 90);
    });
  }

  // Agrupar slots por bloque (para horario partido)
  function slotsPorBloque(): { bloque: number; slots: CalendarioSlot[] }[] {
    if (!calendario) return [];
    const map = new Map<number, CalendarioSlot[]>();
    for (const s of calendario.slots) {
      if (!map.has(s.bloque)) map.set(s.bloque, []);
      map.get(s.bloque)!.push(s);
    }
    return Array.from(map.entries()).map(([bloque, slots]) => ({
      bloque,
      slots,
    }));
  }

  const totalPersonas =
    calendario?.reservas.reduce((acc, r) => acc + r.cantidadPersonas, 0) ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <span>📅</span> Reservas
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => abrirNuevaReserva()}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span> Nueva reserva
          </button>

          {/* Toggle calendario / tabla */}
          <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setVista("calendario")}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${
                vista === "calendario"
                  ? "bg-white shadow-sm text-forest-700"
                  : "text-stone-600 hover:text-stone-800"
              }`}
            >
              📅 Calendario
            </button>
            <button
              onClick={() => setVista("tabla")}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${
                vista === "tabla"
                  ? "bg-white shadow-sm text-forest-700"
                  : "text-stone-600 hover:text-stone-800"
              }`}
            >
              📋 Tabla
            </button>
          </div>
        </div>
      </div>

      {/* === VISTA CALENDARIO === */}
      {vista === "calendario" && (
        <>
          {/* Selector de fecha */}
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navegarFecha(-1)}
                  className="btn-ghost px-2 py-1 text-lg"
                >
                  ◀
                </button>
                <input
                  type="date"
                  value={fechaCalendario}
                  onChange={(e) => setFechaCalendario(e.target.value)}
                  className="input w-auto"
                />
                <button
                  onClick={() => navegarFecha(1)}
                  className="btn-ghost px-2 py-1 text-lg"
                >
                  ▶
                </button>
                <button
                  onClick={() =>
                    setFechaCalendario(new Date().toISOString().slice(0, 10))
                  }
                  className="btn-ghost text-sm"
                >
                  Hoy
                </button>
              </div>

              {calendario && (
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  <span>
                    {DIAS[calendario.diaSemana]}{" "}
                    {formatearFecha(calendario.fecha)}
                  </span>
                  <span>
                    <strong className="text-stone-700">
                      {calendario.reservas.length}
                    </strong>{" "}
                    reservas
                  </span>
                  <span>
                    <strong className="text-stone-700">{totalPersonas}</strong>{" "}
                    personas
                  </span>
                </div>
              )}
            </div>
          </div>

          {calendarioError && (
            <div className="card p-6 text-red-700 bg-red-50 border-red-200 mb-4">
              {calendarioError}
            </div>
          )}

          {calendarioLoading && (
            <div className="text-stone-500 flex items-center gap-2 mb-4">
              <span className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
              Cargando calendario...
            </div>
          )}

          {/* Calendario vacío / sin horarios */}
          {calendario &&
            !calendarioLoading &&
            calendario.horarios.length === 0 && (
              <div className="card p-8 text-center bg-cream-100/70 border-dashed mb-4">
                <div className="text-4xl mb-2">🔕</div>
                <p className="text-stone-700 font-medium">
                  Sin horarios configurados para este día
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  El restaurante no abre los {DIAS[calendario.diaSemana]}s.
                </p>
              </div>
            )}

          {/* Slots del calendario por bloque */}
          {calendario &&
            !calendarioLoading &&
            slotsPorBloque().map(({ bloque, slots }) => {
              const horario = calendario.horarios[bloque];
              return (
                <div key={bloque} className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-stone-600">
                      🕐 {horario?.horaApertura} — {horario?.horaCierre}
                    </span>
                    {calendario.horarios.length > 1 && (
                      <span className="pill-gray text-xs">
                        Bloque {bloque + 1}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                    {slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.hora === slot.hora &&
                        selectedSlot?.bloque === slot.bloque;
                      const reservasSlot = reservasDelSlot(slot);
                      return (
                        <button
                          key={`${bloque}-${slot.hora}`}
                          onClick={() =>
                            setSelectedSlot(isSelected ? null : slot)
                          }
                          className={`relative p-2 rounded-lg border text-center transition hover:shadow-sm ${slotColor(slot)} ${isSelected ? "ring-2 ring-forest-600 shadow-md" : ""}`}
                          title={`${slot.hora}: ${slot.mesasDisponibles}/${slot.totalMesas} mesas libres`}
                        >
                          <div className="text-sm font-bold font-mono">
                            {slot.hora}
                          </div>
                          <div className="text-xs mt-0.5">
                            {slot.mesasDisponibles}/{slot.totalMesas}
                          </div>
                          {/* Indicador de reservas */}
                          {reservasSlot.length > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-forest-600 text-cream-50 text-[10px] flex items-center justify-center font-bold">
                              {reservasSlot.length}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detalle del slot seleccionado */}
                  {selectedSlot && selectedSlot.bloque === bloque && (
                    <div className="card p-4 mt-3 border-cream-300 bg-cream-100/40">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-stone-900">
                          📍 Slot {selectedSlot.hora} —{" "}
                          {selectedSlot.mesasDisponibles} de{" "}
                          {selectedSlot.totalMesas} mesas disponibles
                        </h3>
                        <button
                          onClick={() => setSelectedSlot(null)}
                          className="text-stone-400 hover:text-stone-600 text-lg"
                        >
                          ✕
                        </button>
                      </div>

                      {reservasDelSlot(selectedSlot).length === 0 ? (
                        <p className="text-sm text-stone-500 mb-2">
                          No hay reservas en este horario.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {reservasDelSlot(selectedSlot).map((r) => {
                            const nombre =
                              r.cliente?.nombreCompleto ??
                              r.nombreCliente ??
                              "Sin nombre";
                            const telefono =
                              r.cliente?.telefono ?? r.telefonoCliente ?? null;
                            return (
                              <div
                                key={r.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-100"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-stone-800">
                                      {nombre}
                                    </span>
                                    <EstadoBadge estado={r.estado} />
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                                    <span>
                                      {r.horaReserva} — {r.horaFin}
                                    </span>
                                    <span>{r.cantidadPersonas} personas</span>
                                    {r.mesa && (
                                      <span>
                                        {r.mesa.nombre ?? "Mesa sin nombre"}
                                      </span>
                                    )}
                                    {telefono && <span>{telefono}</span>}
                                    {r.cliente && (
                                      <span>{r.cliente.correo}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2 flex-shrink-0">
                                  {r.estado === "PENDIENTE" && (
                                    <button
                                      onClick={() =>
                                        cambiarEstado(r.id, "CONFIRMADA")
                                      }
                                      className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                    >
                                      Confirmar
                                    </button>
                                  )}
                                  {(r.estado === "PENDIENTE" ||
                                    r.estado === "CONFIRMADA") && (
                                    <>
                                      <button
                                        onClick={() =>
                                          cambiarEstado(r.id, "COMPLETADA")
                                        }
                                        className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                      >
                                        Completar
                                      </button>
                                      <button
                                        onClick={() =>
                                          cambiarEstado(r.id, "NO_ASISTIO")
                                        }
                                        className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                      >
                                        No asistió
                                      </button>
                                      <button
                                        onClick={() =>
                                          cambiarEstado(r.id, "CANCELADA")
                                        }
                                        className="text-xs px-2 py-1 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                                      >
                                        Cancelar
                                      </button>
                                    </>
                                  )}
                                  {(r.estado === "COMPLETADA" ||
                                    r.estado === "CANCELADA" ||
                                    r.estado === "NO_ASISTIO") && (
                                    <span className="text-xs text-stone-400 px-1">
                                      —
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Botón para crear reserva desde el slot */}
                      {selectedSlot.mesasDisponibles > 0 && (
                        <button
                          onClick={() => abrirNuevaReserva(selectedSlot.hora)}
                          className="mt-3 text-sm px-3 py-1.5 rounded-lg bg-forest-600 text-cream-50 hover:bg-forest-700 font-medium flex items-center gap-1.5 transition"
                        >
                          <span className="text-base leading-none">+</span>{" "}
                          Reservar aquí ({selectedSlot.hora})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Leyenda */}
          {calendario && calendario.horarios.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-stone-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />{" "}
                Libre
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />{" "}
                Parcial
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />{" "}
                Completo
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-forest-600 text-cream-50 text-[10px] flex items-center justify-center">
                  1
                </span>{" "}
                Reserva activa
              </span>
            </div>
          )}
        </>
      )}

      {/* === VISTA TABLA === */}
      {vista === "tabla" && (
        <>
          {/* Filtros */}
          <div className="card p-4 mb-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filtroDesde}
                  onChange={(e) => setFiltroDesde(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filtroHasta}
                  onChange={(e) => setFiltroHasta(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) =>
                    setFiltroEstado(e.target.value as EstadoReserva | "")
                  }
                  className="input w-full"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={cargarReservas}
                  disabled={cargando}
                  className="btn-primary flex-1 justify-center"
                >
                  {cargando ? "Buscando..." : "Filtrar"}
                </button>
                <button onClick={limpiarFiltros} className="btn-ghost">
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="card p-6 text-red-700 bg-red-50 border-red-200 mb-4">
              {error}
            </div>
          )}

          {reservas === null && !error && (
            <div className="text-stone-500 flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
              Cargando...
            </div>
          )}

          {reservas && reservas.length === 0 && (
            <div className="card p-8 text-center bg-cream-100/70 border-dashed">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-stone-700 font-medium">Sin reservas</p>
              <p className="text-xs text-stone-500 mt-1">
                No hay reservas que coincidan con los filtros aplicados.
              </p>
            </div>
          )}

          {reservas && reservas.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-cream-100 to-cream-200 text-left text-stone-700">
                    <tr>
                      <th className="px-3 py-3 font-semibold">Fecha</th>
                      <th className="px-3 py-3 font-semibold">Hora</th>
                      <th className="px-3 py-3 font-semibold">Cliente</th>
                      <th className="px-3 py-3 font-semibold">Contacto</th>
                      <th className="px-3 py-3 font-semibold text-center">
                        Personas
                      </th>
                      <th className="px-3 py-3 font-semibold">Mesa</th>
                      <th className="px-3 py-3 font-semibold">Estado</th>
                      <th className="px-3 py-3 font-semibold w-44 text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {reservas.map((r) => {
                      const nombreMostrar =
                        r.cliente?.nombreCompleto ?? r.nombreCliente ?? "—";
                      const telefonoMostrar =
                        r.cliente?.telefono ?? r.telefonoCliente ?? null;
                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-cream-100/60 transition"
                        >
                          <td className="px-3 py-3 font-mono text-stone-700">
                            {formatearFecha(r.fechaReserva)}
                          </td>
                          <td className="px-3 py-3 font-mono text-stone-700">
                            {r.horaReserva}
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-stone-800">
                              {nombreMostrar}
                            </div>
                            {r.cliente && (
                              <div className="text-xs text-stone-500">
                                {r.cliente.correo}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-stone-700">
                            {telefonoMostrar ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-stone-800">
                            {r.cantidadPersonas}
                          </td>
                          <td className="px-3 py-3 text-stone-700">
                            {r.mesaNombre ? (
                              <span className="font-medium">
                                {r.mesaNombre}
                              </span>
                            ) : (
                              <span className="text-stone-400">
                                Sin asignar
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <EstadoBadge estado={r.estado} />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {r.estado === "PENDIENTE" && (
                                <button
                                  onClick={() =>
                                    cambiarEstado(r.id, "CONFIRMADA")
                                  }
                                  className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                >
                                  Confirmar
                                </button>
                              )}
                              {(r.estado === "PENDIENTE" ||
                                r.estado === "CONFIRMADA") && (
                                <>
                                  <button
                                    onClick={() =>
                                      cambiarEstado(r.id, "COMPLETADA")
                                    }
                                    className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                  >
                                    Completar
                                  </button>
                                  <button
                                    onClick={() =>
                                      cambiarEstado(r.id, "NO_ASISTIO")
                                    }
                                    className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                  >
                                    No asistió
                                  </button>
                                  <button
                                    onClick={() =>
                                      cambiarEstado(r.id, "CANCELADA")
                                    }
                                    className="text-xs px-2 py-1 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                              {(r.estado === "COMPLETADA" ||
                                r.estado === "CANCELADA" ||
                                r.estado === "NO_ASISTIO") && (
                                <span className="text-xs text-stone-400">
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* === MODAL NUEVA RESERVA === */}
      {showNuevaReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !nuevaReservaSaving && setShowNuevaReserva(false)}
          />
          <div className="relative card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            {/* Header con gradiente forest */}
            <div className="relative px-6 py-5 border-b border-cream-200 bg-gradient-to-br from-forest-700 via-forest-800 to-forest-900 text-white overflow-hidden">
              <div
                className="absolute -right-6 -top-6 w-48 h-48 opacity-10 select-none pointer-events-none"
                aria-hidden
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  className="w-full h-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
              </div>
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cream-200/90 font-semibold mb-1">
                    <span className="w-1.5 h-1.5 bg-cream-200 rounded-full" />
                    Cargar nuevo
                  </div>
                  <h2 className="text-xl font-bold leading-tight">
                    Nueva reserva
                  </h2>
                  <p className="text-sm text-cream-200/80 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                        />
                      </svg>
                      {formatearFecha(fechaCalendario)}
                    </span>
                    <span className="text-cream-200/50">·</span>
                    <span>Reserva manual (teléfono / presencial)</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNuevaReserva(false)}
                  className="text-cream-200/80 hover:text-white hover:bg-white/10 text-2xl leading-none w-9 h-9 flex items-center justify-center rounded-full transition"
                  aria-label="Cerrar"
                  disabled={nuevaReservaSaving}
                >
                  ×
                </button>
              </div>
            </div>

            <form
              onSubmit={crearReservaManual}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
                {/* SECCIÓN: Turno */}
                <section>
                  <SectionTitle icon="turno">Turno</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Hora <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={nuevaReservaHora}
                        onChange={(e) => setNuevaReservaHora(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Personas <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={50}
                        value={nuevaReservaPersonas}
                        onChange={(e) =>
                          setNuevaReservaPersonas(Number(e.target.value))
                        }
                        className="input"
                      />
                    </div>
                  </div>
                </section>

                {/* SECCIÓN: Cliente */}
                <section>
                  <SectionTitle icon="cliente">Cliente</SectionTitle>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={nuevaReservaNombre}
                        onChange={(e) => setNuevaReservaNombre(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Teléfono
                      </label>
                      <PhoneInput
                        international
                        defaultCountry="AR"
                        value={(nuevaReservaTelefono as Value) || undefined}
                        onChange={(value) =>
                          setNuevaReservaTelefono(value ?? "")
                        }
                        placeholder="11 1234-5678"
                        className="rg-phone-input"
                      />
                    </div>
                  </div>
                </section>

                {/* SECCIÓN: Mesa */}
                <section>
                  <SectionTitle icon="mesa">Mesa</SectionTitle>
                  <select
                    value={nuevaReservaMesaId}
                    onChange={(e) => setNuevaReservaMesaId(e.target.value)}
                    className="input"
                  >
                    <option value="">Automática (el sistema asigna)</option>
                    {mesas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre ?? "Mesa"} — {m.capacidad} personas
                      </option>
                    ))}
                  </select>
                </section>

                {/* SECCIÓN: Notas */}
                <section>
                  <SectionTitle icon="notas">Notas</SectionTitle>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Pedidos especiales
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Alergias, preferencias, etc."
                      value={nuevaReservaNotas}
                      onChange={(e) => setNuevaReservaNotas(e.target.value)}
                      className="input resize-y"
                    />
                  </div>
                </section>
              </div>

              {/* Footer sticky */}
              <div className="px-6 py-4 border-t border-cream-200 bg-cream-50/40 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNuevaReserva(false)}
                  className="btn-ghost"
                  disabled={nuevaReservaSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={nuevaReservaSaving || !nuevaReservaHora}
                  className="btn-primary"
                >
                  {nuevaReservaSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando…
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      Crear reserva
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Título de sección con barrita vertical verde (consistente con el
 * modal de Crear restaurante / Mesas).
 */
function SectionTitle({
  icon,
  children,
}: {
  icon: "turno" | "cliente" | "mesa" | "notas";
  children: ReactNode;
}) {
  return (
    <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
      <span className="w-1 h-4 bg-forest-600 rounded-full" />
      <span aria-hidden className="text-forest-600">
        <SectionIcon kind={icon} />
      </span>
      <span>{children}</span>
    </h3>
  );
}

function SectionIcon({
  kind,
}: {
  kind: "turno" | "cliente" | "mesa" | "notas";
}) {
  const className = "w-4 h-4";
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none" as const,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 2,
    className,
  };
  switch (kind) {
    case "turno":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case "cliente":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      );
    case "mesa":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8.25a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 8.25v7.5A2.25 2.25 0 0 1 18.75 18H5.25A2.25 2.25 0 0 1 3 15.75v-7.5ZM3 12h18"
          />
        </svg>
      );
    case "notas":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487 18.549 2.799a2.121 2.121 0 1 1 3 3L18.549 9.799a2.25 2.25 0 0 1-1.897 1.131l-2.685.8.8-2.685a2.25 2.25 0 0 1 1.131-1.897ZM19.5 12.75V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V8.25A2.25 2.25 0 0 1 6.75 6h6.75"
          />
        </svg>
      );
  }
}
