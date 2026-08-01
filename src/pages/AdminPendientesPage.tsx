// filepath: src/pages/AdminPendientesPage.tsx
// Panel de admin: listar dueños pendientes de verificación + ver su
// documentación (avatar, DNI frente/dorso) + aprobar / rechazar.
//
// Estado en memoria; sin mutaciones especiales. Sólo se listan y se actúa
// puntualmente contra el backend.

import { useEffect, useState, useMemo } from "react";
import {
  adminApi,
  type DuenoDetalle,
  type EstadoVerificacion,
} from "../api/admin";

/**
 * Parsea una fecha ISO (con o sin hora) o un string 'YYYY-MM-DD' y la
 * devuelve en formato 'DD/MM/AAAA'. Devuelve el fallback si es null/inválida.
 *
 * Como el backend serializa `Date` como ISO UTC (ej: "1999-08-16T00:00:00.000Z"),
 * tomamos solo la parte de la fecha antes de formatear para evitar el
 * offset de timezone que puede cambiar el día.
 */
function formatFecha(iso: string | null | undefined, fallback = "—"): string {
  if (!iso) return fallback;
  // Tomar solo la porción YYYY-MM-DD antes de cualquier espacio, T o Z.
  const ymd = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!ymd) return fallback;
  return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
}

type FiltroEstado =
  "PENDIENTE" | "EN_REVISION" | "VERIFICADO" | "RECHAZADO" | "TODOS";

const FILTROS: { valor: FiltroEstado; label: string }[] = [
  { valor: "PENDIENTE", label: "Pendientes" },
  { valor: "EN_REVISION", label: "En revisión" },
  { valor: "VERIFICADO", label: "Verificados" },
  { valor: "RECHAZADO", label: "Rechazados" },
  { valor: "TODOS", label: "Todos" },
];

const PILL: Record<EstadoVerificacion, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 border-amber-200",
  EN_REVISION: "bg-sky-100 text-sky-800 border-sky-200",
  VERIFICADO: "bg-forest-100 text-forest-800 border-forest-200",
  RECHAZADO: "bg-red-100 text-red-800 border-red-200",
};

const PILL_LABEL: Record<EstadoVerificacion, string> = {
  PENDIENTE: "Pendiente",
  EN_REVISION: "En revisión",
  VERIFICADO: "Verificado",
  RECHAZADO: "Rechazado",
};

export default function AdminPendientesPage() {
  const [data, setData] = useState<DuenoDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>("PENDIENTE");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState<DuenoDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [showRechazar, setShowRechazar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [accionError, setAccionError] = useState<string | null>(null);

  function cargar() {
    setCargando(true);
    setError(null);
    const filtroEstado = filtro === "TODOS" ? undefined : filtro;
    adminApi
      .listDuenos({ estado: filtroEstado, limit: 100 })
      .then((resp) => setData(resp.data))
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (d) =>
        d.nombreCompleto.toLowerCase().includes(q) ||
        d.correo.toLowerCase().includes(q) ||
        d.dni.toLowerCase().includes(q),
    );
  }, [data, busqueda]);

  async function abrirDetalle(dueno: DuenoDetalle) {
    setDetalle(dueno);
    setDetalleLoading(true);
    setShowRechazar(false);
    setMotivo("");
    setMotivoError(null);
    setAccionError(null);
    try {
      const full = await adminApi.getDuenoById(dueno.id);
      setDetalle(full);
    } catch (e) {
      setAccionError((e as Error).message);
    } finally {
      setDetalleLoading(false);
    }
  }

  function cerrarDetalle() {
    setDetalle(null);
    setShowRechazar(false);
    setMotivo("");
    setMotivoError(null);
    setAccionError(null);
  }

  async function handleVerificar() {
    if (!detalle) return;
    if (!confirm(`¿Verificar a ${detalle.nombreCompleto}?`)) return;
    setProcesando(true);
    setAccionError(null);
    try {
      await adminApi.verificarDueno(detalle.id);
      cerrarDetalle();
      cargar();
    } catch (e) {
      setAccionError((e as Error).message);
    } finally {
      setProcesando(false);
    }
  }

  async function handleRechazar() {
    if (!detalle) return;
    setMotivoError(null);
    const m = motivo.trim();
    if (m.length < 5) {
      setMotivoError("El motivo debe tener al menos 5 caracteres.");
      return;
    }
    if (m.length > 500) {
      setMotivoError("El motivo no puede tener más de 500 caracteres.");
      return;
    }
    if (!confirm(`¿Rechazar a ${detalle.nombreCompleto}?`)) return;
    setProcesando(true);
    setAccionError(null);
    try {
      await adminApi.rechazarDueno(detalle.id, m);
      cerrarDetalle();
      cargar();
    } catch (e) {
      setAccionError((e as Error).message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-stone-900">
          Verificación de dueños
        </h2>
        <span className="text-sm text-stone-500">
          {cargando
            ? "Cargando..."
            : `${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filtro === f.valor
                ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
                : "bg-white text-stone-700 border-stone-200 hover:bg-cream-100 hover:border-stone-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo o DNI…"
          className="input"
        />
      </div>

      {error && (
        <div className="card p-4 text-red-700 bg-red-50 border-red-200 mb-4">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="text-stone-500 flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
          Cargando dueños…
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card p-8 text-center bg-cream-50/40 border-dashed border-cream-300">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-stone-700 font-medium">
            Sin dueños en este estado
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Cambiá el filtro o esperá a que se registren más dueños.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-cream-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-left text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Dueño</th>
                <th className="px-4 py-3 font-semibold">DNI</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  Localidad
                </th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold w-32 text-right">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtrados.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-cream-50/60 transition cursor-pointer"
                  onClick={() => abrirDetalle(d)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {d.urlAvatar ? (
                          <img
                            src={d.urlAvatar}
                            alt={d.nombreCompleto}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-stone-500 font-medium">
                            {d.nombreCompleto.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-stone-900 truncate">
                          {d.nombreCompleto}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          {d.correo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{d.dni}</td>
                  <td className="px-4 py-3 text-stone-700 hidden sm:table-cell">
                    {d.ciudad?.nombre ?? "—"}
                    {d.provincia?.nombre ? `, ${d.provincia.nombre}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${PILL[d.estadoVerificacion]}`}
                    >
                      {PILL_LABEL[d.estadoVerificacion]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirDetalle(d);
                      }}
                      className="text-xs px-2.5 py-1 rounded bg-forest-600 text-cream-50 hover:bg-forest-700 transition"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cerrarDetalle}
          />
          <div className="relative card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {detalleLoading ? (
              <div className="p-6 flex items-center gap-2 text-stone-500">
                <span className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                Cargando documentación…
              </div>
            ) : (
              <>
                {/* Header del modal */}
                <div className="px-6 py-5 border-b border-cream-200 bg-gradient-to-br from-cream-50 to-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 overflow-hidden shrink-0 flex items-center justify-center text-cream-50 font-bold text-xl shadow-sm">
                        {detalle.urlAvatar ? (
                          <img
                            src={detalle.urlAvatar}
                            alt={detalle.nombreCompleto}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          detalle.nombreCompleto.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-stone-900 leading-tight truncate">
                          {detalle.nombreCompleto}
                        </h3>
                        <p className="text-sm text-stone-500 truncate">
                          {detalle.correo}
                        </p>
                        <span
                          className={`inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full border font-medium ${PILL[detalle.estadoVerificacion]}`}
                        >
                          {PILL_LABEL[detalle.estadoVerificacion]}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={cerrarDetalle}
                      className="text-stone-400 hover:text-stone-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 transition"
                      aria-label="Cerrar"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Cuerpo scrolleable */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                  {/* Datos personales */}
                  <section className="mb-5">
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-forest-600 rounded-full" />
                      Datos personales
                    </h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-stone-500">DNI</dt>
                        <dd className="text-stone-900 font-medium">
                          {detalle.dni}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">CUIT/CUIL</dt>
                        <dd className="text-stone-900 font-medium">
                          {detalle.cuitCuil ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">Teléfono</dt>
                        <dd className="text-stone-900 font-medium">
                          {detalle.telefono}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">
                          Fecha de nacimiento
                        </dt>
                        <dd className="text-stone-900 font-medium">
                          {formatFecha(detalle.fechaNacimiento)}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-stone-500">Dirección</dt>
                        <dd className="text-stone-900 font-medium">
                          {detalle.direccion}
                          {detalle.ciudad?.nombre
                            ? `, ${detalle.ciudad.nombre}`
                            : ""}
                          {detalle.provincia?.nombre
                            ? `, ${detalle.provincia.nombre}`
                            : ""}
                          {detalle.codigoPostal
                            ? ` (${detalle.codigoPostal})`
                            : ""}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* Documentación */}
                  <section className="mb-5">
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-forest-600 rounded-full" />
                      Documentación
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <DocImage
                        label="Avatar / selfie"
                        url={detalle.urlAvatar}
                      />
                      <DocImage
                        label="DNI frente"
                        url={detalle.urlFotoDniFrente}
                      />
                      <DocImage
                        label="DNI dorso"
                        url={detalle.urlFotoDniDorso}
                      />
                    </div>
                  </section>

                  {detalle.motivoRechazo && (
                    <section className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-1 flex items-center gap-2">
                        <span className="w-1 h-4 bg-red-500 rounded-full" />
                        Motivo de rechazo anterior
                      </h4>
                      <p className="text-sm text-red-700">
                        {detalle.motivoRechazo}
                      </p>
                    </section>
                  )}

                  {accionError && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                      {accionError}
                    </div>
                  )}

                  {/* Form de rechazo */}
                  {showRechazar && (
                    <section className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <label className="block text-sm font-medium text-stone-800 mb-1">
                        Motivo del rechazo *
                      </label>
                      <p className="text-xs text-stone-600 mb-2">
                        El dueño va a ver este mensaje en su panel.
                      </p>
                      <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        className="input min-h-[90px] resize-y"
                        placeholder="Explicá por qué se rechaza esta verificación…"
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-stone-500">
                          Mínimo 5 caracteres
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {motivo.length} / 500
                        </span>
                      </div>
                      {motivoError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                          {motivoError}
                        </div>
                      )}
                    </section>
                  )}
                </div>

                {/* Footer de acciones, siempre visible */}
                <div className="px-6 py-4 border-t border-cream-200 bg-cream-50/40 flex flex-wrap justify-end gap-2">
                  <button
                    onClick={cerrarDetalle}
                    className="btn-ghost text-sm py-1.5 px-3"
                    disabled={procesando}
                  >
                    Cerrar
                  </button>
                  {detalle.estadoVerificacion !== "VERIFICADO" &&
                    !showRechazar && (
                      <button
                        onClick={() => setShowRechazar(true)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-red-300 bg-white text-red-700 hover:bg-red-50 transition"
                        disabled={procesando}
                      >
                        Rechazar
                      </button>
                    )}
                  {showRechazar && (
                    <button
                      onClick={handleRechazar}
                      className="text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
                      disabled={procesando}
                    >
                      {procesando ? "Rechazando..." : "Confirmar rechazo"}
                    </button>
                  )}
                  {detalle.estadoVerificacion !== "VERIFICADO" && (
                    <button
                      onClick={handleVerificar}
                      className="btn-primary text-sm py-1.5 px-3 disabled:opacity-50"
                      disabled={procesando}
                    >
                      {procesando ? "Procesando..." : "✓ Verificar"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DocImage({ label, url }: { label: string; url: string | null }) {
  return (
    <div>
      <div className="text-xs text-stone-600 font-medium mb-1.5">{label}</div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block aspect-[4/3] rounded-lg border border-cream-200 overflow-hidden bg-cream-50 hover:opacity-90 hover:border-forest-300 transition group"
        >
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </a>
      ) : (
        <div className="aspect-[4/3] rounded-lg border-2 border-dashed border-cream-300 bg-cream-50/40 flex flex-col items-center justify-center text-stone-400 text-xs gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          <span>Sin imagen</span>
        </div>
      )}
    </div>
  );
}
