import type { Cliente, Evento, Asistencia } from '../types';

// Función para convertir datos a CSV
export const convertToCSV = (data: Record<string, unknown>[], headers: string[]): string => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Función para descargar CSV
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Exportar clientes a CSV
export const exportClientesToCSV = (clientes: Cliente[], filename?: string): void => {
  const headers = [
    'id',
    'nombre',
    'apellidos', 
    'celular',
    'visitas',
    'monto_acumulado',
    'comentarios',
    'created_at'
  ];
  
  const csvData = clientes.map(cliente => ({
    id: cliente.id,
    nombre: cliente.nombre,
    apellidos: cliente.apellidos,
    celular: cliente.celular || '',
    visitas: cliente.visitas,
    monto_acumulado: cliente.monto_acumulado.toFixed(2),
    comentarios: cliente.comentarios || '',
    created_at: new Date(cliente.created_at).toLocaleDateString('es-MX')
  }));
  
  const csvContent = convertToCSV(csvData, headers);
  const defaultFilename = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename || defaultFilename);
};

// Exportar eventos a CSV
export const exportEventosToCSV = (eventos: Evento[], filename?: string): void => {
  const headers = [
    'id',
    'nombre',
    'ubicacion',
    'fecha_evento',
    'gasto',
    'total_cobrado',
    'cantidad_personas',
    'created_at'
  ];
  
  const csvData = eventos.map(evento => ({
    id: evento.id,
    nombre: evento.nombre,
    ubicacion: evento.ubicacion,
    fecha_evento: evento.fecha_evento ? new Date(evento.fecha_evento).toLocaleDateString('es-MX') : '',
    gasto: evento.gasto.toFixed(2),
    total_cobrado: evento.total_cobrado.toFixed(2),
    cantidad_personas: evento.cantidad_personas,
    created_at: new Date(evento.created_at).toLocaleDateString('es-MX')
  }));
  
  const csvContent = convertToCSV(csvData, headers);
  const defaultFilename = `eventos_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename || defaultFilename);
};

// Exportar asistencias a CSV
export const exportAsistenciasToCSV = (asistencias: Asistencia[], filename?: string): void => {
  const headers = [
    'id',
    'cliente_id',
    'evento_id',
    'monto_pagado',
    'created_at'
  ];
  
  const csvData = asistencias.map(asistencia => ({
    id: asistencia.id,
    cliente_id: asistencia.cliente_id,
    evento_id: asistencia.evento_id,
    monto_pagado: asistencia.monto_pagado.toFixed(2),
    created_at: new Date(asistencia.created_at).toLocaleDateString('es-MX')
  }));
  
  const csvContent = convertToCSV(csvData, headers);
  const defaultFilename = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename || defaultFilename);
}; 