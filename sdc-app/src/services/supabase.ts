import { createClient } from '@supabase/supabase-js';
import { 
  Cliente, 
  Evento, 
  Referido, 
  Asistencia, 
  ClienteDetalle, 
  EventoDetalle,
  AsistenciaDetalle,
  ClienteFormData,
  EventoFormData,
  ReferidoFormData,
  AsistenciaFormData
} from '../types';

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Servicios para Clientes
export const clientesService = {
  // Obtener todos los clientes
  getAll: async (): Promise<Cliente[]> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('apellido_paterno', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener un cliente por ID
  getById: async (id: number): Promise<Cliente | null> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener cliente con detalles (asistencias y referidos)
  getDetalleById: async (id: number): Promise<ClienteDetalle | null> => {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        asistencias:asistencias(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear un nuevo cliente
  create: async (cliente: ClienteFormData): Promise<Cliente> => {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar un cliente existente
  update: async (id: number, cliente: Partial<ClienteFormData>): Promise<Cliente> => {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar un cliente
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Servicios para Eventos
export const eventosService = {
  // Obtener todos los eventos
  getAll: async (): Promise<Evento[]> => {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha_evento', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener un evento por ID
  getById: async (id: number): Promise<Evento | null> => {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener evento con detalles (asistencias)
  getDetalleById: async (id: number): Promise<EventoDetalle | null> => {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        asistencias:asistencias(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear un nuevo evento
  create: async (evento: EventoFormData): Promise<Evento> => {
    const { data, error } = await supabase
      .from('eventos')
      .insert([evento])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar un evento existente
  update: async (id: number, evento: Partial<EventoFormData>): Promise<Evento> => {
    const { data, error } = await supabase
      .from('eventos')
      .update(evento)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar un evento
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Servicios para Referidos
export const referidosService = {
  // Obtener todos los referidos
  getAll: async (): Promise<Referido[]> => {
    const { data, error } = await supabase
      .from('referidos')
      .select('*')
      .order('fecha_referencia', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener referidos por cliente referidor
  getByReferidorId: async (id_referidor: number): Promise<Referido[]> => {
    const { data, error } = await supabase
      .from('referidos')
      .select('*')
      .eq('id_referidor', id_referidor)
      .order('fecha_referencia', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener un referido por ID
  getById: async (id: number): Promise<Referido | null> => {
    const { data, error } = await supabase
      .from('referidos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear un nuevo referido
  create: async (referido: ReferidoFormData): Promise<Referido> => {
    const { data, error } = await supabase
      .from('referidos')
      .insert([referido])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar un referido existente
  update: async (id: number, referido: Partial<ReferidoFormData>): Promise<Referido> => {
    const { data, error } = await supabase
      .from('referidos')
      .update(referido)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar estado de un referido
  updateEstado: async (id: number, estado: Referido['estado'], comentarios?: string): Promise<Referido> => {
    const { data, error } = await supabase
      .from('referidos')
      .update({ estado, comentarios })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar un referido
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('referidos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Servicios para Asistencias
export const asistenciasService = {
  // Obtener todas las asistencias
  getAll: async (): Promise<Asistencia[]> => {
    const { data, error } = await supabase
      .from('asistencias')
      .select('*')
      .order('fecha_registro', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtener asistencias por evento
  getByEventoId: async (id_evento: number): Promise<Asistencia[]> => {
    const { data, error } = await supabase
      .from('asistencias')
      .select('*')
      .eq('id_evento', id_evento);
    
    if (error) throw error;
    return data || [];
  },

  // Obtener asistencias por cliente
  getByClienteId: async (id_cliente: number): Promise<Asistencia[]> => {
    const { data, error } = await supabase
      .from('asistencias')
      .select('*')
      .eq('id_cliente', id_cliente);
    
    if (error) throw error;
    return data || [];
  },

  // Obtener asistencias con detalles de cliente y evento
  getDetalleByEventoId: async (id_evento: number): Promise<AsistenciaDetalle[]> => {
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *,
        cliente:clientes(*),
        evento:eventos(*)
      `)
      .eq('id_evento', id_evento);
    
    if (error) throw error;
    return data || [];
  },

  // Obtener una asistencia por ID
  getById: async (id: number): Promise<Asistencia | null> => {
    const { data, error } = await supabase
      .from('asistencias')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear una nueva asistencia
  create: async (asistencia: AsistenciaFormData): Promise<Asistencia> => {
    const { data, error } = await supabase
      .from('asistencias')
      .insert([asistencia])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar una asistencia existente
  update: async (id: number, asistencia: Partial<AsistenciaFormData>): Promise<Asistencia> => {
    const { data, error } = await supabase
      .from('asistencias')
      .update(asistencia)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar estado de pago de una asistencia
  updatePago: async (id: number, estado_pago: Asistencia['estado_pago'], monto_pagado: number): Promise<Asistencia> => {
    const { data, error } = await supabase
      .from('asistencias')
      .update({ estado_pago, monto_pagado })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar asistencia
  updateAsistencia: async (id: number, asistio: boolean): Promise<Asistencia> => {
    const { data, error } = await supabase
      .from('asistencias')
      .update({ asistio })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar una asistencia
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('asistencias')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export default supabase; 