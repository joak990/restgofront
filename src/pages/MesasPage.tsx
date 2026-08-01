// filepath: src/pages/MesasPage.tsx
import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { duenosApi, type Mesa } from "../api/duenos";

interface MesaForm {
  nombre: string;
  capacidad: number;
}

const emptyForm: MesaForm = {
  nombre: "",
  capacidad: 4,
};

/**
 * Ícono SVG dinámico según la capacidad: silla para 1-2, mesa para 4,
 * mesa grande para muchos. Mantiene coherencia sin emojis.
 */
function CapacityIcon({ capacidad }: { capacidad: number }) {
  if (capacidad <= 2) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
        />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8.25a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 8.25v7.5A2.25 2.25 0 0 1 18.75 18H5.25A2.25 2.25 0 0 1 3 15.75v-7.5ZM3 12h18"
      />
    </svg>
  );
}

export default function MesasPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Mesa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Mesa | null>(null);
  const [form, setForm] = useState<MesaForm>({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    if (!id) return;
    try {
      setData(await duenosApi.getMesas(id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(mesa: Mesa) {
    setEditing(mesa);
    setForm({
      nombre: mesa.nombre ?? "",
      capacidad: mesa.capacidad,
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setFormError(null);
    setSubmitting(true);
    try {
      if (form.capacidad < 1 || form.capacidad > 50) {
        setFormError("La capacidad debe ser entre 1 y 50.");
        setSubmitting(false);
        return;
      }
      if (editing) {
        await duenosApi.updateMesa(id, editing.id, form);
      } else {
        await duenosApi.createMesa(id, form);
      }
      closeForm();
      await refresh();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActivo(mesa: Mesa) {
    if (!id) return;
    try {
      await duenosApi.updateMesa(id, mesa.id, { activo: !mesa.activo });
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function handleDelete(mesaId: string) {
    if (!id) return;
    if (!confirm("¿Eliminar mesa? Esta acción no se puede deshacer.")) return;
    try {
      await duenosApi.deleteMesa(id, mesaId);
      await refresh();
    } catch (err) {
      alert((err as Error).message);
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
        Cargando…
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
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
                d="M3 8.25a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 8.25v7.5A2.25 2.25 0 0 1 18.75 18H5.25A2.25 2.25 0 0 1 3 15.75v-7.5ZM3 12h18"
              />
            </svg>
          </span>
          Mesas
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-500">
            {data.length} {data.length === 1 ? "mesa" : "mesas"} · capacidad
            total{" "}
            <strong className="text-stone-700">
              {data.reduce((acc, m) => acc + m.capacidad, 0)}
            </strong>{" "}
            personas
          </span>
          <button onClick={openCreate} className="btn-primary text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Crear mesa
          </button>
        </div>
      </div>

      {/* Modal Crear / Editar mesa */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !submitting && closeForm()}
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
                    {editing ? "Editar" : "Cargar nuevo"}
                  </div>
                  <h2 className="text-xl font-bold leading-tight">
                    {editing ? "Editar mesa" : "Nueva mesa"}
                  </h2>
                  <p className="text-sm text-cream-200/80 mt-0.5">
                    {editing
                      ? "Modificá el nombre o la capacidad"
                      : "Definí el nombre y la capacidad"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-cream-200/80 hover:text-white hover:bg-white/10 text-2xl leading-none w-9 h-9 flex items-center justify-center rounded-full transition"
                  aria-label="Cerrar"
                  disabled={submitting}
                >
                  ×
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
                {/* SECCIÓN: Identidad */}
                <section>
                  <SectionTitle icon="identidad">Identidad</SectionTitle>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Nombre <span className="text-stone-400">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, nombre: e.target.value }))
                      }
                      className="input"
                      placeholder="Ej: Mesa 1, VIP, Barra"
                    />
                    <p className="text-xs text-stone-500 mt-1">
                      Si lo dejás vacío, se mostrará la capacidad como nombre.
                    </p>
                  </div>
                </section>

                {/* SECCIÓN: Capacidad */}
                <section>
                  <SectionTitle icon="capacidad">Capacidad</SectionTitle>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Personas <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={form.capacidad}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              capacidad: Number(e.target.value),
                            }))
                          }
                          className="input w-32"
                          min={1}
                          max={50}
                          required
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-100 text-stone-700">
                          <span className="text-forest-600">
                            <CapacityIcon capacidad={form.capacidad} />
                          </span>
                          <span className="text-sm">
                            {form.capacidad}{" "}
                            {form.capacidad === 1 ? "persona" : "personas"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Mínimo 1, máximo 50.
                      </p>
                    </div>
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
                  onClick={closeForm}
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
                      Guardando…
                    </>
                  ) : editing ? (
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
                      Crear mesa
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.length === 0 && !showForm ? (
        <div className="card p-10 text-center bg-cream-50/40 border-dashed border-cream-300">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cream-100 flex items-center justify-center text-stone-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8.25a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 8.25v7.5A2.25 2.25 0 0 1 18.75 18H5.25A2.25 2.25 0 0 1 3 15.75v-7.5ZM3 12h18"
              />
            </svg>
          </div>
          <p className="text-stone-700 font-medium">Sin mesas cargadas</p>
          <p className="text-xs text-stone-500 mt-1">
            Creá mesas para que los clientes puedan reservar.
          </p>
          <button onClick={openCreate} className="btn-primary mt-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Crear primera mesa
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...data]
            .sort((a, b) => {
              const na = a.nombre?.match(/\d+/)?.[0];
              const nb = b.nombre?.match(/\d+/)?.[0];
              if (na && nb) return parseInt(na, 10) - parseInt(nb, 10);
              return (a.nombre ?? "").localeCompare(b.nombre ?? "");
            })
            .map((m) => (
              <div
                key={m.id}
                className={`card p-4 transition hover:shadow-md ${
                  m.activo ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-forest-600">
                    <CapacityIcon capacidad={m.capacidad} />
                  </div>
                  <button
                    onClick={() => handleToggleActivo(m)}
                    className={`text-xs px-2 py-1 rounded transition ${
                      m.activo
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                    }`}
                    title={m.activo ? "Desactivar mesa" : "Activar mesa"}
                  >
                    {m.activo ? "Activa" : "Inactiva"}
                  </button>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-stone-500 uppercase tracking-wide">
                    Mesa
                  </div>
                  <div className="text-2xl font-bold text-stone-900">
                    {m.nombre || `#${m.capacidad}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="text-forest-600">
                    <CapacityIcon capacidad={m.capacidad} />
                  </span>
                  <span>
                    Capacidad para{" "}
                    <strong className="text-stone-800">{m.capacidad}</strong>
                  </span>
                </div>
                <div className="flex gap-1 mt-3">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex-1 text-xs px-2 py-1.5 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-center"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="btn-danger flex-1 text-center"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Título de sección con barrita vertical verde (consistente con el
 * modal de Crear restaurante / Editar restaurante).
 */
function SectionTitle({
  icon,
  children,
}: {
  icon: "identidad" | "capacidad";
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

function SectionIcon({ kind }: { kind: "identidad" | "capacidad" }) {
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
    case "capacidad":
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
  }
}
