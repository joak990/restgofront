// filepath: src/pages/HorariosPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { duenosApi, type Horario } from '../api/duenos';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_EMOJI = ['🌅', '🌙', '🌙', '🌙', '🌙', '🌙', '🎉'];

interface HorarioForm {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  cerrado: boolean;
}

const emptyForm: HorarioForm = {
  diaSemana: 1,
  horaApertura: '12:00',
  horaCierre: '15:00',
  cerrado: false,
};

export default function HorariosPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Horario[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Horario | null>(null);
  const [form, setForm] = useState<HorarioForm>({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    if (!id) return;
    try {
      setData(await duenosApi.getHorarios(id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  function handleField(field: keyof HorarioForm, value: number | string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(horario: Horario) {
    setEditing(horario);
    setForm({
      diaSemana: horario.diaSemana,
      horaApertura: horario.horaApertura,
      horaCierre: horario.horaCierre,
      cerrado: horario.cerrado,
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
      if (form.horaApertura >= form.horaCierre && !form.cerrado) {
        setFormError('La hora de apertura debe ser anterior a la de cierre.');
        setSubmitting(false);
        return;
      }
      if (editing) {
        await duenosApi.updateHorario(id, editing.id, form);
      } else {
        await duenosApi.createHorario(id, form);
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

  async function handleDelete(horarioId: string) {
    if (!id) return;
    if (!confirm('¿Eliminar horario?')) return;
    try {
      await duenosApi.deleteHorario(id, horarioId);
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
        <span className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        Cargando...
      </div>
    );

  const sorted = [...data].sort(
    (a, b) => a.diaSemana - b.diaSemana || a.horaApertura.localeCompare(b.horaApertura),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <span>🕐</span> Horarios
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-500">
            {data.length} {data.length === 1 ? 'turno' : 'turnos'} configurados
          </span>
          <button onClick={openCreate} className="btn-primary text-sm">
            + Crear horario
          </button>
        </div>
      </div>

      {/* Formulario crear/editar */}
      {showForm && (
        <div className="card p-5 mb-4 border-cream-300 bg-cream-100/40">
          <h3 className="font-semibold text-stone-900 mb-3">
            {editing ? 'Editar horario' : 'Nuevo horario'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Día</label>
                <select
                  value={form.diaSemana}
                  onChange={(e) => handleField('diaSemana', Number(e.target.value))}
                  className="input"
                >
                  {DIAS.map((dia, idx) => (
                    <option key={idx} value={idx}>
                      {DIAS_EMOJI[idx]} {dia}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Apertura</label>
                <input
                  type="time"
                  value={form.horaApertura}
                  onChange={(e) => handleField('horaApertura', e.target.value)}
                  className="input"
                  disabled={form.cerrado}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Cierre</label>
                <input
                  type="time"
                  value={form.horaCierre}
                  onChange={(e) => handleField('horaCierre', e.target.value)}
                  className="input"
                  disabled={form.cerrado}
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm text-stone-700 pb-2">
                  <input
                    type="checkbox"
                    checked={form.cerrado}
                    onChange={(e) => handleField('cerrado', e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-forest-700 focus:ring-forest-700"
                  />
                  Cerrado
                </label>
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
        <div className="card p-8 text-center bg-cream-100/70 border-dashed">
          <div className="text-4xl mb-2">⏰</div>
          <p className="text-stone-700 font-medium">Sin horarios cargados</p>
          <p className="text-xs text-stone-500 mt-1">
            Creá horarios para que los clientes puedan reservar.
          </p>
          <button onClick={openCreate} className="btn-primary mt-3 text-sm">
            + Crear primer horario
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-cream-100 to-cream-200 text-left text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Día</th>
                <th className="px-4 py-3 font-semibold">Apertura</th>
                <th className="px-4 py-3 font-semibold">Cierre</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold w-32 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {sorted.map((h) => (
                <tr key={h.id} className="hover:bg-cream-100/60 transition">
                  <td className="px-4 py-3 font-medium text-stone-800">
                    <span className="mr-2">{DIAS_EMOJI[h.diaSemana]}</span>
                    {DIAS[h.diaSemana]}
                  </td>
                  <td className="px-4 py-3 text-stone-700 font-mono">{h.horaApertura}</td>
                  <td className="px-4 py-3 text-stone-700 font-mono">{h.horaCierre}</td>
                  <td className="px-4 py-3">
                    {h.cerrado ? (
                      <span className="pill-gray">Cerrado</span>
                    ) : (
                      <span className="pill-green">● Abierto</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEdit(h)}
                        className="text-xs px-2 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDelete(h.id)} className="btn-danger">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
