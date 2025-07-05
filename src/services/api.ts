import { supabase } from './supabase';
import type { 
  Cliente, 
  Evento, 
  Referido, 
  Asistencia, 
  ClienteForm, 
  EventoForm, 
  ReferidoForm, 
  AsistenciaForm,
  DashboardStats
} from '../types';

// =====================================================
// SERVICIOS DE CLIENTES
// =====================================================

export const clienteService = {
  // Obtener todos los clientes
  async getAll(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener cliente por ID
  async getById(id: number): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear nuevo cliente
  async create(cliente: ClienteForm): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar cliente
  async update(id: number, cliente: Partial<ClienteForm>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Buscar clientes
  async search(query: string): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%,celular.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// =====================================================
// SERVICIOS DE EVENTOS
// =====================================================

export const eventoService = {
  // Obtener todos los eventos
  async getAll(): Promise<Evento[]> {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener evento por ID
  async getById(id: number): Promise<Evento | null> {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear nuevo evento
  async create(evento: EventoForm): Promise<Evento> {
    const { data, error } = await supabase
      .from('eventos')
      .insert(evento)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar evento
  async update(id: number, evento: Partial<EventoForm>): Promise<Evento> {
    const { data, error } = await supabase
      .from('eventos')
      .update(evento)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Buscar eventos
  async search(query: string): Promise<Evento[]> {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .or(`nombre.ilike.%${query}%,ubicacion.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// =====================================================
// SERVICIOS DE REFERIDOS
// =====================================================

export const referidoService = {
  // Obtener todos los referidos
  async getAll(): Promise<Referido[]> {
    const { data, error } = await supabase
      .from('referidos')
      .select(`
        *,
        cliente:cliente_id(id, nombre, apellidos),
        referido:referido_id(id, nombre, apellidos)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener referidos por cliente
  async getByClienteId(clienteId: number): Promise<Referido[]> {
    const { data, error } = await supabase
      .from('referidos')
      .select(`
        *,
        referido:referido_id(id, nombre, apellidos)
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Crear nuevo referido
  async create(referido: ReferidoForm): Promise<Referido> {
    const { data, error } = await supabase
      .from('referidos')
      .insert(referido)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// SERVICIOS DE ASISTENCIAS
// =====================================================

export const asistenciaService = {
  // Obtener todas las asistencias
  async getAll(): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *,
        cliente:cliente_id(id, nombre, apellidos),
        evento:evento_id(id, nombre, ubicacion)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener asistencias por cliente
  async getByClienteId(clienteId: number): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *,
        evento:evento_id(id, nombre, ubicacion)
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener asistencias por evento
  async getByEventoId(eventoId: number): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *,
        cliente:cliente_id(id, nombre, apellidos)
      `)
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Crear nueva asistencia
  async create(asistencia: AsistenciaForm): Promise<Asistencia> {
    const { data, error } = await supabase
      .from('asistencias')
      .insert(asistencia)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// SERVICIOS DE ESTADÍSTICAS
// =====================================================

export const statsService = {
  // Obtener estadísticas del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // Ejecutar consultas en paralelo
    const [
      clientesResult,
      eventosResult,
      referidosResult,
      asistenciasResult,
      ingresosResult,
      clientesActivosResult
    ] = await Promise.all([
      supabase.from('clientes').select('id', { count: 'exact', head: true }),
      supabase.from('eventos').select('id', { count: 'exact', head: true }),
      supabase.from('referidos').select('id', { count: 'exact', head: true }),
      supabase.from('asistencias').select('id', { count: 'exact', head: true }),
      supabase.from('asistencias').select('monto_pagado'),
      supabase.from('clientes').select('id', { count: 'exact', head: true }).gt('visitas', 0)
    ]);

    // Calcular ingresos totales
    const ingresos_totales = ingresosResult.data?.reduce((sum, asistencia) => 
      sum + (asistencia.monto_pagado || 0), 0) || 0;

    return {
      total_clientes: clientesResult.count || 0,
      total_eventos: eventosResult.count || 0,
      total_referidos: referidosResult.count || 0,
      total_asistencias: asistenciasResult.count || 0,
      ingresos_totales,
      clientes_activos: clientesActivosResult.count || 0
    };
  }
}; 