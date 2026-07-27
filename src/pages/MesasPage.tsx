// filepath: src/pages/MesasPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { duenosApi, type Mesa } from '../api/duenos';

const CAPACITY_EMOJI = ['🪑', '👤', '👥', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👧‍👦‍👦'];

export default function MesasPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Mesa[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function handleDelete(mesaId: string) {
    if (!id) return;
    if (!confirm('¿Eliminar mesa?')) return;
    await duenosApi.deleteMesa(id, mesaId);
    refresh();
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
        <span className="text-sm text-stone-500">
          {data.length} {data.length === 1 ? 'mesa' : 'mesas'} · capacidad total{' '}
          <strong className="text-stone-700">
            {data.reduce((acc, m) => acc + m.capacidad, 0)}
          </strong>{' '}
          personas
        </span>
      </div>

      {data.length === 0 ? (
        <div className="card p-8 text-center bg-orange-50/50 border-dashed">
          <div className="text-4xl mb-2">🪑</div>
          <p className="text-stone-700 font-medium">Sin mesas cargadas</p>
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
                {m.activo ? (
                  <span className="pill-green">Activa</span>
                ) : (
                  <span className="pill-gray">Inactiva</span>
                )}
              </div>
              <div className="mb-2">
                <div className="text-xs text-stone-500 uppercase tracking-wide">
                  Mesa
                </div>
                <div className="text-2xl font-bold text-stone-900">#{m.numero}</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <span>{CAPACITY_EMOJI[Math.min(m.capacidad, CAPACITY_EMOJI.length - 1)]}</span>
                <span>
                  Capacidad para{' '}
                  <strong className="text-stone-800">{m.capacidad}</strong>
                </span>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="btn-danger w-full mt-3 justify-center"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
