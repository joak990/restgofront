// filepath: src/pages/CartaPage.tsx
// Carta por restaurante.
//
// • Toma el `:id` desde la URL (igual que VistaMesaPage).
// • Carga los restaurantes del dueño con `useRestauranteCarta`.
// • Si no hay `:id` y hay restaurantes, redirige al primero.
// • Defensa contra IDOR: si el `:id` no está en su lista, redirige a /dueno.
// • Si no tiene restaurantes, muestra CTA para crear uno.
// • Estado de platos en memoria (sin backend todavía), segregado por restaurante.
//
// Selector arriba a la derecha para cambiar de restaurante sin volver al listado.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type Plato } from "../api/duenos";
import CloudinaryUploader from "../components/CloudinaryUploader";
import { useRestauranteCarta } from "../hooks/useRestauranteCarta";

interface CartaForm {
  nombre: string;
  descripcion: string;
  precio: string;
  categoria: string;
  disponible: boolean;
  urlImagen: string | null;
}

const emptyForm: CartaForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "",
  disponible: true,
  urlImagen: null,
};

/** Tope visual de la descripción para que la card no quede gigante. */
const DESCRIPCION_MAX = 150;

/** Mapa de cartas: { [restauranteId]: Plato[] } */
type CartasPorRestaurante = Record<string, Plato[]>;

function genLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatPrecio(centavos: number): string {
  const pesos = centavos / 100;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export default function CartaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { restaurantes, cargando, error, restauranteActivo } =
    useRestauranteCarta(id ?? null);

  // Cartas en memoria, una por restaurante.
  const [cartas, setCartas] = useState<CartasPorRestaurante>({});

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Plato | null>(null);
  const [form, setForm] = useState<CartaForm>({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  // Redirecciones automáticas.
  // 1. Si no hay :id pero hay restós → redirigir al primero.
  useEffect(() => {
    if (!id && !cargando && restaurantes.length > 0) {
      navigate(`/dueno/restaurantes/${restaurantes[0].id}/carta`, {
        replace: true,
      });
    }
  }, [id, cargando, restaurantes, navigate]);

  // 2. Defensa contra IDOR / id inválido.
  useEffect(() => {
    if (
      id &&
      !cargando &&
      restaurantes.length > 0 &&
      !restaurantes.some((r) => r.id === id)
    ) {
      navigate("/dueno", { replace: true });
    }
  }, [id, cargando, restaurantes, navigate]);

  // Platos del restaurante activo (o [] si no hay).
  const data: Plato[] = id ? cartas[id] ?? [] : [];

  function setData(updater: (prev: Plato[]) => Plato[]) {
    if (!id) return;
    setCartas((prev) => ({
      ...prev,
      [id]: updater(prev[id] ?? []),
    }));
  }

  // Estado vacío por restaurante: limpia el filtro de categoría cuando cambian
  // los datos para evitar que quede un chip apuntando a una categoría ya
  // inexistente.
  useEffect(() => {
    if (categoriaFiltro && !data.some((p) => p.categoria === categoriaFiltro)) {
      setCategoriaFiltro(null);
    }
  }, [categoriaFiltro, data]);

  function openCreatePlato() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setShowModal(true);
  }

  function openCreateBebida() {
    setEditing(null);
    setForm({ ...emptyForm, categoria: "Bebidas" });
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(plato: Plato) {
    setEditing(plato);
    setForm({
      nombre: plato.nombre,
      descripcion: plato.descripcion ?? "",
      precio: (plato.precio / 100).toString(),
      categoria: plato.categoria,
      disponible: plato.disponible,
      urlImagen: plato.urlImagen ?? null,
    });
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setFormError(null);
  }

  // Cerrar con tecla ESC.
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nombre = form.nombre.trim();
    const categoria = form.categoria.trim();
    const precioStr = form.precio.trim();
    const precioNum = Number(precioStr.replace(",", "."));

    if (!nombre) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (nombre.length > 255) {
      setFormError("El nombre no puede tener más de 255 caracteres.");
      return;
    }
    if (!categoria) {
      setFormError("La categoría es obligatoria.");
      return;
    }
    if (categoria.length > 100) {
      setFormError("La categoría no puede tener más de 100 caracteres.");
      return;
    }
    const descripcionTrim = form.descripcion.trim();
    if (descripcionTrim.length > DESCRIPCION_MAX) {
      setFormError(
        `La descripción no puede tener más de ${DESCRIPCION_MAX} caracteres.`,
      );
      return;
    }
    if (!precioStr || Number.isNaN(precioNum) || precioNum < 0) {
      setFormError("Ingresá un precio válido (mayor o igual a 0).");
      return;
    }

    const precioCentavos = Math.round(precioNum * 100);
    const descripcion = descripcionTrim ? descripcionTrim : null;

    if (editing) {
      setData((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                nombre,
                descripcion,
                precio: precioCentavos,
                categoria,
                disponible: form.disponible,
                urlImagen: form.urlImagen,
              }
            : p,
        ),
      );
    } else {
      const nuevo: Plato = {
        id: genLocalId(),
        restauranteId: id ?? "local",
        nombre,
        descripcion,
        precio: precioCentavos,
        categoria,
        disponible: form.disponible,
        urlImagen: form.urlImagen,
      };
      setData((prev) => [nuevo, ...prev]);
    }

    closeModal();
  }

  function handleToggleDisponible(plato: Plato) {
    setData((prev) =>
      prev.map((p) =>
        p.id === plato.id ? { ...p, disponible: !p.disponible } : p,
      ),
    );
  }

  function handleDelete(platoId: string) {
    if (!confirm("¿Eliminar este plato de la carta?")) return;
    setData((prev) => prev.filter((p) => p.id !== platoId));
    if (editing?.id === platoId) closeModal();
  }

  // Datos filtrados por categoría y búsqueda.
  const filteredData = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return data.filter((p) => {
      if (categoriaFiltro && p.categoria !== categoriaFiltro) return false;
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        (p.descripcion?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data, busqueda, categoriaFiltro]);

  const grouped = useMemo(() => {
    const map = new Map<string, Plato[]>();
    for (const p of [...filteredData].sort(
      (a, b) =>
        a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre),
    )) {
      const list = map.get(p.categoria) ?? [];
      list.push(p);
      map.set(p.categoria, list);
    }
    return Array.from(map.entries());
  }, [filteredData]);

  const countPorCategoria = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of data) m.set(p.categoria, (m.get(p.categoria) ?? 0) + 1);
    return m;
  }, [data]);

  const disponibles = data.filter((p) => p.disponible).length;
  const noDisponibles = data.filter((p) => !p.disponible).length;
  const categoriasUnicas = new Set(data.map((p) => p.categoria)).size;
  const hayFiltroActivo = busqueda.trim().length > 0 || categoriaFiltro !== null;

  // Estados de carga / error para la vista.
  if (cargando) {
    return (
      <div className="text-stone-500 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        Cargando restaurantes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-red-700 bg-red-50 border-red-200">
        {error}
      </div>
    );
  }

  // Sin restaurantes → CTA para crear el primero.
  if (restaurantes.length === 0) {
    return (
      <div className="card p-8 text-center bg-cream-100/70 border-dashed">
        <div className="text-4xl mb-2">🏪</div>
        <p className="text-stone-700 font-medium">No tenés restaurantes todavía</p>
        <p className="text-xs text-stone-500 mt-1">
          Necesitás crear al menos un restaurante para poder armar la carta.
        </p>
        <Link to="/dueno" className="btn-primary mt-3 text-sm inline-flex">
          + Crear mi primer restaurante
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header con título, selector de restaurante y botones */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
            <span>📋</span> Carta
          </h2>

          {/* Selector de restaurante (a la izquierda, junto al título) */}
          <div className="relative">
            <button
              onClick={() => setSelectorAbierto((v) => !v)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold bg-white text-stone-700 hover:bg-cream-100 transition border border-stone-200"
              title="Cambiar restaurante"
            >
              <span className="max-w-[180px] truncate">
                {restauranteActivo?.nombre ?? "Seleccionar restaurante"}
              </span>
              <span className="text-stone-400">▾</span>
            </button>
            {selectorAbierto && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setSelectorAbierto(false)}
                />
                <ul className="absolute top-full left-0 mt-1 min-w-[240px] z-40 bg-white text-stone-800 rounded-lg border border-stone-200 shadow-xl overflow-hidden">
                  {restaurantes.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => {
                          navigate(`/dueno/restaurantes/${r.id}/carta`);
                          setSelectorAbierto(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-cream-100 transition ${
                          r.id === id
                            ? "bg-forest-100 text-forest-800 font-semibold"
                            : ""
                        }`}
                      >
                        {r.nombre}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-stone-500">
            {data.length} {data.length === 1 ? "plato" : "platos"}
            {data.length > 0 && (
              <>
                {" · "}
                <strong className="text-emerald-700">{disponibles}</strong>{" "}
                disponibles
                {noDisponibles > 0 && (
                  <>
                    {" · "}
                    <strong className="text-stone-500">{noDisponibles}</strong>{" "}
                    no disponibles
                  </>
                )}
                {categoriasUnicas > 0 && (
                  <>
                    {" · "}
                    <strong className="text-stone-700">{categoriasUnicas}</strong>{" "}
                    {categoriasUnicas === 1 ? "categoría" : "categorías"}
                  </>
                )}
              </>
            )}
          </span>

          <button onClick={openCreatePlato} className="btn-primary text-sm">
            + Crear plato
          </button>
          <button onClick={openCreateBebida} className="btn-primary text-sm">
            + Crear bebida
          </button>
        </div>
      </div>

      {/* Aviso: modo solo front (sin backend todavía) */}
      <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
        <span>⚠️</span>
        <span>
          Modo de prueba: los platos se guardan solo en esta pantalla y por
          restaurante. Cuando esté listo el endpoint de platos en el backend, se
          van a persistir automáticamente.
        </span>
      </div>

      {/* Buscador + chips de categorías — aparecen solo si hay platos */}
      {data.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, descripción o categoría…"
              className="input pr-9"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-lg leading-none"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setCategoriaFiltro(null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                categoriaFiltro === null
                  ? "bg-forest-600 text-white border-forest-600"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-cream-100"
              }`}
            >
              Todas ({data.length})
            </button>
            {Array.from(countPorCategoria.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() =>
                    setCategoriaFiltro(categoriaFiltro === cat ? null : cat)
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${
                    categoriaFiltro === cat
                      ? "bg-forest-600 text-white border-forest-600"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-cream-100"
                  }`}
                >
                  {cat} ({count})
                </button>
              ))}
          </div>

          {hayFiltroActivo && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "resultado" : "resultados"}
              </span>
              <button
                onClick={() => {
                  setBusqueda("");
                  setCategoriaFiltro(null);
                }}
                className="text-forest-700 hover:text-forest-900 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lista de platos */}
      {data.length === 0 ? (
        <div className="card p-8 text-center bg-cream-100/70 border-dashed">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-stone-700 font-medium">La carta está vacía</p>
          <p className="text-xs text-stone-500 mt-1">
            Usá los botones de arriba para crear el primer plato o bebida de{" "}
            {restauranteActivo?.nombre ?? "este restaurante"}.
          </p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="card p-8 text-center bg-cream-100/70 border-dashed">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-stone-700 font-medium">Sin resultados</p>
          <p className="text-xs text-stone-500 mt-1">
            Probá con otro término o cambiá el filtro de categoría.
          </p>
          <button
            onClick={() => {
              setBusqueda("");
              setCategoriaFiltro(null);
            }}
            className="btn-primary text-sm mt-3"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([categoria, platos]) => (
            <section key={categoria}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                  {categoria}
                </h3>
                <span className="text-xs text-stone-500">
                  ({platos.length})
                </span>
                <div className="flex-1 h-px bg-cream-200 ml-1" />
              </div>
              <ul className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {platos.map((p) => (
                  <li
                    key={p.id}
                    className={`group card overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md ${
                      p.disponible ? "" : "opacity-60"
                    }`}
                  >
                    <div className="relative aspect-[3/2] bg-gradient-to-br from-cream-100 to-cream-200 overflow-hidden">
                      {p.urlImagen ? (
                        <img
                          src={p.urlImagen}
                          alt={p.nombre}
                          className="w-full h-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-3xl select-none"
                          aria-hidden
                        >
                          {p.categoria === "Bebidas" || p.categoria === "Tragos"
                            ? "🥤"
                            : "🍴"}
                        </div>
                      )}

                      <button
                        onClick={() => handleToggleDisponible(p)}
                        className={`absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium shadow-sm transition ${
                          p.disponible
                            ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                            : "bg-stone-700/80 text-white hover:bg-stone-800"
                        }`}
                        title={
                          p.disponible
                            ? "Marcar como no disponible"
                            : "Marcar como disponible"
                        }
                      >
                        {p.disponible ? "●" : "○"}
                      </button>
                    </div>

                    <div className="p-2">
                      <h4 className="font-medium text-stone-900 text-xs leading-tight line-clamp-2 min-h-[2rem]">
                        {p.nombre}
                      </h4>
                      {p.descripcion && (
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1 hidden sm:block">
                          {p.descripcion}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center justify-between gap-1">
                        <div className="text-sm font-bold text-forest-700 truncate">
                          {formatPrecio(p.precio)}
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* Modal: crear / editar plato */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                {editing
                  ? "Editar plato"
                  : form.categoria === "Bebidas"
                    ? "Nueva bebida"
                    : "Nuevo plato"}
              </h2>
              <button
                onClick={closeModal}
                className="text-stone-400 hover:text-stone-700 text-2xl leading-none"
                title="Cerrar"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  className="input"
                  placeholder={
                    form.categoria === "Bebidas"
                      ? "Ej: Cerveza artesanal, Limonada, Mojito…"
                      : "Ej: Milanesa con papas fritas"
                  }
                  maxLength={255}
                  required
                  autoFocus
                />
              </div>

              {form.categoria !== "Bebidas" && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    value={form.categoria}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        categoria: e.target.value,
                      }))
                    }
                    className="input"
                    placeholder="Ej: Principales, Postres, Pizzas, Pastas…"
                    maxLength={100}
                    required
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Escribí libremente la categoría. Si ya existe, el plato se
                    agrupará con los demás de esa misma categoría.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Precio (ARS) *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.precio}
                  onChange={(e) => {
                    const limpio = e.target.value
                      .replace(/[^0-9.,]/g, "")
                      .replace(/([.,]).*([.,])/g, "$1$2");
                    setForm((prev) => ({ ...prev, precio: limpio }));
                  }}
                  className="input"
                  placeholder="0"
                  required
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Se guarda en centavos. Se muestra sin decimales en la carta.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-stone-700">
                    Descripción
                  </label>
                  <span
                    className={`text-[11px] ${
                      form.descripcion.length > DESCRIPCION_MAX
                        ? "text-red-600 font-semibold"
                        : form.descripcion.length > DESCRIPCION_MAX * 0.9
                          ? "text-amber-600"
                          : "text-stone-500"
                    }`}
                  >
                    {form.descripcion.length} / {DESCRIPCION_MAX}
                  </span>
                </div>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      descripcion: e.target.value.slice(0, DESCRIPCION_MAX),
                    }))
                  }
                  className="input min-h-[80px] resize-y"
                  placeholder={
                    form.categoria === "Bebidas"
                      ? "Detalle de la bebida, ingredientes, calorías, etc."
                      : "Detalle del plato, ingredientes, alérgenos, etc."
                  }
                  maxLength={DESCRIPCION_MAX}
                />
              </div>

              <div>
                <CloudinaryUploader
                  value={form.urlImagen}
                  onChange={(url) =>
                    setForm((prev) => ({ ...prev, urlImagen: url }))
                  }
                  label={
                    form.categoria === "Bebidas"
                      ? "Foto de la bebida"
                      : "Foto del plato"
                  }
                  folder="restaurantgo/carta"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="carta-disponible"
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      disponible: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-stone-300 text-forest-600 focus:ring-forest-500"
                />
                <label
                  htmlFor="carta-disponible"
                  className="text-sm text-stone-700 select-none"
                >
                  Disponible en la carta
                </label>
              </div>

              {formError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-ghost text-sm"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-sm">
                  {editing
                    ? "Guardar cambios"
                    : form.categoria === "Bebidas"
                      ? "Crear bebida"
                      : "Crear plato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
