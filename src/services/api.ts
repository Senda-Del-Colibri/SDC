import { supabase } from './supabase';
import type { 
  Cliente, 
  Evento, 
  Referido, 
  Asistencia, 
  ClienteFormData, 
  EventoFormData, 
  AsistenciaFormData, 
  ReferidoFormData,
  ClienteFilters,
  EventoFilters,
  DashboardStats
} from '../types';

// Servicios para Clientes
export class ClienteService {
  static async getAll(filters?: ClienteFilters) {
    try {
      let query = supabase.from('clientes').select('*').order('created_at', { ascending: false });

      if (filters?.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`);
      }
      if (filters?.apellidos) {
        query = query.ilike('apellidos', `%${filters.apellidos}%`);
      }
      if (filters?.celular) {
        query = query.ilike('celular', `%${filters.celular}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data as Cliente[], error: null };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Error al obtener clientes' };
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as Cliente, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al obtener cliente' };
    }
  }

  static async create(clienteData: ClienteFormData) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()
        .single();

      if (error) throw error;

      return { data: data as Cliente, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al crear cliente' };
    }
  }

  static async update(id: string, clienteData: Partial<ClienteFormData>) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({ ...clienteData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Cliente, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al actualizar cliente' };
    }
  }

  static async search(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .or(`nombre.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%`)
        .order('nombre');

      if (error) throw error;

      return { data: data as Cliente[], error: null };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Error en búsqueda' };
    }
  }
}

// Servicios para Eventos
export class EventoService {
  static async getAll(filters?: EventoFilters) {
    try {
      let query = supabase.from('eventos').select('*').order('created_at', { ascending: false });

      if (filters?.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`);
      }
      if (filters?.ubicacion) {
        query = query.ilike('ubicacion', `%${filters.ubicacion}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data as Evento[], error: null };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Error al obtener eventos' };
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as Evento, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al obtener evento' };
    }
  }

  static async create(eventoData: EventoFormData) {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .insert([eventoData])
        .select()
        .single();

      if (error) throw error;

      return { data: data as Evento, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al crear evento' };
    }
  }

  static async update(id: string, eventoData: Partial<EventoFormData>) {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .update({ ...eventoData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Evento, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al actualizar evento' };
    }
  }

  static async getWithAsistentes(id: string) {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .select(`
          *,
          cliente:clientes(*),
          evento:eventos(*)
        `)
        .eq('evento_id', id);

      if (error) throw error;

      return { data: data as Asistencia[], error: null };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Error al obtener asistentes' };
    }
  }
}

// Servicios para Referidos
export class ReferidoService {
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('referidos')
        .select(`
          *,
          cliente:clientes!cliente_id(*),
          referido:clientes!referido_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as Referido[], error: null };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Error al obtener referidos' };
    }
  }

  static async getByClienteId(clienteId: string) {
    try {
      const { data, error } = await supabase
        .from('referidos')
        .select(`
          *,
          referido:clientes!referido_id(*)
        `)
        .eq('cliente_id', clienteId);

      if (error) throw error;

      return { data: data as Referido[], error: null };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Error al obtener referidos del cliente' };
    }
  }

  static async create(referidoData: ReferidoFormData) {
    try {
      // Verificar que el cliente no se refiera a sí mismo
      if (referidoData.cliente_id === referidoData.referido_id) {
        return { data: null, error: 'Un cliente no puede referirse a sí mismo' };
      }

      const { data, error } = await supabase
        .from('referidos')
        .insert([referidoData])
        .select(`
          *,
          cliente:clientes!cliente_id(*),
          referido:clientes!referido_id(*)
        `)
        .single();

      if (error) throw error;

      return { data: data as Referido, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al crear referido' };
    }
  }
}

// Servicios para Asistencias
export class AsistenciaService {
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .select(`
          *,
          cliente:clientes(*),
          evento:eventos(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as Asistencia[], error: null };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Error al obtener asistencias' };
    }
  }

  static async create(asistenciaData: AsistenciaFormData) {
    try {
      // Verificar que el cliente no haya asistido ya a este evento
      const { data: existingAsistencia } = await supabase
        .from('asistencias')
        .select('id')
        .eq('cliente_id', asistenciaData.cliente_id)
        .eq('evento_id', asistenciaData.evento_id)
        .single();

      if (existingAsistencia) {
        return { data: null, error: 'El cliente ya está registrado en este evento' };
      }

      const { data, error } = await supabase
        .from('asistencias')
        .insert([asistenciaData])
        .select(`
          *,
          cliente:clientes(*),
          evento:eventos(*)
        `)
        .single();

      if (error) throw error;

      return { data: data as Asistencia, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al registrar asistencia' };
    }
  }
}

// Servicios para Dashboard
export class DashboardService {
  static async getStats(): Promise<{ data: DashboardStats | null; error: string | null }> {
    try {
      // Obtener estadísticas de todas las tablas
      const [clientesResult, eventosResult, referidosResult, asistenciasResult] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('eventos').select('*', { count: 'exact', head: true }),
        supabase.from('referidos').select('*', { count: 'exact', head: true }),
        supabase.from('asistencias').select('monto_pagado')
      ]);

      if (clientesResult.error || eventosResult.error || referidosResult.error || asistenciasResult.error) {
        throw new Error('Error al obtener estadísticas');
      }

      const ingresosTotales = asistenciasResult.data?.reduce((total, asistencia) => total + asistencia.monto_pagado, 0) || 0;

      const stats: DashboardStats = {
        totalClientes: clientesResult.count || 0,
        totalEventos: eventosResult.count || 0,
        totalReferidos: referidosResult.count || 0,
        totalAsistencias: asistenciasResult.data?.length || 0,
        ingresosTotales
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error al obtener estadísticas' };
    }
  }
} 