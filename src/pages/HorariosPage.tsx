// filepath: src/pages/HorariosPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { duenosApi, type Horario } from '../api/duenos';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div className="text-gray-500">Cargando...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Horarios del restaurante</h2>

      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Día</th>
            <th className="p-3">Apertura</th>
            <th className="p-3">Cierre</th>
            <th className="p-3">Cerrado</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                Sin horarios cargados
              </td>
            </tr>
          )}
          {data
            .sort((a, b) => a.diaSemana - b.diaSemana || a.horaApertura.localeCompare(b.horaApertura))
            .map((h) => (
              <tr key={h.id} className="border-t">
                <td className="p-3">{DIAS[h.diaSemana]}</td>
                <td className="p-3">{h.horaApertura}</td>
                <td className="p-3">{h.horaCierre}</td>
                <td className="p-3">{h.cerrado ? 'Sí' : 'No'}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
