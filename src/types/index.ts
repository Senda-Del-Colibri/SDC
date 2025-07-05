export interface Cliente {
  id: string;
  nombre: string;
  apellidos: string;
  celular?: string;
  comentarios?: string;
  visitas: number;
  monto_acumulado: number;
  created_at: string;
  updated_at: string;
}

export interface Evento {
  id: string;
  nombre: string;
  ubicacion: string;
  gasto: number;
  total_cobrado: number;
  cantidad_personas: number;
  created_at: string;
  updated_at: string;
}

export interface Referido {
  id: string;
  cliente_id: string;
  referido_id: string;
  cliente?: Cliente;
  referido?: Cliente;
  created_at: string;
}

export interface Asistencia {
  id: string;
  cliente_id: string;
  evento_id: string;
  monto_pagado: number;
  cliente?: Cliente;
  evento?: Evento;
  created_at: string;
}

// Tipos para formularios
export interface ClienteFormData {
  nombre: string;
  apellidos: string;
  celular?: string;
  comentarios?: string;
}

export interface EventoFormData {
  nombre: string;
  ubicacion: string;
  gasto: number;
}

export interface AsistenciaFormData {
  cliente_id: string;
  evento_id: string;
  monto_pagado: number;
}

export interface ReferidoFormData {
  cliente_id: string;
  referido_id: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}

// Tipos para filtros y búsqueda
export interface ClienteFilters {
  nombre?: string;
  apellidos?: string;
  celular?: string;
}

export interface EventoFilters {
  nombre?: string;
  ubicacion?: string;
}

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  totalClientes: number;
  totalEventos: number;
  totalReferidos: number;
  totalAsistencias: number;
  ingresosTotales: number;
}

// Tipos para autenticación
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} 