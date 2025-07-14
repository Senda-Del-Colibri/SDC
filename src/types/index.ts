// =====================================================
// Tipos para el Sistema de Gestión Senda del Colibrí
// =====================================================

// Tipos base
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at?: string;
}

// Cliente
export interface Cliente extends BaseEntity {
  nombre: string;
  apellidos: string;
  celular?: string;
  comentarios?: string;
  visitas: number;
  monto_acumulado: number;
}

// Evento
export interface Evento extends BaseEntity {
  nombre: string;
  ubicacion: string;
  gasto: number;
  total_cobrado: number;
  cantidad_personas: number;
  fecha_evento?: string; // Fecha programada del evento (formato ISO)
}

// Referido
export interface Referido {
  id: number;
  cliente_id: number;
  referido_id: number;
  created_at: string;
}

// Asistencia
export interface Asistencia {
  id: number;
  cliente_id: number;
  evento_id: number;
  monto_pagado: number;
  created_at: string;
}

// Tipos para formularios (sin campos calculados automáticamente)
export interface ClienteForm {
  nombre: string;
  apellidos: string;
  celular?: string;
  comentarios?: string;
}

export interface EventoForm {
  nombre: string;
  ubicacion: string;
  gasto: number;
  fecha_evento?: string; // Fecha programada del evento (formato ISO)
}

export interface ReferidoForm {
  cliente_id: number;
  referido_id: number;
}

export interface AsistenciaForm {
  cliente_id: number;
  evento_id: number;
  monto_pagado: number;
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

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  total_clientes: number;
  total_eventos: number;
  total_referidos: number;
  total_asistencias: number;
  ingresos_totales: number;
  clientes_activos: number;
}

// Tipos para autenticación
export interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    display_name?: string;
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 