// filepath: src/data/reservationsMock.ts
// Datos mockeados del demo. Modelo simplificado:
//
//   • 3 mesas, un único piso
//   • Statuses: libre | reservada | cuenta | bloqueada
//   • Turnos:   almuerzo | cena   (sin brunch)
//   • Sin VIP, sin "sentada"

export type TableShape = "rect" | "round" | "square";

export type TableStatus = "libre" | "reservada" | "cuenta" | "bloqueada";

export interface FloorTable {
  id: string;
  numero: string;
  capacidad: number;
  forma: TableShape;
  /** ancho y alto en unidades del grid (1u ~= 32px) */
  ancho: number;
  alto: number;
  /** posicion esquina superior izquierda en unidades del grid */
  x: number;
  y: number;
  rotada?: boolean;
  status: TableStatus;
  horaEstimada?: string;
}

export interface Reservation {
  id: string;
  /** Turno en que está agrupada */
  turno: "almuerzo" | "cena";
  /** HH:MM */
  hora: string;
  partySize: number;
  nombre: string;
  /** mesa asignada (id) o null si aún sin mesa */
  mesaId: string | null;
  /** Notas opcionales */
  nota?: string;
  /** Tag visual a la izquierda (🎉, 📞, etc) */
  tag?: string;
  /** Estado textual opcional */
  estado?: string;
}

export const mesasMock: FloorTable[] = [
  {
    id: "t-1",
    numero: "1",
    capacidad: 4,
    forma: "square",
    ancho: 6,
    alto: 6,
    x: 2,
    y: 3,
    rotada: true,
    status: "cuenta",
    horaEstimada: "10:15",
  },
  {
    id: "t-2",
    numero: "2",
    capacidad: 6,
    forma: "rect",
    ancho: 8,
    alto: 5,
    x: 11,
    y: 3,
    status: "reservada",
    horaEstimada: "10:30",
  },
  {
    id: "t-3",
    numero: "3",
    capacidad: 8,
    forma: "round",
    ancho: 7,
    alto: 7,
    x: 22,
    y: 3,
    status: "libre",
  },
];

export const reservationsMock: Reservation[] = [
  // --- Almuerzo ---
  { id: "r-1", turno: "almuerzo", hora: "10:15", partySize: 4, nombre: "Jessica Leiser", mesaId: "t-1", estado: "Confirmada", tag: "🎉", nota: "10:11 am" },
  { id: "r-2", turno: "almuerzo", hora: "10:30", partySize: 2, nombre: "Ronald Bryant", mesaId: "t-2", estado: "Confirmada", tag: "📞" },
  { id: "r-3", turno: "almuerzo", hora: "10:30", partySize: 8, nombre: "Carol Kirkland", mesaId: "t-2", estado: "Confirmada", tag: "🎂", nota: "Pedido especial" },
  { id: "r-4", turno: "almuerzo", hora: "11:00", partySize: 2, nombre: "Elizabeth Grosvenor", mesaId: null },
  { id: "r-5", turno: "almuerzo", hora: "11:45", partySize: 4, nombre: "Charlie Webb", mesaId: null, tag: "👶", nota: "Silla alta" },
  { id: "r-6", turno: "almuerzo", hora: "12:30", partySize: 6, nombre: "Mariana Vázquez", mesaId: null },
  { id: "r-7", turno: "almuerzo", hora: "13:00", partySize: 2, nombre: "Diego Salazar", mesaId: null, tag: "🎉" },

  // --- Cena ---
  { id: "r-8", turno: "cena", hora: "20:00", partySize: 2, nombre: "Sofía Romero", mesaId: null, estado: "Confirmada" },
  { id: "r-9", turno: "cena", hora: "20:15", partySize: 6, nombre: "Tomás Aguirre", mesaId: null, estado: "Confirmada", tag: "🥗", nota: "Vegano" },
  { id: "r-10", turno: "cena", hora: "20:30", partySize: 4, nombre: "Lucía Fernández", mesaId: null },
  { id: "r-11", turno: "cena", hora: "21:00", partySize: 2, nombre: "Paula Méndez", mesaId: null, tag: "🥞" },
  { id: "r-12", turno: "cena", hora: "21:30", partySize: 8, nombre: "Andrés Quintero", mesaId: null },
];

export const turnos: { id: Reservation["turno"]; label: string; hora: string }[] = [
  { id: "almuerzo", label: "Almuerzo", hora: "Lun–Vie 12:00–15:30" },
  { id: "cena", label: "Cena", hora: "Lun–Sáb 20:00–23:30" },
];