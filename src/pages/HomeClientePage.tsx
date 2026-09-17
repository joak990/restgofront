// filepath: src/pages/HomeClientePage.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getProvincias,
  getCiudades,
  getRestaurantesByCiudad,
  type Provincia,
  type Ciudad,
  type Restaurante,
} from "../api/restaurantes";
import { authApi } from "../api/auth";

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
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loadingRest, setLoadingRest] = useState(false);
  const [emptyRest, setEmptyRest] = useState(false);

  const isLoggedIn = !!localStorage.getItem("restaurantgo_token");

  const handleLogout = async () => {
    await authApi.logout();
    localStorage.removeItem("restaurantgo_token");
    setShowUserDropdown(false);
    navigate("/login");
  };

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

  // Load provinces on mount
  useEffect(() => {
    let mounted = true;
    setLoadingProvincias(true);
    getProvincias()
      .then((ps) => {
        if (!mounted) return;
        setProvincias(ps);
        // Auto-select Buenos Aires (provincia con nombre que contenga "Buenos Aires")
        const bsas = ps.find((p) =>
          p.nombre.toLowerCase().includes("buenos aires")
        );
        return bsas || ps[0];
      })
      .then((provincia) => {
        if (!provincia) return;
        return getCiudades(provincia.id);
      })
      .then((cs) => {
        if (!mounted || !cs || cs.length === 0) return;
        setCiudades(cs);
        const primera = cs[0];
        setSelectedCiudad(primera);
        loadRestaurantes(primera.id);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingProvincias(false);
      });
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleRestauranteClick(id: string) {
    navigate(`/restaurante/${id}`);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-cream-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Ubicación con dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLocationDropdown((v) => !v)}
              className="flex items-center gap-1.5 text-stone-600 hover:text-forest-600 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-forest-500" />
              <span className="text-sm font-medium">
                {selectedCiudad?.nombre || "Seleccionar ciudad"}
              </span>
              <span className="text-stone-400 text-xs">⌄</span>
            </button>

            {showLocationDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-cream-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-cream-100">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                    Provincia
                  </p>
                </div>
                {loadingProvincias ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    {provincias.map((prov) => (
                      <div key={prov.id}>
                        <button
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-cream-50 transition-colors"
                          onClick={async () => {
                            setLoadingCiudades(true);
                            try {
                              const cs = await getCiudades(prov.id);
                              setCiudades(cs);
                              if (cs.length > 0) {
                                setSelectedCiudad(cs[0]);
                                loadRestaurantes(cs[0].id);
                              }
                            } finally {
                              setLoadingCiudades(false);
                            }
                          }}
                        >
                          {prov.nombre}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {ciudades.length > 0 && (
                  <>
                    <div className="p-3 border-t border-cream-100">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        Ciudad
                      </p>
                    </div>
                    {loadingCiudades ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto pb-2">
                        {ciudades.map((city) => (
                          <button
                            key={city.id}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              selectedCiudad?.id === city.id
                                ? "bg-forest-50 text-forest-700 font-semibold"
                                : "text-stone-600 hover:bg-cream-50"
                            }`}
                            onClick={() => {
                              setSelectedCiudad(city);
                              loadRestaurantes(city.id);
                              setShowLocationDropdown(false);
                            }}
                          >
                            {city.nombre}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-lg hover:bg-cream-200 transition-colors">
              🔔
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </button>
            {/* User dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown((v) => !v)}
                className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-lg hover:bg-forest-200 transition-colors"
              >
                {isLoggedIn ? "👤" : "🔓"}
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-cream-200 z-50 overflow-hidden">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/cliente/perfil"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-stone-700 hover:bg-cream-50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        👤 Mi perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-cream-50 transition-colors"
                      >
                        🚪 Salir
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-stone-700 hover:bg-cream-50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        🔑 Iniciar sesión
                      </Link>
                      <Link
                        to="/register/cliente"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-stone-700 hover:bg-cream-50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        ✨ Crear cuenta
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
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
