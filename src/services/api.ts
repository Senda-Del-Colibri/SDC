import { supabase } from './supabase';
import type { 
  Cliente, 
  Evento, 
  Referido, 
  Asistencia, 
  Apartado,
  ClienteForm, 
  EventoForm, 
  ReferidoForm, 
  AsistenciaForm,
  ApartadoForm,
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
  },

  // Obtener próximo evento
  async getProximoEvento(): Promise<Evento | null> {
    const hoy = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .not('fecha_evento', 'is', null)
      .gte('fecha_evento', hoy)
      .order('fecha_evento', { ascending: true })
      .limit(1);
    
    if (error) throw error;
    return data?.[0] || null;
  },

  // Obtener últimos eventos finalizados
  async getUltimosEventosFinalizados(limit: number = 3): Promise<Evento[]> {
    const hoy = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .not('fecha_evento', 'is', null)
      .lt('fecha_evento', hoy)
      .order('fecha_evento', { ascending: false })
      .limit(limit);
    
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
// SERVICIOS DE APARTADOS
// =====================================================

export const apartadoService = {
  // Obtener todos los apartados
  async getAll(): Promise<Apartado[]> {
    const { data, error } = await supabase
      .from('apartados')
      .select(`
        *,
        cliente:cliente_id(id, nombre, apellidos),
        evento:evento_id(id, nombre, ubicacion, fecha_evento)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener apartados por evento
  async getByEventoId(eventoId: number): Promise<Apartado[]> {
    const { data, error } = await supabase
      .from('apartados')
      .select(`
        *,
        cliente:cliente_id(id, nombre, apellidos),
        evento:evento_id(id, nombre, ubicacion, fecha_evento)
      `)
      .eq('evento_id', eventoId)
      .eq('estado', 'apartado')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener apartado por ID
  async getById(id: number): Promise<Apartado | null> {
    const { data, error } = await supabase
      .from('apartados')
      .select(`
        *,
        cliente:cliente_id(id, nombre, apellidos),
        evento:evento_id(id, nombre, ubicacion, fecha_evento)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear nuevo apartado
  async create(apartado: ApartadoForm): Promise<Apartado> {
    const { data, error } = await supabase
      .from('apartados')
      .insert(apartado)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar estado del apartado
  async updateEstado(id: number, estado: 'apartado' | 'confirmado' | 'cancelado'): Promise<Apartado> {
    const { data, error } = await supabase
      .from('apartados')
      .update({ 
        estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Cancelar apartado
  async cancelar(id: number): Promise<Apartado> {
    return this.updateEstado(id, 'cancelado');
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
    // Preparar datos para inserción
    const asistenciaData = {
      cliente_id: asistencia.cliente_id,
      evento_id: asistencia.evento_id,
      monto_pagado: asistencia.monto_pagado,
      apartado_id: asistencia.apartado_id || undefined,
      monto_anticipo: asistencia.monto_anticipo || 0,
      monto_restante: asistencia.monto_restante || asistencia.monto_pagado
    };

    // Usar método manual ya que necesitamos manejar campos adicionales
    return this.createManual(asistenciaData);
  },

  // Confirmar apartado y crear asistencia
  async confirmarApartado(apartadoId: number, montoRestante: number): Promise<Asistencia> {
    // Primero obtener el apartado
    const apartado = await apartadoService.getById(apartadoId);
    if (!apartado) {
      throw new Error('Apartado no encontrado');
    }

    // Crear la asistencia
    const asistenciaData: AsistenciaForm = {
      cliente_id: apartado.cliente_id,
      evento_id: apartado.evento_id,
      monto_pagado: apartado.monto_anticipo + montoRestante,
      apartado_id: apartado.id,
      monto_anticipo: apartado.monto_anticipo,
      monto_restante: montoRestante
    };

    // Crear asistencia
    const asistencia = await this.createManual(asistenciaData);

    // Actualizar estado del apartado
    await apartadoService.updateEstado(apartadoId, 'confirmado');

    return asistencia;
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