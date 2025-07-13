import { createClient } from '@supabase/supabase-js';

// Estas variables deben ser configuradas en el archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Tipos para las tablas de la base de datos
export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string;
          nombre: string;
          apellidos: string;
          celular: string | null;
          comentarios: string | null;
          visitas: number;
          monto_acumulado: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          apellidos: string;
          celular?: string | null;
          comentarios?: string | null;
          visitas?: number;
          monto_acumulado?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          apellidos?: string;
          celular?: string | null;
          comentarios?: string | null;
          visitas?: number;
          monto_acumulado?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      eventos: {
        Row: {
          id: string;
          nombre: string;
          ubicacion: string;
          gasto: number;
          total_cobrado: number;
          cantidad_personas: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          ubicacion: string;
          gasto?: number;
          total_cobrado?: number;
          cantidad_personas?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          ubicacion?: string;
          gasto?: number;
          total_cobrado?: number;
          cantidad_personas?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      referidos: {
        Row: {
          id: string;
          cliente_id: string;
          referido_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          referido_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          referido_id?: string;
          created_at?: string;
        };
      };
      asistencias: {
        Row: {
          id: string;
          cliente_id: string;
          evento_id: string;
          monto_pagado: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          evento_id: string;
          monto_pagado: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          evento_id?: string;
          monto_pagado?: number;
          created_at?: string;
        };
      };
    };
  };
} 