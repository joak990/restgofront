// filepath: src/pages/MisRestaurantesPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  duenosApi,
  type Restaurante,
  type Provincia,
  type Ciudad,
  type CreateRestauranteBody,
} from '../api/duenos';

const FOOD_EMOJI = ['🍕', '🍔', '🍣', '🍝', '🥗', '🌮', '🍱', '🥩', '🍜', '🥘', '🍰', '☕'];

function emojiFor(name: string): string {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FOOD_EMOJI[hash % FOOD_EMOJI.length];
}

const initialForm: CreateRestauranteBody = {
  nombre: '',
  descripcion: '',
  tipoCocina: '',
  direccion: '',
  provinciaId: '',
  ciudadId: '',
  codigoPostal: '',
  telefono: '',
  correo: '',
  urlInstagram: '',
  rangoPrecio: 2,
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
      duenosApi.getProvincias().then(setProvincias).catch(() => {});
    }
  }, [showModal, provincias.length]);

  // Cargar ciudades cuando cambia provincia
  useEffect(() => {
    if (form.provinciaId) {
      duenosApi.getCiudades(form.provinciaId).then(setCiudades).catch(() => setCiudades([]));
    } else {
      setCiudades([]);
    }
    // Resetear ciudad al cambiar provincia
    setForm((prev) => ({ ...prev, ciudadId: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.provinciaId]);

  function handleField(field: keyof CreateRestauranteBody, value: string | number) {
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Mis restaurantes</h1>
          <p className="text-stone-600 mt-1">
            {data.length} {data.length === 1 ? 'restaurante' : 'restaurantes'} en tu cuenta
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Nuevo restaurante
        </button>
      </div>

      {data.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-stone-700 font-medium">No tenés restaurantes todavía.</p>
          <p className="text-sm text-stone-500 mt-1">
            Creá tu primer restaurante para empezar a gestionarlo.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            + Crear restaurante
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <Link
              key={r.id}
              to={`/dueno/restaurantes/${r.id}`}
              className="card hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="h-32 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                {emojiFor(r.nombre)}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg text-stone-900">{r.nombre}</h2>
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
                  <span className={r.activo ? 'pill-blue' : 'pill-gray'}>
                    {r.activo ? '● Activo' : '○ Inactivo'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Crear Restaurante */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span>🍽️</span> Nuevo restaurante
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleField('nombre', e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => handleField('descripcion', e.target.value)}
                  className="input min-h-[80px]"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Tipo de cocina
                  </label>
                  <input
                    type="text"
                    value={form.tipoCocina}
                    onChange={(e) => handleField('tipoCocina', e.target.value)}
                    className="input"
                    placeholder="Ej: Pizza, Sushi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => handleField('telefono', e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => handleField('direccion', e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Provincia *
                  </label>
                  <select
                    value={form.provinciaId}
                    onChange={(e) => handleField('provinciaId', e.target.value)}
                    className="input"
                    required
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
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Ciudad *
                  </label>
                  <select
                    value={form.ciudadId}
                    onChange={(e) => handleField('ciudadId', e.target.value)}
                    className="input"
                    required
                    disabled={!form.provinciaId}
                  >
                    <option value="">Seleccionar...</option>
                    {ciudades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={form.correo}
                    onChange={(e) => handleField('correo', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Rango de precio
                  </label>
                  <select
                    value={form.rangoPrecio}
                    onChange={(e) => handleField('rangoPrecio', Number(e.target.value))}
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={form.urlInstagram}
                  onChange={(e) => handleField('urlInstagram', e.target.value)}
                  className="input"
                  placeholder="@tu_restaurante"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear restaurante'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormError(null);
                  }}
                  className="btn-ghost"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
