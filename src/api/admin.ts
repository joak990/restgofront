// filepath: src/api/admin.ts
// Cliente para los endpoints de admin (verificación de dueños).
// Los endpoints están protegidos por AdminGuard en el backend
// (restgofront/src/components/RequireAdmin.tsx en el front).

import { apiClient } from "./client";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type EstadoVerificacion =
  | "PENDIENTE"
  | "EN_REVISION"
  | "VERIFICADO"
  | "RECHAZADO";

export interface DuenoDetalle {
  id: string;
  correo: string;
  nombreCompleto: string;
  dni: string;
  cuitCuil: string | null;
  telefono: string;
  direccion: string;
  codigoPostal: string | null;
  fechaNacimiento: string | null;
  urlAvatar: string | null;
  urlFotoDniFrente: string | null;
  urlFotoDniDorso: string | null;
  estadoVerificacion: EstadoVerificacion;
  motivoRechazo: string | null;
  verificadoEn: string | null;
  rechazadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
  provincia: { id: string; nombre: string } | null;
  ciudad: { id: string; nombre: string } | null;
}

export interface ListDuenosMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListDuenosResponse {
  data: DuenoDetalle[];
  meta: ListDuenosMeta;
}

export interface ListDuenosParams {
  estado?: EstadoVerificacion;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export type EstadoCliente = "ACTIVO" | "SUSPENDIDO" | "ELIMINADO";

export interface ClienteDetalle {
  id: string;
  correo: string;
  nombreCompleto: string;
  telefono: string | null;
  urlAvatar: string | null;
  estadoCliente: EstadoCliente;
  activo: boolean;
  creadoEn: string;
  provincia: { id: string; nombre: string } | null;
  ciudad: { id: string; nombre: string } | null;
  _count: { reservas: number; pagos: number };
}

export interface ListClientesResponse {
  data: ClienteDetalle[];
  meta: ListDuenosMeta;
}

export interface ListClientesParams {
  estadoCliente?: EstadoCliente;
  provinciaId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Restaurantes
// ---------------------------------------------------------------------------

export interface RestauranteEnGrupo {
  id: string;
  nombre: string;
  tipoCocina: string | null;
  rangoPrecio: number;
  urlImagenPortada: string | null;
  verificado: boolean;
  activo: boolean;
  ciudad: { nombre: string } | null;
  dueno: {
    id: string;
    nombreCompleto: string;
    correo: string;
    estadoVerificacion: string;
  };
  _count: { platos: number; mesas: number };
}

export interface RestauranteGrupoPorProvincia {
  provinciaId: string;
  provinciaNombre: string;
  total: number;
  restaurantes: RestauranteEnGrupo[];
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const adminApi = {
  /**
   * Listar dueños con filtros opcionales.
   * GET /admin/duenos?estado=...&page=...&limit=...
   */
  async listDuenos(params: ListDuenosParams = {}): Promise<ListDuenosResponse> {
    const { data } = await apiClient.get<ListDuenosResponse>("/admin/duenos", {
      params,
    });
    return data;
  },

  /**
   * Detalle de un dueño (incluye DNI, avatar, etc.).
   * GET /admin/duenos/:id
   */
  async getDuenoById(id: string): Promise<DuenoDetalle> {
    const { data } = await apiClient.get<DuenoDetalle>(`/admin/duenos/${id}`);
    return data;
  },

  /**
   * Aprobar verificación de un dueño.
   * PATCH /admin/duenos/:id/verificar
   */
  async verificarDueno(id: string): Promise<DuenoDetalle> {
    const { data } = await apiClient.patch<DuenoDetalle>(
      `/admin/duenos/${id}/verificar`,
    );
    return data;
  },

  /**
   * Rechazar verificación de un dueño (requiere motivo).
   * PATCH /admin/duenos/:id/rechazar  body: { motivo: string }
   */
  async rechazarDueno(id: string, motivo: string): Promise<DuenoDetalle> {
    const { data } = await apiClient.patch<DuenoDetalle>(
      `/admin/duenos/${id}/rechazar`,
      { motivo },
    );
    return data;
  },

  /**
   * Listar todos los clientes (admin).
   * GET /admin/clientes?estadoCliente=...&provinciaId=...&q=...&page=...&limit=...
   */
  async listClientes(
    params: ListClientesParams = {},
  ): Promise<ListClientesResponse> {
    const { data } = await apiClient.get<ListClientesResponse>(
      "/admin/clientes",
      { params },
    );
    return data;
  },

  /**
   * Listar todos los restaurantes activos, agrupados por provincia.
   * GET /admin/restaurantes?provinciaId=...
   */
  async listRestaurantes(
    params: { provinciaId?: string } = {},
  ): Promise<RestauranteGrupoPorProvincia[]> {
    const { data } = await apiClient.get<RestauranteGrupoPorProvincia[]>(
      "/admin/restaurantes",
      { params },
    );
    return data;
  },
};
