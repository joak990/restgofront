// filepath: src/pages/MisRestaurantesPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { duenosApi, type Restaurante } from '../api/duenos';

export default function MisRestaurantesPage() {
  const [data, setData] = useState<Restaurante[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    duenosApi.getMisRestaurantes().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div className="text-gray-500">Cargando...</div>;
  if (data.length === 0)
    return (
      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-700">No tenés restaurantes todavía.</p>
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mis restaurantes</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((r) => (
          <Link
            key={r.id}
            to={`/restaurantes/${r.id}`}
            className="block p-4 bg-white rounded shadow hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{r.nombre}</h2>
            <p className="text-sm text-gray-600">{r.direccion}</p>
            <div className="mt-2 flex gap-2 text-xs">
              {r.verificado ? (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                  Verificado
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                  Pendiente
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded ${
                  r.activo
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {r.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
