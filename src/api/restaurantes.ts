// filepath: src/api/restaurantes.ts
import { apiClient } from "./client";

// === Tipos ================================================================

export interface Provincia {
  id: string;
  nombre: string;
  codigoIgn?: string;
}

export interface Ciudad {
  id: string;
  nombre: string;
  provinciaId: string;
}

export interface Restaurante {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipoCocina: string | null;
  direccion: string;
  ciudadId: string;
  provinciaId: string;
  codigoPostal: string | null;
  telefono: string | null;
  rangoPrecio: number;
  activo: boolean;
  verificado: boolean;
  urlImagenPortada: string | null;
  urlLogo: string | null;
  ciudad: { nombre: string };
  provincia: { nombre: string };
  precioMin: number;
  precioMax: number;
  cantidadPlatos: number;
  fotos: string[];
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// === Ubicaciones =========================================================

export function getProvincias() {
  return apiClient.get<Provincia[]>("/ubicaciones/provincias").then((r) => r.data);
}

export function getCiudades(provinciaId: string) {
  return apiClient
    .get<Ciudad[]>(`/ubicaciones/provincias/${provinciaId}/ciudades`)
    .then((r) => r.data);
}

// === Restaurantes ========================================================

export function getRestaurantesByCiudad(ciudadId: string, page = 1, limit = 20) {
  return apiClient
    .get<Paginated<Restaurante>>(
      `/restaurantes?ciudadId=${ciudadId}&page=${page}&limit=${limit}`,
    )
    .then((r) => r.data);
}

export function getRestauranteById(id: string) {
  return apiClient.get<Restaurante>(`/restaurantes/${id}`).then((r) => r.data);
}

// === Helpers =============================================================

export function normalize(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^provincia\s+(de|del|de la|de los)\s+/i, "")
    .replace(/^departamento\s+/i, "")
    .replace(/^municipio\s+/i, "")
    .trim();
}

export function matchCiudad(
  ciudadNombre: string,
  _provinciaNombre: string | null | undefined,
  ciudades: Ciudad[],
): Ciudad | null {
  const target = normalize(ciudadNombre);
  return (
    ciudades.find((c) => normalize(c.nombre) === target) ||
    ciudades.find((c) => normalize(c.nombre).includes(target)) ||
    null
  );
}

export function matchProvincia(
  provinciaNombre: string,
  provincias: Provincia[],
): Provincia | null {
  const target = normalize(provinciaNombre);
  return (
    provincias.find((p) => normalize(p.nombre) === target) ||
    provincias.find((p) => normalize(p.nombre).includes(target)) ||
    null
  );
}
