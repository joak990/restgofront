// filepath: src/pages/MisRestaurantesPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { duenosApi, type Restaurante } from '../api/duenos';

const FOOD_EMOJI = ['🍕', '🍔', '🍣', '🍝', '🥗', '🌮', '🍱', '🥩', '🍜', '🥘', '🍰', '☕'];

function emojiFor(name: string): string {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FOOD_EMOJI[hash % FOOD_EMOJI.length];
}

export default function MisRestaurantesPage() {
  const [data, setData] = useState<Restaurante[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    duenosApi.getMisRestaurantes().then(setData).catch((e) => setError(e.message));
  }, []);

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
  if (data.length === 0)
    return (
      <div className="card p-10 text-center">
        <div className="text-5xl mb-3">🍽️</div>
        <p className="text-stone-700 font-medium">No tenés restaurantes todavía.</p>
        <p className="text-sm text-stone-500 mt-1">
          Creá uno desde el backend o pedí a soporte que te habilite.
        </p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Mis restaurantes</h1>
        <p className="text-stone-600 mt-1">
          {data.length} {data.length === 1 ? 'restaurante' : 'restaurantes'} en tu cuenta
        </p>
      </div>
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
    </div>
  );
}
