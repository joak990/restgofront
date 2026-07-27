import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { duenosApi, type Reserva, type EstadoReserva } from '../api/duenos';

const ESTADOS: { value: EstadoReserva | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'CONFIRMADA', label: 'Confirmadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
  { value: 'NO_ASISTIO', label: 'No asistió' },
  { value: 'COMPLETADA', label: 'Completadas' },
];

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function EstadoBadge({ estado }: { estado: string }) {
  const clases: Record<string, string> = {
    CONFIRMADA: 'pill-green',
    PENDIENTE: 'pill-yellow',
    CANCELADA: 'pill-gray',
    NO_ASISTIO: 'pill-red',
    COMPLETADA: 'pill-blue',
  };
  const etiquetas: Record<string, string> = {
    CONFIRMADA: '✓ Confirmada',
    PENDIENTE: '⏳ Pendiente',
    CANCELADA: '✕ Cancelada',
    NO_ASISTIO: '✕ No asistió',
    COMPLETADA: '✓ Completada',
  };
  return (
    <span className={clases[estado] ?? 'pill-gray'}>{etiquetas[estado] ?? estado}</span>
  );
}

export default function ReservasPage() {
  const { id: restauranteId } = useParams<{ id: string }>();

  const [reservas, setReservas] = useState<Reserva[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | ''>('');
  const [filtroDesde, setFiltroDesde] = useState<string>('');
  const [filtroHasta, setFiltroHasta] = useState<string>('');

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
    nuevoEstado: 'CONFIRMADA' | 'CANCELADA' | 'NO_ASISTIO' | 'COMPLETADA',
  ) {
    if (!restauranteId) return;
    const mensajes: Record<string, string> = {
      CONFIRMADA: '¿Confirmar esta reserva?',
      CANCELADA: '¿Cancelar esta reserva?',
      NO_ASISTIO: '¿Marcar como no asistió?',
      COMPLETADA: '¿Marcar como completada?',
    };
    if (!confirm(mensajes[nuevoEstado])) return;
    try {
      await duenosApi.actualizarEstadoReserva(restauranteId, reservaId, nuevoEstado);
      await cargarReservas();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function limpiarFiltros() {
    setFiltroEstado('');
    setFiltroDesde('');
    setFiltroHasta('');
    setTimeout(cargarReservas, 0);
  }

  const totalPersonas = reservas?.reduce((acc, r) => acc + r.cantidadPersonas, 0) ?? 0;
  const hoy = new Date().toISOString().slice(0, 10);
  const reservasHoy = reservas?.filter((r) => r.fechaReserva === hoy).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <span>📅</span> Reservas
        </h2>
        {reservas && (
          <div className="flex items-center gap-3 text-sm text-stone-500">
            <span>
              <strong className="text-stone-700">{reservas.length}</strong>{' '}
              {reservas.length === 1 ? 'reserva' : 'reservas'}
            </span>
            <span>·</span>
            <span>
              <strong className="text-stone-700">{reservasHoy}</strong> hoy
            </span>
            <span>·</span>
            <span>
              <strong className="text-stone-700">{totalPersonas}</strong> personas
              totales
            </span>
          </div>
        )}
      </div>

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
              onChange={(e) => setFiltroEstado(e.target.value as EstadoReserva | '')}
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
              {cargando ? 'Buscando...' : 'Filtrar'}
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
          <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Cargando...
        </div>
      )}

      {reservas && reservas.length === 0 && (
        <div className="card p-8 text-center bg-orange-50/50 border-dashed">
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
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50 text-left text-stone-700">
                <tr>
                  <th className="px-3 py-3 font-semibold">Fecha</th>
                  <th className="px-3 py-3 font-semibold">Hora</th>
                  <th className="px-3 py-3 font-semibold">Cliente</th>
                  <th className="px-3 py-3 font-semibold">Contacto</th>
                  <th className="px-3 py-3 font-semibold text-center">Personas</th>
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
                    r.cliente?.nombreCompleto ?? r.nombreCliente ?? '—';
                  const telefonoMostrar =
                    r.cliente?.telefono ?? r.telefonoCliente ?? null;
                  return (
                    <tr key={r.id} className="hover:bg-orange-50/40 transition">
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
                        {telefonoMostrar ?? '—'}
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-stone-800">
                        {r.cantidadPersonas}
                      </td>
                      <td className="px-3 py-3 text-stone-700">
                        {r.mesaNombre ? (
                          <span className="font-medium">{r.mesaNombre}</span>
                        ) : (
                          <span className="text-stone-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <EstadoBadge estado={r.estado} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {r.estado === 'PENDIENTE' && (
                            <button
                              onClick={() => cambiarEstado(r.id, 'CONFIRMADA')}
                              className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                            >
                              Confirmar
                            </button>
                          )}
                          {(r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA') && (
                            <>
                              <button
                                onClick={() => cambiarEstado(r.id, 'COMPLETADA')}
                                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              >
                                Completar
                              </button>
                              <button
                                onClick={() => cambiarEstado(r.id, 'NO_ASISTIO')}
                                className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              >
                                No asistió
                              </button>
                              <button
                                onClick={() => cambiarEstado(r.id, 'CANCELADA')}
                                className="text-xs px-2 py-1 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {r.estado === 'COMPLETADA' && (
                            <span className="text-xs text-stone-400">—</span>
                          )}
                          {r.estado === 'CANCELADA' && (
                            <span className="text-xs text-stone-400">—</span>
                          )}
                          {r.estado === 'NO_ASISTIO' && (
                            <span className="text-xs text-stone-400">—</span>
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
    </div>
  );
}