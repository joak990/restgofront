// filepath: src/pages/HorariosPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { duenosApi, type Horario } from '../api/duenos';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_EMOJI = ['🌅', '🌙', '🌙', '🌙', '🌙', '🌙', '🎉'];

export default function HorariosPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Horario[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function handleDelete(horarioId: string) {
    if (!id) return;
    if (!confirm('¿Eliminar horario?')) return;
    await duenosApi.deleteHorario(id, horarioId);
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

  const sorted = [...data].sort(
    (a, b) => a.diaSemana - b.diaSemana || a.horaApertura.localeCompare(b.horaApertura),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <span>🕐</span> Horarios
        </h2>
        <span className="text-sm text-stone-500">
          {data.length} {data.length === 1 ? 'turno' : 'turnos'} configurados
        </span>
      </div>

      {data.length === 0 ? (
        <div className="card p-8 text-center bg-orange-50/50 border-dashed">
          <div className="text-4xl mb-2">⏰</div>
          <p className="text-stone-700 font-medium">Sin horarios cargados</p>
          <p className="text-xs text-stone-500 mt-1">
            Creá horarios desde el endpoint de dueños para empezar.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-orange-50 to-amber-50 text-left text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Día</th>
                <th className="px-4 py-3 font-semibold">Apertura</th>
                <th className="px-4 py-3 font-semibold">Cierre</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold w-24 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {sorted.map((h) => (
                <tr key={h.id} className="hover:bg-orange-50/40 transition">
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
                    <button onClick={() => handleDelete(h.id)} className="btn-danger">
                      Eliminar
                    </button>
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
