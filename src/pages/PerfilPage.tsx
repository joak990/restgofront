import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  duenosApi,
  type PerfilResponse,
  type ActualizarPerfilBody,
  type Provincia,
  type Ciudad,
} from "../api/duenos";

const NIVEL_COLOR: Record<string, string> = {
  GRATIS: "pill-gray",
  PRO: "pill-blue",
  PREMIUM: "pill-amber",
};

const ESTADO_SUS_COLOR: Record<string, string> = {
  ACTIVA: "pill-green",
  EN_PRUEBA: "pill-yellow",
  PAGO_PENDIENTE: "pill-red",
  CANCELADA: "pill-gray",
};

const VERIF_COLOR: Record<string, string> = {
  PENDIENTE: "pill-yellow",
  EN_REVISION: "pill-blue",
  VERIFICADO: "pill-green",
  RECHAZADO: "pill-red",
};

const VERIF_LABEL: Record<string, string> = {
  PENDIENTE: "⏳ Pendiente",
  EN_REVISION: "🔍 En revisión",
  VERIFICADO: "✅ Verificado",
  RECHAZADO: "✕ Rechazado",
};

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<ActualizarPerfilBody>({});
  const [guardando, setGuardando] = useState(false);

  // Provincias/Ciudades para el form
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);

  async function cargarPerfil() {
    setLoading(true);
    setError(null);
    try {
      const data = await duenosApi.getPerfil();
      setPerfil(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarPerfil();
  }, []);

  function iniciarEdicion() {
    if (!perfil) return;
    setForm({
      nombreCompleto: perfil.nombreCompleto,
      telefono: perfil.telefono,
      direccion: perfil.direccion,
      provinciaId: perfil.provinciaId,
      ciudadId: perfil.ciudadId,
      codigoPostal: perfil.codigoPostal ?? "",
      urlAvatar: perfil.urlAvatar ?? "",
    });
    setEditando(true);
    // Cargar provincias
    duenosApi
      .getProvincias()
      .then(setProvincias)
      .catch(() => {});
    // Cargar ciudades de la provincia actual
    if (perfil.provinciaId) {
      duenosApi
        .getCiudades(perfil.provinciaId)
        .then(setCiudades)
        .catch(() => {});
    }
  }

  async function handleProvinciaChange(provinciaId: string) {
    setForm((f) => ({ ...f, provinciaId, ciudadId: "" }));
    try {
      const c = await duenosApi.getCiudades(provinciaId);
      setCiudades(c);
    } catch {
      setCiudades([]);
    }
  }

  async function guardarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      // Limpiar campos vacíos
      const body: ActualizarPerfilBody = {};
      if (form.nombreCompleto) body.nombreCompleto = form.nombreCompleto;
      if (form.telefono) body.telefono = form.telefono;
      if (form.direccion) body.direccion = form.direccion;
      if (form.provinciaId) body.provinciaId = form.provinciaId;
      if (form.ciudadId) body.ciudadId = form.ciudadId;
      if (form.codigoPostal !== undefined)
        body.codigoPostal = form.codigoPostal || undefined;
      if (form.urlAvatar !== undefined)
        body.urlAvatar = form.urlAvatar || undefined;

      await duenosApi.actualizarPerfil(body);
      setEditando(false);
      await cargarPerfil();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500">
        <span className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        Cargando perfil...
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="card p-6 text-red-700 bg-red-50 border-red-200">
        {error ?? "No se pudo cargar el perfil"}
      </div>
    );
  }

  const inicial = perfil.nombreCompleto.charAt(0).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <span>👤</span> Mi Perfil
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Gestiona tus datos personales y suscripciones
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* === CARD DATOS PERSONALES === */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-stone-900 text-lg">
                Datos personales
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={
                    VERIF_COLOR[perfil.estadoVerificacion] ?? "pill-gray"
                  }
                >
                  {VERIF_LABEL[perfil.estadoVerificacion] ??
                    perfil.estadoVerificacion}
                </span>
                {!editando && (
                  <button
                    onClick={iniciarEdicion}
                    className="btn-ghost text-sm py-1 px-3"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>
            </div>

            {!editando ? (
              /* Vista de perfil */
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {perfil.urlAvatar ? (
                    <img
                      src={perfil.urlAvatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-forest-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-cream-50 text-2xl font-bold shadow-md">
                      {inicial}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoRow
                      label="Nombre completo"
                      value={perfil.nombreCompleto}
                    />
                    <InfoRow label="Correo" value={perfil.correo} />
                    <InfoRow label="Teléfono" value={perfil.telefono} />
                    <InfoRow label="DNI" value={perfil.dni} />
                    <InfoRow label="CUIT/CUIL" value={perfil.cuitCuil ?? "—"} />
                    <InfoRow
                      label="Fecha de nacimiento"
                      value={perfil.fechaNacimiento ?? "—"}
                    />
                  </div>
                  <div className="border-t border-stone-100 pt-3">
                    <InfoRow
                      label="Dirección"
                      value={`${perfil.direccion}${perfil.provincia ? `, ${perfil.provincia.nombre}` : ""}${perfil.ciudad ? `, ${perfil.ciudad.nombre}` : ""}${perfil.codigoPostal ? ` (${perfil.codigoPostal})` : ""}`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Formulario de edición */
              <form onSubmit={guardarPerfil} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={form.nombreCompleto ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          nombreCompleto: e.target.value,
                        }))
                      }
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={form.telefono ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, telefono: e.target.value }))
                      }
                      className="input w-full"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={form.direccion ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, direccion: e.target.value }))
                      }
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Provincia
                    </label>
                    <select
                      value={form.provinciaId ?? ""}
                      onChange={(e) => handleProvinciaChange(e.target.value)}
                      className="input w-full"
                    >
                      <option value="">Seleccionar...</option>
                      {provincias.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Ciudad
                    </label>
                    <select
                      value={form.ciudadId ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ciudadId: e.target.value }))
                      }
                      className="input w-full"
                    >
                      <option value="">Seleccionar...</option>
                      {ciudades.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Código postal
                    </label>
                    <input
                      type="text"
                      value={form.codigoPostal ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, codigoPostal: e.target.value }))
                      }
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      URL del avatar
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={form.urlAvatar ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, urlAvatar: e.target.value }))
                      }
                      className="input w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="btn-primary text-sm flex-1 justify-center"
                  >
                    {guardando ? "Guardando..." : "✓ Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditando(false)}
                    className="btn-ghost text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* === CARD RESUMEN === */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-stone-900 mb-3">Resumen</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Restaurantes</span>
                <span className="font-bold text-lg text-forest-700">
                  {perfil.totalRestaurantes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Mesas totales</span>
                <span className="font-bold text-lg text-forest-700">
                  {perfil.totalMesas}
                </span>
              </div>
            </div>
          </div>

          {/* === CARD SUSCRIPCIONES === */}
          <div className="card p-5">
            <h3 className="font-semibold text-stone-900 mb-3">
              📋 Suscripciones
            </h3>
            {perfil.restaurantes.length === 0 ? (
              <p className="text-sm text-stone-500">
                No tenés restaurantes aún.
              </p>
            ) : (
              <div className="space-y-3">
                {perfil.restaurantes.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-cream-100/60 rounded-lg border border-cream-200"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Link
                        to={`/dueno/restaurantes/${r.id}`}
                        className="font-medium text-forest-700 hover:underline text-sm truncate"
                      >
                        {r.nombre}
                      </Link>
                      <span
                        className={
                          NIVEL_COLOR[r.nivelSuscripcion] ?? "pill-gray"
                        }
                      >
                        {r.nivelSuscripcion}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={
                          ESTADO_SUS_COLOR[r.estadoSuscripcion] ?? "pill-gray"
                        }
                      >
                        {r.estadoSuscripcion.replace(/_/g, " ")}
                      </span>
                      {r.suscripcionFin && (
                        <span className="text-xs text-stone-500">
                          Hasta {r.suscripcionFin}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                      <span>{r._count.mesas} mesas</span>
                      <span>{r._count.platos} platos</span>
                    </div>
                    {r.nivelSuscripcion === "GRATIS" && (
                      <button
                        onClick={() =>
                          alert(
                            "🔄 Próximamente: gestión de suscripciones y pagos",
                          )
                        }
                        className="mt-2 w-full text-xs py-1.5 rounded-lg bg-forest-600 text-cream-50 hover:bg-forest-700 font-medium transition"
                      >
                        ⬆️ Upgrade a PRO
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-stone-800">{value || "—"}</p>
    </div>
  );
}
