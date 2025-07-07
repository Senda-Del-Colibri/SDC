// Utilidades de seguridad para SDC

/**
 * Sanitiza input de usuario para prevenir XSS
 */
export const sanitizeInput = (input: string): string => {
  let previous;
  do {
    previous = input;
    input = input
      .replace(/[<>]/g, '') // Remover tags HTML básicos
      .replace(/javascript:/gi, '') // Remover javascript: URLs
      .replace(/data:/gi, '') // Remover data: URLs
      .replace(/vbscript:/gi, '') // Remover vbscript: URLs
      .replace(/on\w+=[^>]*/gi, '') // Remover atributos event handlers (más seguro)
      .replace(/['"]/g, '') // Remover comillas peligrosas
      .trim();
  } while (input !== previous);
  return input;
};

/**
 * Valida email con regex segura
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Valida teléfono (solo números, espacios, guiones, paréntesis)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.length <= 20;
};

/**
 * Valida nombre (solo letras, espacios, acentos)
 */
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return nameRegex.test(name) && name.length <= 100;
};

/**
 * Valida monto (solo números y punto decimal)
 */
export const validateAmount = (amount: string): boolean => {
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  return amountRegex.test(amount);
};

/**
 * Previene inyección SQL básica (aunque Supabase ya protege)
 */
export const sanitizeForDatabase = (input: string): string => {
  return input
    .replace(/['";]/g, '') // Remover comillas peligrosas
    .replace(/--/g, '') // Remover comentarios SQL
    .replace(/\/\*/g, '') // Remover comentarios de bloque
    .trim();
};

/**
 * Rate limiting simple (localStorage)
 */
export const checkRateLimit = (action: string, maxAttempts: number = 5, windowMs: number = 300000): boolean => {
  const key = `rateLimit_${action}`;
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(key) || '[]') as number[];
  
  // Filtrar intentos dentro de la ventana de tiempo
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limit excedido
  }
  
  // Agregar intento actual
  recentAttempts.push(now);
  localStorage.setItem(key, JSON.stringify(recentAttempts));
  
  return true;
};

/**
 * Genera ID seguro para sesiones
 */
export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

/**
 * Valida que el usuario esté autenticado antes de operaciones sensibles
 */
export const requireAuth = (user: { id?: string; email?: string } | null): boolean => {
  return !!(user && user.id && user.email);
}; 