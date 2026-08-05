// filepath: src/pages/RestauranteFotosPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { duenosApi, type Restaurante } from '../api/duenos';

interface FotoItem {
  url: string;
  id: string;
}

const MAX_FOTOS = 9;

export default function RestauranteFotosPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    duenosApi
      .getMisRestaurantes()
      .then((lista) => {
        if (!cancelado) {
          const r = lista.find((rest) => rest.id === id) ?? null;
          setRestaurante(r);
          if (r?.urlImagenPortada) {
            setFotos([{ url: r.urlImagenPortada, id: 'portada' }]);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function handleFotoUpload(url: string) {
    if (fotos.length >= MAX_FOTOS) {
      setMessage({ type: 'error', text: `Máximo ${MAX_FOTOS} fotos permitidas.` });
      return;
    }
    const nueva: FotoItem = { url, id: Date.now().toString() };
    const actualizadas = [...fotos, nueva];
    setFotos(actualizadas);
    await guardarFotos(actualizadas);
  }

  async function eliminarFoto(fotoId: string) {
    const actualizadas = fotos.filter((f) => f.id !== fotoId);
    setFotos(actualizadas);
    await guardarFotos(actualizadas);
  }

  async function guardarFotos(fotosActualizadas: FotoItem[]) {
    if (!id) return;
    setMessage(null);
    try {
      const urlPortada = fotosActualizadas[0]?.url ?? null;
      await duenosApi.updateRestaurante(id, { urlImagenPortada: urlPortada });
      setMessage({ type: 'success', text: 'Fotos guardadas correctamente.' });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!restaurante) {
    return <p className="text-stone-500">Restaurante no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Fotos del restaurante</h2>
          <p className="text-sm text-stone-500">
            Subí las fotos de tu restaurante. Luego podrás crear productos con sus fotos.
          </p>
        </div>
        <span className="text-sm text-stone-400">
          {fotos.length}/{MAX_FOTOS} fotos
        </span>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Grid de fotos */}
      <div className="grid grid-cols-3 gap-3">
        {fotos.map((foto) => (
          <div key={foto.id} className="relative group">
            <img
              src={foto.url}
              alt="Foto restaurante"
              className="w-full h-28 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => eliminarFoto(foto.id)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Slot para agregar foto */}
        {fotos.length < MAX_FOTOS && (
          <label className="h-28 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:border-forest-500 hover:text-forest-600 transition cursor-pointer">
            <span className="text-xl">+</span>
            <span className="text-xs mt-1">Agregar</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setMessage(null);
                try {
                  const { uploadToCloudinary } = await import('../lib/cloudinary');
                  const result = await uploadToCloudinary(file, 'restaurantes');
                  handleFotoUpload(result.secure_url);
                } catch (err) {
                  setMessage({ type: 'error', text: (err as Error).message });
                }
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-stone-400">
        Recomendación: usá fotos horizontales (16:9) para que se vean bien en la app.
      </p>
    </div>
  );
}
