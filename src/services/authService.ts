import { supabase } from './supabase';
import type { User } from '../types';

export class AuthService {
  // Iniciar sesión
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
          user_metadata: data.user.user_metadata
        } : null,
        error: null 
      };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Error de autenticación' };
    }
  }

  // Registrar usuario
  static async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
          user_metadata: data.user.user_metadata
        } : null,
        error: null 
      };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Error de registro' };
    }
  }

  // Cerrar sesión
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Error al cerrar sesión' };
    }
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
        user_metadata: user.user_metadata
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Verificar si hay sesión activa
  static async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Suscribirse a cambios de autenticación
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_, session) => {
      const user = session?.user ? {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at,
        user_metadata: session.user.user_metadata
      } : null;
      
      callback(user);
    });
  }
} 