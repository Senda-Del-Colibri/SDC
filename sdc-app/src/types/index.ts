// Tipos para Clientes
export interface Cliente {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  comentarios?: string;
  fecha_registro: string;
}

// Tipos para Eventos
export interface Evento {
  id: number;
  nombre_evento: string;
  ubicacion_evento?: string;
  fecha_evento: string;
  capacidad?: number;
  precio_estandar: number;
  total_bruto_cobrado: number;
  total_gastado: number;
  estado: 'programado' | 'completado' | 'cancelado';
  comentarios?: string;
  fecha_registro: string;
}

// Tipos para Referidos
export interface Referido {
  id: number;
  id_referidor: number;
  id_referido?: number;
  nombre_referido?: string;
  email_referido?: string;
  telefono_referido?: string;
  estado: 'pendiente' | 'contactado' | 'convertido' | 'rechazado';
  comentarios?: string;
  fecha_referencia: string;
}

// Tipos para Asistencias
export interface Asistencia {
  id: number;
  id_cliente: number;
  id_evento: number;
  asistio: boolean;
  estado_pago: 'pendiente' | 'pagado' | 'parcial' | 'gratuito';
  monto_pagado: number;
  comentarios?: string;
  fecha_registro: string;
}

// Tipos para formularios
export interface ClienteFormData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  comentarios?: string;
}

export interface EventoFormData {
  nombre_evento: string;
  ubicacion_evento?: string;
  fecha_evento: string;
  capacidad?: number;
  precio_estandar: number;
  total_bruto_cobrado?: number;
  total_gastado?: number;
  estado: 'programado' | 'completado' | 'cancelado';
  comentarios?: string;
}

export interface ReferidoFormData {
  id_referidor: number;
  id_referido?: number;
  nombre_referido?: string;
  email_referido?: string;
  telefono_referido?: string;
  estado: 'pendiente' | 'contactado' | 'convertido' | 'rechazado';
  comentarios?: string;
}

export interface AsistenciaFormData {
  id_cliente: number;
  id_evento: number;
  asistio: boolean;
  estado_pago: 'pendiente' | 'pagado' | 'parcial' | 'gratuito';
  monto_pagado: number;
  comentarios?: string;
}

// Tipos extendidos para mostrar información relacionada
export interface ClienteDetalle extends Cliente {
  asistencias?: Asistencia[];
  referidos?: Referido[];
}

export interface EventoDetalle extends Evento {
  asistencias?: Asistencia[];
}

export interface AsistenciaDetalle extends Asistencia {
  cliente?: Cliente;
  evento?: Evento;
} 