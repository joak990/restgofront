// filepath: src/pages/MisRestaurantesPage.tsx
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from "react-router-dom";import PhoneInput, { type Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';import {
  duenosApi,
  type Restaurante,
  type Provincia,
  type Ciudad,
  type CreateRestauranteBody,
} from "../api/duenos";

const FOOD_EMOJI = [
  "🍕",
  "🍔",
  "🍣",
  "🍝",
  "🥗",
  "🌮",
  "🍱",
  "🥩",
  "🍜",
  "🥘",
  "🍰",
  "☕",
];

function emojiFor(name: string): string {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FOOD_EMOJI[hash % FOOD_EMOJI.length];
}

const DESCRIPCION_MAX = 150;

const initialForm: CreateRestauranteBody = {
  nombre: "",
  descripcion: "",
  tipoCocina: "",
  direccion: "",
  provinciaId: "",
  ciudadId: "",
  codigoPostal: "",
  telefono: "",
  urlInstagram: "",
};

export default function MisRestaurantesPage() {
  const [data, setData] = useState<Restaurante[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState<CreateRestauranteBody>({ ...initialForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Provincias / Ciudades
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);

  const refresh = async () => {
    setError(null);
    try {
      setData(await duenosApi.getMisRestaurantes());
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Cargar provincias cuando se abre el modal
  useEffect(() => {
    if (showModal && provincias.length === 0) {
      duenosApi
        .getProvincias()
        .then(setProvincias)
        .catch(() => {});
    }
  }, [showModal, provincias.length]);

  // Cargar ciudades cuando cambia provincia
  useEffect(() => {
    if (form.provinciaId) {
      duenosApi
        .getCiudades(form.provinciaId)
        .then(setCiudades)
        .catch(() => setCiudades([]));
    } else {
      setCiudades([]);
    }
    // Resetear ciudad al cambiar provincia
    setForm((prev) => ({ ...prev, ciudadId: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.provinciaId]);

  function handleField(
    field: keyof CreateRestauranteBody,
    value: string | number,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await duenosApi.createRestaurante(form);
      setShowModal(false);
      setForm({ ...initialForm });
      setCiudades([]);
      await refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message || (err as Error).message;
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (error)
    return (
      <div className="card p-6 text-red-700 bg-red-50 border-red-200">
        {error}
      </div>
    );
  if (!data)
    return (
      <div className="text-stone-500 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        Cargando...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">
            Mis restaurantes
          </h1>
          <p className="text-stone-600 mt-1">
            {data.length} {data.length === 1 ? "restaurante" : "restaurantes"}{" "}
            en tu cuenta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Nuevo restaurante
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-stone-700 font-medium">
            No tenés restaurantes todavía.
          </p>
          <p className="text-sm text-stone-500 mt-1">
            Creá tu primer restaurante para empezar a gestionarlo.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary mt-4"
          >
            + Crear restaurante
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <div
              key={r.id}
              className="card hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <Link to={`/dueno/restaurantes/${r.id}`} className="block">
                <div className="h-32 bg-gradient-to-br from-forest-500 via-forest-600 to-forest-800 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  {emojiFor(r.nombre)}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg text-stone-900">
                    {r.nombre}
                  </h2>
                  {r.direccion && (
                    <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">
                      📍 {r.direccion}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.verificado ? (
                      <span className="pill-green">✓ Verificado</span>
                    ) : (
                      <span className="pill-amber">⏳ Pendiente</span>
                    )}
                    <span className={r.activo ? "pill-blue" : "pill-gray"}>
                      {r.activo ? "● Activo" : "○ Inactivo"}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <Link
                  to={`/dueno/restaurantes/${r.id}/vista-mesa`}
                  className="btn-ghost text-xs w-full inline-flex items-center justify-center gap-2 py-2"
                  title="Abrir vista de mesa"
                >
                  Abrir vista de mesa
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Restaurante */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
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
                    Cargar nuevo
                  </div>
                  <h2 className="text-xl font-bold leading-tight">
                    Nuevo restaurante
                  </h2>
                  <p className="text-sm text-cream-200/80 mt-0.5">
                    Completá los datos básicos para empezar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormError(null);
                  }}
                  className="text-cream-200/80 hover:text-white hover:bg-white/10 text-2xl leading-none w-9 h-9 flex items-center justify-center rounded-full transition"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Form scrolleable */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
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
                        value={form.nombre}
                        onChange={(e) => handleField("nombre", e.target.value)}
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
                              : (form.descripcion?.length ?? 0) >
                                  DESCRIPCION_MAX - 20
                                ? "text-amber-600"
                                : "text-stone-500"
                          }`}
                        >
                          {form.descripcion?.length ?? 0} / {DESCRIPCION_MAX}
                        </span>
                      </div>
                      <textarea
                        value={form.descripcion}
                        onChange={(e) =>
                          handleField(
                            "descripcion",
                            e.target.value.slice(0, DESCRIPCION_MAX),
                          )
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
                        value={form.tipoCocina}
                        onChange={(e) =>
                          handleField("tipoCocina", e.target.value)
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
                          handleField("telefono", value ?? "")
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
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.direccion}
                        onChange={(e) => handleField("direccion", e.target.value)}
                        className="input"
                        placeholder="Av. Corrientes 1234"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          Provincia <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.provinciaId}
                          onChange={(e) =>
                            handleField("provinciaId", e.target.value)
                          }
                          className="input"
                          required
                        >
                          <option value="">Seleccionar…</option>
                          {provincias.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          Ciudad <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.ciudadId}
                          onChange={(e) => handleField("ciudadId", e.target.value)}
                          className="input"
                          required
                          disabled={!form.provinciaId}
                        >
                          <option value="">Seleccionar…</option>
                          {ciudades.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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
                      value={form.urlInstagram}
                      onChange={(e) =>
                        handleField("urlInstagram", e.target.value)
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
                  onClick={() => {
                    setShowModal(false);
                    setFormError(null);
                  }}
                  className="btn-ghost"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
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
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Crear restaurante
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
 * modal de verificación de admin). El ícono es un SVG en lugar de
 * un emoji para mantener la coherencia visual.
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

function SectionIcon({ kind }: { kind: "identidad" | "detalles" | "ubicacion" | "redes" }) {
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
