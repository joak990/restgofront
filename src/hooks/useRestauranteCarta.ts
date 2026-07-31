// filepath: src/hooks/useRestauranteCarta.ts
// Hook paralelo a useRestauranteVista pero más liviano:
// sólo carga la lista de restaurantes del dueño y expone el activo
// según el `:id` que venga en la URL.
//
// El estado de los platos en sí vive en CartaPage (en memoria) hasta
// que el backend de /platos exista.

import { useEffect, useState } from "react";
import { duenosApi, type Restaurante } from "../api/duenos";

export interface UseRestauranteCarta {
  restaurantes: Restaurante[];
  cargando: boolean;
  error: string | null;
  /** undefined: aún no se intentó, null: id no coincide con ninguno (IDOR / inválido) */
  restauranteActivo: Restaurante | null | undefined;
  refrescar: () => Promise<void>;
}

export function useRestauranteCarta(
  restauranteId: string | null,
): UseRestauranteCarta {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const lista = await duenosApi.getMisRestaurantes();
      setRestaurantes(lista);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const restauranteActivo =
    restauranteId === null
      ? undefined
      : restaurantes.find((r) => r.id === restauranteId) ?? null;

  return {
    restaurantes,
    cargando,
    error,
    restauranteActivo,
    refrescar: cargar,
  };
}
