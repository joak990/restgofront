// filepath: src/api/duenos.ts
import { apiClient } from './client';

export interface Restaurante {
  id: string;
  nombre: string;
  descripcion?: string | null;
  direccion: string;
  telefono: string;
  activo: boolean;
  verificado: boolean;
  // ...otros campos según response del backend
}

export interface Horario {
  id: string;
  restauranteId: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  cerrado: boolean;
}

export interface Mesa {
  id: string;
  restauranteId: string;
  numero: number;
  capacidad: number;
  activo: boolean;
}

export const duenosApi = {
  // Restaurantes del dueño autenticado
  async getMisRestaurantes(): Promise<Restaurante[]> {
    const { data } = await apiClient.get<Restaurante[]>('/duenos/restaurantes');
    return data;
  },

  // Horarios
  async getHorarios(restauranteId: string): Promise<Horario[]> {
    const { data } = await apiClient.get<Horario[]>(
      `/duenos/restaurantes/${restauranteId}/horarios`,
    );
    return data;
  },
  async createHorario(
    restauranteId: string,
    body: Omit<Horario, 'id' | 'restauranteId'>,
  ): Promise<Horario> {
    const { data } = await apiClient.post<Horario>(
      `/duenos/restaurantes/${restauranteId}/horarios`,
      body,
    );
    return data;
  },
  async bulkCreateHorarios(
    restauranteId: string,
    horarios: Array<Omit<Horario, 'id' | 'restauranteId'>>,
  ): Promise<Horario[]> {
    const { data } = await apiClient.post<Horario[]>(
      `/duenos/restaurantes/${restauranteId}/horarios/bulk`,
      { horarios },
    );
    return data;
  },
  async updateHorario(
    restauranteId: string,
    horarioId: string,
    body: Partial<Omit<Horario, 'id' | 'restauranteId'>>,
  ): Promise<Horario> {
    const { data } = await apiClient.patch<Horario>(
      `/duenos/restaurantes/${restauranteId}/horarios/${horarioId}`,
      body,
    );
    return data;
  },
  async deleteHorario(restauranteId: string, horarioId: string): Promise<void> {
    await apiClient.delete(`/duenos/restaurantes/${restauranteId}/horarios/${horarioId}`);
  },

  // Mesas
  async getMesas(restauranteId: string): Promise<Mesa[]> {
    const { data } = await apiClient.get<Mesa[]>(
      `/duenos/restaurantes/${restauranteId}/mesas`,
    );
    return data;
  },
  async createMesa(
    restauranteId: string,
    body: Omit<Mesa, 'id' | 'restauranteId'>,
  ): Promise<Mesa> {
    const { data } = await apiClient.post<Mesa>(
      `/duenos/restaurantes/${restauranteId}/mesas`,
      body,
    );
    return data;
  },
  async updateMesa(
    restauranteId: string,
    mesaId: string,
    body: Partial<Omit<Mesa, 'id' | 'restauranteId'>>,
  ): Promise<Mesa> {
    const { data } = await apiClient.patch<Mesa>(
      `/duenos/restaurantes/${restauranteId}/mesas/${mesaId}`,
      body,
    );
    return data;
  },
  async deleteMesa(restauranteId: string, mesaId: string): Promise<void> {
    await apiClient.delete(`/duenos/restaurantes/${restauranteId}/mesas/${mesaId}`);
  },
};
