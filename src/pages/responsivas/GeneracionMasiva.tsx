import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Filter, 
  Download, 
  ArrowLeft,
  CheckCircle,
  User
} from 'lucide-react';
import { clienteService, eventoService, asistenciaService } from '../../services/api';
import { Button, Input, Card, LoadingSpinner } from '../../components/ui';
import { generarCartasResponsivasMasivas } from '../../utils/pdfGenerator';
import type { Cliente } from '../../types';
import { toast } from 'react-toastify';
import { createLocalDate } from '../../utils';

type TipoDescarga = 'evento' | 'fechas' | 'clientes' | 'todos';

export const GeneracionMasiva: React.FC = () => {
  const navigate = useNavigate();
  const [tipoDescarga, setTipoDescarga] = useState<TipoDescarga>('evento');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [clientesSeleccionados, setClientesSeleccionados] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Queries para obtener datos
  const { data: eventos = [], isLoading: loadingEventos } = useQuery({
    queryKey: ['eventos'],
    queryFn: eventoService.getAll
  });

  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll
  });

  const { data: asistencias = [], isLoading: loadingAsistencias } = useQuery({
    queryKey: ['asistencias'],
    queryFn: asistenciaService.getAll
  });

  // Filtrar clientes según búsqueda
  const clientesFiltrados = clientes.filter(cliente => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(searchTerm) ||
      cliente.apellidos.toLowerCase().includes(searchTerm) ||
      cliente.celular?.toLowerCase().includes(searchTerm)
    );
  });

  const handleToggleCliente = (clienteId: number) => {
    setClientesSeleccionados(prev => 
      prev.includes(clienteId) 
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId]
    );
  };

  const handleSelectAllClientes = () => {
    if (clientesSeleccionados.length === clientesFiltrados.length) {
      setClientesSeleccionados([]);
    } else {
      setClientesSeleccionados(clientesFiltrados.map(c => c.id));
    }
  };

  const obtenerClientesParaDescarga = (): Cliente[] => {
    switch (tipoDescarga) {
      case 'evento': {
        if (!eventoSeleccionado) return [];
        const asistenciasEvento = asistencias.filter(a => a.evento_id === parseInt(eventoSeleccionado));
        const clienteIds = asistenciasEvento.map(a => a.cliente_id);
        return clientes.filter(c => clienteIds.includes(c.id));
      }
      
      case 'fechas': {
        if (!fechaInicio || !fechaFin) return [];
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const asistenciasFecha = asistencias.filter(a => {
          const fechaAsistencia = new Date(a.created_at);
          return fechaAsistencia >= inicio && fechaAsistencia <= fin;
        });
        const clienteIdsFecha = asistenciasFecha.map(a => a.cliente_id);
        return clientes.filter(c => clienteIdsFecha.includes(c.id));
      }
      
      case 'clientes': {
        return clientes.filter(c => clientesSeleccionados.includes(c.id));
      }
      
      case 'todos': {
        return clientes;
      }
      
      default:
        return [];
    }
  };

  const handleGenerarCartas = () => {
    const clientesParaDescarga = obtenerClientesParaDescarga();
    
    if (clientesParaDescarga.length === 0) {
      toast.error('No hay clientes seleccionados para generar cartas');
      return;
    }

    try {
      generarCartasResponsivasMasivas(clientesParaDescarga);
      toast.success(`Generando ${clientesParaDescarga.length} cartas responsivas...`);
    } catch (error) {
      toast.error('Error al generar las cartas responsivas');
      console.error('Error:', error);
    }
  };

  const clientesParaDescarga = obtenerClientesParaDescarga();

  if (loadingEventos || loadingClientes || loadingAsistencias) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/responsivas')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Generación Masiva
              </h1>
              <p className="text-gray-600 mt-1">
                Genera múltiples cartas responsivas según diferentes criterios
              </p>
            </div>
          </div>
          <Users className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      {/* Opciones de descarga */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona el tipo de descarga
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setTipoDescarga('evento')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoDescarga === 'evento'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-sm font-medium">Por Evento</div>
          </button>
          
          <button
            onClick={() => setTipoDescarga('fechas')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoDescarga === 'fechas'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Filter className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-sm font-medium">Por Fechas</div>
          </button>
          
          <button
            onClick={() => setTipoDescarga('clientes')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoDescarga === 'clientes'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-sm font-medium">Clientes Específicos</div>
          </button>
          
          <button
            onClick={() => setTipoDescarga('todos')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoDescarga === 'todos'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <div className="text-sm font-medium">Todos los Clientes</div>
          </button>
        </div>
      </Card>

      {/* Filtros según tipo seleccionado */}
      {tipoDescarga === 'evento' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selecciona un evento
          </h3>
          <select
            value={eventoSeleccionado}
            onChange={(e) => setEventoSeleccionado(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecciona un evento...</option>
            {eventos.map(evento => (
              <option key={evento.id} value={evento.id.toString()}>
                {evento.nombre} - {evento.ubicacion}
                {evento.fecha_evento && ` (${createLocalDate(evento.fecha_evento).toLocaleDateString('es-MX')})`}
              </option>
            ))}
          </select>
        </Card>
      )}

      {tipoDescarga === 'fechas' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selecciona rango de fechas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de inicio
              </label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de fin
              </label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {tipoDescarga === 'clientes' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Selecciona clientes específicos
            </h3>
            <Button
              variant="secondary"
              onClick={handleSelectAllClientes}
            >
              {clientesSeleccionados.length === clientesFiltrados.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </Button>
          </div>
          
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Buscar clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {clientesFiltrados.map(cliente => (
              <div
                key={cliente.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  clientesSeleccionados.includes(cliente.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleCliente(cliente.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={clientesSeleccionados.includes(cliente.id)}
                      onChange={() => handleToggleCliente(cliente.id)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium">
                        {cliente.nombre} {cliente.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cliente.celular} • {cliente.visitas} visita(s)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resumen y botón de descarga */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Resumen de descarga
            </h3>
            <p className="text-gray-600 mt-1">
              Se generarán {clientesParaDescarga.length} cartas responsivas
            </p>
          </div>
          <Button
            onClick={handleGenerarCartas}
            disabled={clientesParaDescarga.length === 0}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Generar Cartas ({clientesParaDescarga.length})</span>
          </Button>
        </div>
        
        {clientesParaDescarga.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Clientes incluidos:
            </h4>
            <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
              {clientesParaDescarga.map(cliente => (
                <div key={cliente.id} className="flex items-center space-x-2 mb-1">
                  <User className="h-3 w-3" />
                  <span>{cliente.nombre} {cliente.apellidos}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}; 