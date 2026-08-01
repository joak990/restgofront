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

type FiltroEstado = "PENDIENTE" | "EN_REVISION" | "VERIFICADO" | "RECHAZADO" | "TODOS";

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
  VERIFICADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
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
    const filtroEstado =
      filtro === "TODOS" ? undefined : filtro;
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
        <h2 className="text-xl font-semibold text-stone-900 flex items-center gap-2">
          🛡️ Verificación de dueños
        </h2>
        <span className="text-sm text-stone-500">
          {cargando ? "Cargando..." : `${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"}`}
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
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
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
        <div className="card p-8 text-center bg-stone-100 border-dashed">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-stone-700 font-medium">Sin dueños en este estado</p>
          <p className="text-xs text-stone-500 mt-1">
            Cambiá el filtro o esperá a que se registren más dueños.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-left text-stone-700">
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
            <tbody className="divide-y divide-stone-100">
              {filtrados.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-stone-50 transition cursor-pointer"
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
                      className="text-xs px-2.5 py-1 rounded bg-stone-900 text-white hover:bg-stone-700"
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
          <div className="relative card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            {detalleLoading ? (
              <div className="flex items-center gap-2 text-stone-500">
                <span className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                Cargando documentación…
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">
                      {detalle.nombreCompleto}
                    </h3>
                    <p className="text-sm text-stone-500">{detalle.correo}</p>
                    <span
                      className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${PILL[detalle.estadoVerificacion]}`}
                    >
                      {PILL_LABEL[detalle.estadoVerificacion]}
                    </span>
                  </div>
                  <button
                    onClick={cerrarDetalle}
                    className="text-stone-400 hover:text-stone-700 text-2xl leading-none"
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>

                {/* Datos personales */}
                <section className="mb-4">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                    Datos personales
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-stone-500">DNI</span>
                      <div className="text-stone-900">{detalle.dni}</div>
                    </div>
                    <div>
                      <span className="text-stone-500">CUIT/CUIL</span>
                      <div className="text-stone-900">
                        {detalle.cuitCuil ?? "—"}
                      </div>
                    </div>
                    <div>
                      <span className="text-stone-500">Teléfono</span>
                      <div className="text-stone-900">{detalle.telefono}</div>
                    </div>
                    <div>
                      <span className="text-stone-500">Fecha de nacimiento</span>
                      <div className="text-stone-900">
                        {detalle.fechaNacimiento ?? "—"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-stone-500">Dirección</span>
                      <div className="text-stone-900">
                        {detalle.direccion}
                        {detalle.ciudad?.nombre ? `, ${detalle.ciudad.nombre}` : ""}
                        {detalle.provincia?.nombre ? `, ${detalle.provincia.nombre}` : ""}
                        {detalle.codigoPostal ? ` (${detalle.codigoPostal})` : ""}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Documentación */}
                <section className="mb-4">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                    Documentación
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <DocImage label="Avatar / selfie" url={detalle.urlAvatar} />
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
                  <section className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-1">
                      Motivo de rechazo anterior
                    </h4>
                    <p className="text-sm text-red-700">
                      {detalle.motivoRechazo}
                    </p>
                  </section>
                )}

                {accionError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                    {accionError}
                  </div>
                )}

                {/* Form de rechazo */}
                {showRechazar && (
                  <section className="mb-4 p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Motivo del rechazo *
                    </label>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="input min-h-[80px] resize-y"
                      placeholder="Explicá por qué se rechaza esta verificación. El dueño va a ver este mensaje."
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-stone-500">
                        {motivo.length} / 500
                      </span>
                    </div>
                    {motivoError && (
                      <div className="mt-1 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                        {motivoError}
                      </div>
                    )}
                  </section>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    onClick={cerrarDetalle}
                    className="text-sm px-3 py-1.5 rounded border border-stone-300 hover:bg-stone-100"
                    disabled={procesando}
                  >
                    Cerrar
                  </button>
                  {detalle.estadoVerificacion !== "VERIFICADO" &&
                    !showRechazar && (
                      <button
                        onClick={() => setShowRechazar(true)}
                        className="text-sm px-3 py-1.5 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                        disabled={procesando}
                      >
                        Rechazar
                      </button>
                    )}
                  {showRechazar && (
                    <button
                      onClick={handleRechazar}
                      className="text-sm px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      disabled={procesando}
                    >
                      {procesando ? "Rechazando..." : "Confirmar rechazo"}
                    </button>
                  )}
                  {detalle.estadoVerificacion !== "VERIFICADO" && (
                    <button
                      onClick={handleVerificar}
                      className="text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
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
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block aspect-[4/3] rounded-lg border border-stone-200 overflow-hidden bg-stone-50 hover:opacity-90 transition"
        >
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover"
          />
        </a>
      ) : (
        <div className="aspect-[4/3] rounded-lg border border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-xs bg-stone-50">
          Sin imagen
        </div>
      )}
    </div>
  );
}
