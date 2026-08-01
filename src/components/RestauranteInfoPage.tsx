// filepath: src/components/RestauranteInfoPage.tsx
import { useEffect, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import PhoneInput, { type Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  duenosApi,
  type Restaurante,
  type UpdateRestauranteBody,
} from "../api/duenos";

const DESCRIPCION_MAX = 150;

const PRECIOS: Record<number, string> = {
  1: "$ Económico",
  2: "$$ Moderado",
  3: "$$$ Caro",
  4: "$$$$ Premium",
};

export default function RestauranteInfoPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateRestauranteBody>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadRestaurante() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const restaurantes = await duenosApi.getMisRestaurantes();
      const r = restaurantes.find((rest) => rest.id === id);
      if (r) {
        setRestaurante(r);
      } else {
        setError("Restaurante no encontrado");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRestaurante();
  }, [id]);

  function startEdit() {
    if (!restaurante) return;
    setForm({
      nombre: restaurante.nombre,
      descripcion: restaurante.descripcion ?? "",
      tipoCocina: restaurante.tipoCocina ?? "",
      direccion: restaurante.direccion,
      telefono: restaurante.telefono ?? "",
      urlInstagram: restaurante.urlInstagram ?? "",
    });
    setFormError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setFormError(null);
    setSaving(true);
    try {
      await duenosApi.updateRestaurante(id, form);
      setEditing(false);
      await loadRestaurante();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="text-stone-500 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        Cargando…
      </div>
    );

  if (error)
    return (
      <div className="card p-6 text-red-700 bg-red-50 border-red-200">
        {error}
      </div>
    );

  if (!restaurante) return null;

  // Vista de edición (modal con el mismo estilo que Crear restaurante)
  if (editing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => !saving && setEditing(false)}
        />
        <div className="relative card w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
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
                  d="M3 11.25a8.25 8.25 0 0 1 16.5 0v.75a8.25 8.25 0 0 1-16.5 0v-.75ZM12 4.5v16.5"
                />
              </svg>
            </div>
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cream-200/90 font-semibold mb-1">
                  <span className="w-1.5 h-1.5 bg-cream-200 rounded-full" />
                  Editar
                </div>
                <h2 className="text-xl font-bold leading-tight">
                  Editar restaurante
                </h2>
                <p className="text-sm text-cream-200/80 mt-0.5">
                  Actualizá la información del restaurante
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-cream-200/80 hover:text-white hover:bg-white/10 text-2xl leading-none w-9 h-9 flex items-center justify-center rounded-full transition"
                aria-label="Cerrar"
                disabled={saving}
              >
                ×
              </button>
            </div>
          </div>

          {/* Form scrolleable */}
          <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
              {/* SECCIÓN: Identidad */}
              <section>
                <SectionTitle icon="identidad">Identidad</SectionTitle>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nombre ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nombre: e.target.value }))
                      }
                      className="input"
                      placeholder="Ej: La Pepita Grill"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-stone-700">
                        Descripción
                      </label>
                      <span
                        className={`text-[11px] ${
                          (form.descripcion?.length ?? 0) > DESCRIPCION_MAX
                            ? "text-red-600 font-semibold"
                            : (form.descripcion?.length ?? 0) >=
                                DESCRIPCION_MAX - 20
                              ? "text-amber-600"
                              : "text-stone-500"
                        }`}
                      >
                        {form.descripcion?.length ?? 0} / {DESCRIPCION_MAX}
                      </span>
                    </div>
                    <textarea
                      value={form.descripcion ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          descripcion: e.target.value.slice(0, DESCRIPCION_MAX),
                        }))
                      }
                      className="input min-h-[80px] resize-y"
                      rows={3}
                      placeholder="Contá algo corto sobre tu restaurante"
                      maxLength={DESCRIPCION_MAX}
                    />
                  </div>
                </div>
              </section>

              {/* SECCIÓN: Detalles */}
              <section>
                <SectionTitle icon="detalles">Detalles</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Tipo de cocina
                    </label>
                    <input
                      type="text"
                      value={form.tipoCocina ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, tipoCocina: e.target.value }))
                      }
                      className="input"
                      placeholder="Pizza, Sushi…"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Teléfono
                    </label>
                    <PhoneInput
                      international
                      defaultCountry="AR"
                      value={(form.telefono as Value) || undefined}
                      onChange={(value) =>
                        setForm((p) => ({ ...p, telefono: value ?? "" }))
                      }
                      placeholder="11 1234-5678"
                      className="rg-phone-input"
                    />
                  </div>
                </div>
              </section>

              {/* SECCIÓN: Ubicación */}
              <section>
                <SectionTitle icon="ubicacion">Ubicación</SectionTitle>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.direccion ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, direccion: e.target.value }))
                    }
                    className="input"
                    placeholder="Av. Corrientes 1234"
                    required
                  />
                </div>
              </section>

              {/* SECCIÓN: Redes */}
              <section>
                <SectionTitle icon="redes">Redes</SectionTitle>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={form.urlInstagram ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, urlInstagram: e.target.value }))
                    }
                    className="input"
                    placeholder="@tu_restaurante"
                  />
                </div>
              </section>

              {formError && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                    />
                  </svg>
                  <span className="flex-1">{formError}</span>
                </div>
              )}
            </div>

            {/* Footer sticky */}
            <div className="px-6 py-4 border-t border-cream-200 bg-cream-50/40 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-ghost"
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando…
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
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Vista de información
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-forest-50 text-forest-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </span>
          Información del restaurante
        </h3>
        <button onClick={startEdit} className="btn-primary text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          Editar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Info card */}
        <div className="card p-5 space-y-3">
          {restaurante.descripcion && (
            <p className="text-sm text-stone-600">{restaurante.descripcion}</p>
          )}
          <div className="space-y-1.5 text-sm">
            {restaurante.direccion && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </span>
                <span>{restaurante.direccion}</span>
              </div>
            )}
            {restaurante.telefono && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                    />
                  </svg>
                </span>
                <span>{restaurante.telefono}</span>
              </div>
            )}
            {restaurante.urlInstagram && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.115 5.19c.34-1.028 1.395-1.628 2.428-1.314.55.166 1.011.527 1.349 1.014.34.488.557 1.075.557 1.687v3.198c0 .612-.217 1.2-.557 1.687-.338.487-.8.848-1.349 1.014-1.033.314-2.088-.286-2.428-1.314-.27-.81-.27-2.376 0-3.186Zm11.77 0c-.34-1.028-1.395-1.628-2.428-1.314-.55.166-1.011.527-1.349 1.014-.34.488-.557 1.075-.557 1.687v3.198c0 .612.217 1.2.557 1.687.338.487.8.848 1.349 1.014 1.033.314 2.088-.286 2.428-1.314.27-.81.27-2.376 0-3.186Z"
                    />
                  </svg>
                </span>
                <span>{restaurante.urlInstagram}</span>
              </div>
            )}
            {restaurante.ciudad && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
                    />
                  </svg>
                </span>
                <span>
                  {restaurante.ciudad.nombre}
                  {restaurante.provincia && `, ${restaurante.provincia.nombre}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats card */}
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-stone-900">Estadísticas</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-cream-100 text-center">
              <div className="text-2xl font-bold text-forest-700">
                {restaurante._count?.mesas ?? 0}
              </div>
              <div className="text-xs text-stone-500">Mesas</div>
            </div>
            <div className="p-3 rounded-lg bg-cream-100 text-center">
              <div className="text-2xl font-bold text-forest-700">
                {restaurante._count?.platos ?? 0}
              </div>
              <div className="text-xs text-stone-500">Platos</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={restaurante.verificado ? "pill-green" : "pill-amber"}
            >
              {restaurante.verificado
                ? "✓ Verificado"
                : "⏳ Pendiente verificación"}
            </span>
            <span className={restaurante.activo ? "pill-blue" : "pill-gray"}>
              {restaurante.activo ? "● Activo" : "○ Inactivo"}
            </span>
            <span className="pill-amber">
              {PRECIOS[restaurante.rangoPrecio] ?? "$$ Moderado"}
            </span>
          </div>

          {/* Accesos rápidos */}
          <div className="border-t border-stone-100 pt-3">
            <p className="text-xs text-stone-500 mb-2">Gestionar:</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="horarios"
                className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
              >
                Horarios
              </Link>
              <Link
                to="mesas"
                className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
              >
                Mesas
              </Link>
              <Link
                to="reservas"
                className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
              >
                Reservas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Título de sección con barrita vertical verde (consistente con el
 * modal de Crear restaurante).
 */
function SectionTitle({
  icon,
  children,
}: {
  icon: "identidad" | "detalles" | "ubicacion" | "redes";
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
  kind: "identidad" | "detalles" | "ubicacion" | "redes";
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
    case "identidad":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      );
    case "detalles":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6h.008v.008H6V6Z"
          />
        </svg>
      );
    case "ubicacion":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
      );
    case "redes":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.115 5.19c.34-1.028 1.395-1.628 2.428-1.314.55.166 1.011.527 1.349 1.014.34.488.557 1.075.557 1.687v3.198c0 .612-.217 1.2-.557 1.687-.338.487-.8.848-1.349 1.014-1.033.314-2.088-.286-2.428-1.314-.27-.81-.27-2.376 0-3.186Zm11.77 0c-.34-1.028-1.395-1.628-2.428-1.314-.55.166-1.011.527-1.349 1.014-.34.488-.557 1.075-.557 1.687v3.198c0 .612.217 1.2.557 1.687.338.487.8.848 1.349 1.014 1.033.314 2.088-.286 2.428-1.314.27-.81.27-2.376 0-3.186Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9.75h6m-6 3h6m-6 3h6"
          />
        </svg>
      );
  }
}
