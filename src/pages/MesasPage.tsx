// filepath: src/pages/MesasPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { duenosApi, type Mesa } from '../api/duenos';

const CAPACITY_EMOJI = ['🪑', '👤', '👥', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👧‍👦‍👦'];

interface MesaForm {
  nombre: string;
  capacidad: number;
}

const emptyForm: MesaForm = {
  nombre: '',
  capacidad: 4,
};

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
      nombre: mesa.nombre ?? '',
      capacidad: mesa.capacidad,
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setFormError(null);
    setSubmitting(true);
    try {
      if (form.capacidad < 1 || form.capacidad > 50) {
        setFormError('La capacidad debe ser entre 1 y 50.');
        setSubmitting(false);
        return;
      }
      if (editing) {
        await duenosApi.updateMesa(id, editing.id, form);
      } else {
        await duenosApi.createMesa(id, form);
      }
      setShowForm(false);
      setEditing(null);
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
    if (!confirm('¿Eliminar mesa? Esta acción no se puede deshacer.')) return;
    try {
      await duenosApi.deleteMesa(id, mesaId);
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  if (error)
    return (
      <div className="card p-6 text-red-700 bg-red-50 border-red-200">{error}</div>
    );
  if (!data)
    return (
      <div className="text-stone-500 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        Cargando...
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <span>🪑</span> Mesas
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-500">
            {data.length} {data.length === 1 ? 'mesa' : 'mesas'} · capacidad total{' '}
            <strong className="text-stone-700">
              {data.reduce((acc, m) => acc + m.capacidad, 0)}
            </strong>{' '}
            personas
          </span>
          <button onClick={openCreate} className="btn-primary text-sm">
            + Crear mesa
          </button>
        </div>
      </div>

      {/* Formulario crear/editar */}
      {showForm && (
        <div className="card p-5 mb-4 border-orange-200 bg-orange-50/30">
          <h3 className="font-semibold text-stone-900 mb-3">
            {editing ? 'Editar mesa' : 'Nueva mesa'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  className="input"
                  placeholder="Ej: Mesa 1, VIP"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Capacidad (1-50) *
                </label>
                <input
                  type="number"
                  value={form.capacidad}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, capacidad: Number(e.target.value) }))
                  }
                  className="input"
                  min={1}
                  max={50}
                  required
                />
              </div>
              <div className="flex items-end">
                <span className="text-sm text-stone-600">
                  {CAPACITY_EMOJI[Math.min(form.capacidad, CAPACITY_EMOJI.length - 1)]}{' '}
                  {form.capacidad} persona{form.capacidad !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {formError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {formError}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button type="submit" disabled={submitting} className="btn-primary text-sm">
                {submitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setFormError(null);
                }}
                className="btn-ghost text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {data.length === 0 && !showForm ? (
        <div className="card p-8 text-center bg-orange-50/50 border-dashed">
          <div className="text-4xl mb-2">🪑</div>
          <p className="text-stone-700 font-medium">Sin mesas cargadas</p>
          <p className="text-xs text-stone-500 mt-1">
            Creá mesas para que los clientes puedan reservar.
          </p>
          <button onClick={openCreate} className="btn-primary mt-3 text-sm">
            + Crear primera mesa
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.map((m) => (
            <div
              key={m.id}
              className={`card p-4 transition hover:shadow-md ${
                m.activo ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-xl">
                  🍽️
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActivo(m)}
                    className={`text-xs px-2 py-1 rounded transition ${
                      m.activo
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                    title={m.activo ? 'Desactivar mesa' : 'Activar mesa'}
                  >
                    {m.activo ? 'Activa' : 'Inactiva'}
                  </button>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-xs text-stone-500 uppercase tracking-wide">Mesa</div>
                <div className="text-2xl font-bold text-stone-900">
                  {m.nombre || `#${m.capacidad}`}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <span>{CAPACITY_EMOJI[Math.min(m.capacidad, CAPACITY_EMOJI.length - 1)]}</span>
                <span>
                  Capacidad para{' '}
                  <strong className="text-stone-800">{m.capacidad}</strong>
                </span>
              </div>
              <div className="flex gap-1 mt-3">
                <button
                  onClick={() => openEdit(m)}
                  className="flex-1 text-xs px-2 py-1.5 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 justify-center"
                >
                  Editar
                </button>
                <button onClick={() => handleDelete(m.id)} className="btn-danger flex-1 justify-center">
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
