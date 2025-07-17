/**
 * Utilidad para extraer mensajes de error específicos y legibles
 */
export function getErrorMessage(error: unknown): string {
  console.error('Error details:', error);
  console.error('Error type:', typeof error);
  console.error('Error stringified:', JSON.stringify(error, null, 2));

  if (error instanceof Error) {
    const errorMessage = error.message;
    
    // Errores específicos de base de datos
    if (errorMessage.includes('duplicate key value') || errorMessage.includes('unique constraint')) {
      if (errorMessage.includes('apartados_cliente_evento_unique')) {
        return 'Este cliente ya tiene un lugar apartado para este evento.';
      }
      return 'Ya existe un registro con estos datos.';
    }
    
    if (errorMessage.includes('foreign key constraint')) {
      if (errorMessage.includes('cliente_id')) {
        return 'El cliente seleccionado no existe.';
      }
      if (errorMessage.includes('evento_id')) {
        return 'El evento seleccionado no existe.';
      }
      return 'Error de integridad de datos.';
    }
    
    if (errorMessage.includes('check constraint')) {
      if (errorMessage.includes('monto_anticipo')) {
        return 'El monto del anticipo debe ser mayor a 0.';
      }
      if (errorMessage.includes('monto_total_esperado')) {
        return 'El monto total esperado debe ser mayor a 0.';
      }
      if (errorMessage.includes('monto_pagado')) {
        return 'El monto pagado debe ser mayor a 0.';
      }
      return 'Los datos ingresados no cumplen con las validaciones.';
    }
    
    if (errorMessage.includes('not null constraint')) {
      return 'Todos los campos obligatorios deben ser completados.';
    }
    
    if (errorMessage.includes('apartado no encontrado') || errorMessage.includes('not found')) {
      return 'El apartado no fue encontrado.';
    }
    
    // Errores de red
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    
    // Errores de autenticación
    if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
      return 'No tienes permisos para realizar esta acción.';
    }
    
    // Devolver mensaje original si no coincide con ningún patrón
    return `Error: ${errorMessage}`;
  }
  
  // Manejar objetos de error
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    if (errorObj.message && typeof errorObj.message === 'string') {
      return getErrorMessage(new Error(errorObj.message));
    }
    
    if (errorObj.error && typeof errorObj.error === 'string') {
      return getErrorMessage(new Error(errorObj.error));
    }
    
    if (errorObj.details && typeof errorObj.details === 'string') {
      return getErrorMessage(new Error(errorObj.details));
    }
    
    // Si tiene código de error de Supabase
    if (errorObj.code) {
      return `Error de base de datos (${errorObj.code}): ${JSON.stringify(errorObj)}`;
    }
    
    return `Error: ${JSON.stringify(error)}`;
  }
  
  // Manejar strings
  if (typeof error === 'string') {
    return getErrorMessage(new Error(error));
  }
  
  return 'Error desconocido. Intenta nuevamente.';
}

/**
 * Función helper para mostrar toast de error con mensaje específico
 */
export function showErrorToast(error: unknown, defaultMessage?: string): string {
  const errorMessage = getErrorMessage(error);
  return errorMessage || defaultMessage || 'Error desconocido';
} 