// filepath: src/pages/HomeClientePage.tsx
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getProvincias,
  getCiudades,
  getRestaurantesByCiudad,
  matchProvincia,
  matchCiudad,
  type Provincia,
  type Ciudad,
  type Restaurante,
} from "../api/restaurantes";

// ─── Mock data (reemplazará con datos reales del backend) ────────────────
const CATEGORIES = [
  { id: "hamburguesas", emoji: "🍔", label: "Hamburguesas" },
  { id: "bodegones", emoji: "🍝", label: "Bodegones" },
  { id: "pizzerias", emoji: "🍕", label: "Pizzerías" },
  { id: "sushi", emoji: "🍣", label: "Sushi" },
  { id: "cafe", emoji: "☕", label: "Café" },
  { id: "parrilla", emoji: "🥩", label: "Parrilla" },
];

const OFERTAS_HOT = [
  {
    id: "o1",
    nombre: "2x1 en Ceviche",
    emoji: "🐟",
    descuento: "2x1",
    restaurante: "El Pacifico",
    imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400",
  },
  {
    id: "o2",
    nombre: "30% OFF en Pizzas",
    emoji: "🍕",
    descuento: "30%",
    restaurante: "Mozzarella",
    imagen: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  },
  {
    id: "o3",
    nombre: "Café + medialuna gratis",
    emoji: "☕",
    descuento: "Combo",
    restaurante: "Café Martínez",
    imagen: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
  },
  {
    id: "o4",
    nombre: "20% OFF en Parrilla",
    emoji: "🥩",
    descuento: "20%",
    restaurante: "Don Julio",
    imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
  },
];

export default function HomeClientePage() {
  const navigate = useNavigate();
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ubicacionLabel, setUbicacionLabel] = useState("Buenos Aires");
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loadingRest, setLoadingRest] = useState(false);
  const [emptyRest, setEmptyRest] = useState(false);

  const loadRestaurantes = useCallback(async (ciudadId: string) => {
    setLoadingRest(true);
    setEmptyRest(false);
    try {
      const page = await getRestaurantesByCiudad(ciudadId, 1, 20);
      setRestaurantes(page.data);
      setEmptyRest(page.data.length === 0);
    } catch {
      setRestaurantes([]);
      setEmptyRest(true);
    } finally {
      setLoadingRest(false);
    }
  }, []);

  const loadRestaurantesForProvincia = useCallback(async (p: Provincia) => {
    try {
      const ciudades = await getCiudades(p.id);
      if (ciudades.length > 0) await loadRestaurantes(ciudades[0].id);
    } catch {}
  }, [loadRestaurantes]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ps = await getProvincias();
        if (!mounted) return;
        setProvincias(ps);
        if (ps.length > 0) await loadRestaurantesForProvincia(ps[0]);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [loadRestaurantesForProvincia]);

  function handleRestauranteClick(id: string) {
    navigate(`/restaurante/${id}`);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-cream-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Ubicación */}
          <button className="flex items-center gap-1.5 text-stone-600 hover:text-forest-600 transition-colors">
            <span className="w-2 h-2 rounded-full bg-forest-500" />
            <span className="text-sm font-medium">{ubicacionLabel}</span>
            <span className="text-stone-400 text-xs">⌄</span>
          </button>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-lg hover:bg-cream-200 transition-colors">
              🔔
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </button>
            <Link
              to="/cliente/perfil"
              className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-lg hover:bg-forest-200 transition-colors"
            >
              👤
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-10 space-y-8">
        {/* ─── Search ──────────────────────────────────────────────── */}
        <div className="mt-4">
          <Link
            to="/cliente/buscar"
            className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <span className="text-lg">🔍</span>
            <span className="text-stone-400 text-sm">Busca locales y productos</span>
          </Link>
        </div>

        {/* ─── Banner Match ────────────────────────────────────────── */}
        <Link
          to="/cliente/match"
          className="block bg-gradient-to-r from-forest-600 to-forest-700 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-extrabold leading-tight">
                Hacé match con tu próximo restaurante
              </h2>
              <p className="mt-1 text-forest-100 text-sm">
                Encontrá el lugar ideal para tu próxima salida.
              </p>
            </div>
            <div className="ml-4 bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm font-semibold">
              Descubrir →
            </div>
          </div>
        </Link>

        {/* ─── Categorías ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-stone-800 mb-3">Categorías</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-2xl shadow-sm">
                  {cat.emoji}
                </div>
                <span className="text-xs text-stone-600 font-medium whitespace-nowrap">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ─── Ofertas Hot ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-stone-800">Ofertas Hot 🔥</h2>
            <button className="text-sm text-forest-600 font-semibold hover:underline">
              Ver más →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {OFERTAS_HOT.map((oferta) => (
              <div
                key={oferta.id}
                className="flex-shrink-0 w-44 bg-white rounded-2xl shadow-md overflow-hidden border border-cream-200"
              >
                <div className="relative h-28">
                  <img
                    src={oferta.imagen}
                    alt={oferta.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {oferta.descuento}
                  </div>
                  <button className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-sm hover:bg-white transition-colors">
                    ♡
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-stone-800 truncate">
                    {oferta.nombre}
                  </p>
                  <p className="text-xs text-stone-500">{oferta.restaurante}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Restaurantes ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-stone-800">⭐ Destacados</h2>
          </div>

          {loadingRest && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingRest && emptyRest && (
            <div className="text-center py-12 text-stone-500">
              <p className="text-4xl mb-2">🍽️</p>
              <p>No hay restaurantes disponibles en esta zona.</p>
            </div>
          )}

          {!loadingRest && !emptyRest && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {restaurantes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRestauranteClick(r.id)}
                  className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md overflow-hidden border border-cream-200 hover:shadow-lg transition-shadow text-left"
                >
                  <div className="h-36 bg-cream-100 relative">
                    {r.urlImagenPortada ? (
                      <img
                        src={r.urlImagenPortada}
                        alt={r.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )}
                    {r.verificado && (
                      <div className="absolute top-2 left-2 bg-forest-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✓ Verificado
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-stone-800 truncate">
                      {r.nombre}
                    </h3>
                    <p className="text-xs text-stone-500 truncate">
                      {r.tipoCocina || "Comida"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-stone-600">
                        {r.ciudad?.nombre}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs font-semibold text-forest-600">
                        ${r.precioMin?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
