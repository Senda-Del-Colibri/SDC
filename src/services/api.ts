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
    // Usar una transacción para garantizar consistencia
    const { data, error } = await supabase.rpc('create_asistencia_with_stats', {
      p_cliente_id: asistencia.cliente_id,
      p_evento_id: asistencia.evento_id,
      p_monto_pagado: asistencia.monto_pagado
    });
    
    if (error) {
      // Si la función RPC falla, intentar método manual
      console.warn('RPC failed, trying manual method:', error);
      return this.createManual(asistencia);
    }
    
    return data;
  },

  // Método manual de respaldo para crear asistencia
  async createManual(asistencia: AsistenciaForm): Promise<Asistencia> {
    try {
      // 1. Crear la asistencia
      const { data: newAsistencia, error: asistenciaError } = await supabase
        .from('asistencias')
        .insert(asistencia)
        .select()
        .single();
      
      if (asistenciaError) throw asistenciaError;

      // 2. Obtener datos actuales del cliente
      const { data: clienteActual, error: clienteGetError } = await supabase
        .from('clientes')
        .select('visitas, monto_acumulado')
        .eq('id', asistencia.cliente_id)
        .single();
      
      if (!clienteGetError && clienteActual) {
        // Actualizar estadísticas del cliente
        const { error: clienteError } = await supabase
          .from('clientes')
          .update({
            visitas: clienteActual.visitas + 1,
            monto_acumulado: clienteActual.monto_acumulado + asistencia.monto_pagado,
            updated_at: new Date().toISOString()
          })
          .eq('id', asistencia.cliente_id);
        
        if (clienteError) {
          console.error('Error updating client stats:', clienteError);
        }
      }

      // 3. Obtener datos actuales del evento
      const { data: eventoActual, error: eventoGetError } = await supabase
        .from('eventos')
        .select('cantidad_personas, total_cobrado')
        .eq('id', asistencia.evento_id)
        .single();
      
      if (!eventoGetError && eventoActual) {
        // Actualizar estadísticas del evento
        const { error: eventoError } = await supabase
          .from('eventos')
          .update({
            cantidad_personas: eventoActual.cantidad_personas + 1,
            total_cobrado: eventoActual.total_cobrado + asistencia.monto_pagado,
            updated_at: new Date().toISOString()
          })
          .eq('id', asistencia.evento_id);
        
        if (eventoError) {
          console.error('Error updating event stats:', eventoError);
        }
      }

      return newAsistencia;
      
    } catch (error) {
      console.error('Error in createManual:', error);
      throw error;
    }
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