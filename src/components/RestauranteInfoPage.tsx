// filepath: src/pages/RestauranteInfoPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { duenosApi, type Restaurante, type UpdateRestauranteBody } from '../api/duenos';

const PRECIOS: Record<number, string> = {
  1: '$ Económico',
  2: '$$ Moderado',
  3: '$$$ Caro',
  4: '$$$$ Premium',
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
      // Buscamos el restaurante en la lista del dueño
      const restaurantes = await duenosApi.getMisRestaurantes();
      const r = restaurantes.find((rest) => rest.id === id);
      if (r) {
        setRestaurante(r);
      } else {
        setError('Restaurante no encontrado');
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
      descripcion: restaurante.descripcion ?? '',
      tipoCocina: restaurante.tipoCocina ?? '',
      direccion: restaurante.direccion,
      telefono: restaurante.telefono ?? '',
      correo: restaurante.correo ?? '',
      urlInstagram: restaurante.urlInstagram ?? '',
      rangoPrecio: restaurante.rangoPrecio,
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
        Cargando...
      </div>
    );

  if (error)
    return (
      <div className="card p-6 text-red-700 bg-red-50 border-red-200">{error}</div>
    );

  if (!restaurante) return null;

  if (editing) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Editar restaurante</h3>
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              className="input min-h-[80px]"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de cocina</label>
              <input
                type="text"
                value={form.tipoCocina ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, tipoCocina: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={form.telefono ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.direccion ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Correo</label>
              <input
                type="email"
                value={form.correo ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Rango de precio</label>
              <select
                value={form.rangoPrecio ?? 2}
                onChange={(e) => setForm((p) => ({ ...p, rangoPrecio: Number(e.target.value) }))}
                className="input"
              >
                <option value={1}>$ Economico</option>
                <option value={2}>$$ Moderado</option>
                <option value={3}>$$$ Caro</option>
                <option value={4}>$$$$ Premium</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Instagram</label>
            <input
              type="text"
              value={form.urlInstagram ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, urlInstagram: e.target.value }))}
              className="input"
            />
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          📋 Información del restaurante
        </h3>
        <button onClick={startEdit} className="btn-primary text-sm">
          ✏️ Editar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Info card */}
        <div className="card p-5 space-y-3">
          <div>
            <h4 className="text-xl font-bold text-stone-900">{restaurante.nombre}</h4>
            {restaurante.tipoCocina && (
              <span className="pill-amber mt-1">{restaurante.tipoCocina}</span>
            )}
          </div>
          {restaurante.descripcion && (
            <p className="text-sm text-stone-600">{restaurante.descripcion}</p>
          )}
          <div className="space-y-1.5 text-sm">
            {restaurante.direccion && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">📍</span>
                <span>{restaurante.direccion}</span>
              </div>
            )}
            {restaurante.telefono && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">📞</span>
                <span>{restaurante.telefono}</span>
              </div>
            )}
            {restaurante.correo && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">✉️</span>
                <span>{restaurante.correo}</span>
              </div>
            )}
            {restaurante.urlInstagram && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">📸</span>
                <span>{restaurante.urlInstagram}</span>
              </div>
            )}
            {restaurante.ciudad && (
              <div className="flex gap-2 text-stone-600">
                <span className="text-stone-400">🏙️</span>
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
            <span className={restaurante.verificado ? 'pill-green' : 'pill-amber'}>
              {restaurante.verificado ? '✓ Verificado' : '⏳ Pendiente verificación'}
            </span>
            <span className={restaurante.activo ? 'pill-blue' : 'pill-gray'}>
              {restaurante.activo ? '● Activo' : '○ Inactivo'}
            </span>
            <span className="pill-amber">
              {PRECIOS[restaurante.rangoPrecio] ?? '$$ Moderado'}
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
                🕐 Horarios
              </Link>
              <Link
                to="mesas"
                className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
              >
                🪑 Mesas
              </Link>
              <Link
                to="reservas"
                className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
              >
                📅 Reservas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
