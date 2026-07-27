// filepath: src/pages/MesasPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { duenosApi, type Mesa } from '../api/duenos';

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

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div className="text-gray-500">Cargando...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Mesas del restaurante</h2>

      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">N°</th>
            <th className="p-3">Capacidad</th>
            <th className="p-3">Activa</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                Sin mesas cargadas
              </td>
            </tr>
          )}
          {data.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-3">{m.numero}</td>
              <td className="p-3">{m.capacidad}</td>
              <td className="p-3">{m.activo ? 'Sí' : 'No'}</td>
              <td className="p-3 text-right">
                <button
                  onClick={() => handleDelete(m.id)}
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
