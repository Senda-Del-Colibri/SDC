import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  MapPin, 
  DollarSign,
  RefreshCw,
  Download,
  CheckCircle,
  User
} from 'lucide-react';
import { eventoService, asistenciaService } from '../../services/api';
import { Button, Input, Card, Modal } from '../../components/ui';
import type { Evento } from '../../types';
import { toast } from 'react-toastify';
import { formatCurrency, createLocalDate } from '../../utils';

// Interface para asistencias con relaciones
interface AsistenciaWithCliente {
  id: number;
  cliente_id: number;
  evento_id: number;
  monto_pagado: number;
  apartado_id?: number;
  monto_anticipo: number;
  monto_restante: number;
  created_at: string;
  cliente?: {
    id: number;
    nombre: string;
    apellidos: string;
    celular?: string;
  };
}

export const ConsultaAsistencias: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Evento[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [asistencias, setAsistencias] = useState<AsistenciaWithCliente[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: ''
  });

  // Query para obtener todos los eventos
  const { data: allEventos = [], isLoading } = useQuery({
    queryKey: ['eventos'],
    queryFn: eventoService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Filtrar solo eventos finalizados
  const eventosFinalizados = allEventos.filter((evento: Evento) => {
    if (!evento.fecha_evento) return false;
    const eventoDate = createLocalDate(evento.fecha_evento);
    const now = new Date();
    return eventoDate <= now;
  });

  // Función para filtrar eventos
  const filteredEventos = eventosFinalizados.filter((evento: Evento) => {
    const matchesSearch = !searchQuery || 
      evento.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evento.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());

    const eventoDate = evento.fecha_evento ? new Date(evento.fecha_evento) : null;
    
    let matchesDateRange = true;
    if (filters.fechaDesde) {
      const fechaDesde = createLocalDate(filters.fechaDesde);
      matchesDateRange = matchesDateRange && eventoDate !== null && eventoDate >= fechaDesde;
    }
    if (filters.fechaHasta) {
      const fechaHasta = createLocalDate(filters.fechaHasta);
      matchesDateRange = matchesDateRange && eventoDate !== null && eventoDate <= fechaHasta;
    }

    return matchesSearch && matchesDateRange;
  });

  const displayedEventos = isSearching ? searchResults : filteredEventos;

  const handleSearch = () => {
    setIsSearching(true);
    const filteredResults = eventosFinalizados.filter((evento: Evento) => 
      evento.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evento.ubicacion.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredResults);
    setTimeout(() => setIsSearching(false), 300);
  };

  const resetFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleViewDetails = async (evento: Evento) => {
    setSelectedEvento(evento);
    setLoadingData(true);
    setIsModalOpen(true);

    try {
      const asistenciasData = await asistenciaService.getByEventoId(evento.id);
      setAsistencias(asistenciasData);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      toast.error('Error al cargar las asistencias del evento');
    } finally {
      setLoadingData(false);
    }
  };

  const exportToCSV = () => {
    if (!selectedEvento || asistencias.length === 0) return;

    let csvContent = 'Cliente,Contacto,Monto Pagado,Anticipo,Restante,Origen,Fecha\n';
    asistencias.forEach((asistencia) => {
      csvContent += `"${asistencia.cliente?.nombre || 'N/A'}","${asistencia.cliente?.celular || 'N/A'}","${formatCurrency(asistencia.monto_pagado)}","${formatCurrency(asistencia.monto_anticipo || 0)}","${formatCurrency(asistencia.monto_restante || 0)}","${asistencia.apartado_id ? 'Apartado' : 'Directo'}","${new Date(asistencia.created_at).toLocaleDateString()}"\n`;
    });

    const filename = `asistencias_${selectedEvento.nombre}_${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Consulta Asistencias</h1>
        <div className="text-sm text-gray-500">
          Solo eventos finalizados
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nombre del evento o ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                icon={Filter}
              >
                Filtros
              </Button>
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha desde
                  </label>
                  <Input
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha hasta
                  </label>
                  <Input
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={resetFilters}
                    icon={RefreshCw}
                    className="w-full"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de eventos finalizados */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Eventos Finalizados ({displayedEventos.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedEventos.map((evento: Evento) => {
              const eventoDate = evento.fecha_evento ? createLocalDate(evento.fecha_evento) : null;
              
              return (
                <div
                  key={evento.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{evento.nombre}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Finalizado
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{evento.ubicacion}</span>
                        </div>
                        {eventoDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{eventoDate.toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(evento.gasto)}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Consultar asistencias para este evento
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(evento)}
                        icon={Eye}
                      >
                        Ver Asistencias
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {displayedEventos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {eventosFinalizados.length === 0 
                  ? 'No hay eventos finalizados disponibles.' 
                  : 'No se encontraron eventos que coincidan con los criterios de búsqueda.'
                }
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal de asistencias */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvento ? `Asistencias: ${selectedEvento.nombre}` : 'Asistencias del evento'}
      >
        <div className="space-y-4">
          {selectedEvento && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Ubicación:</span> {selectedEvento.ubicacion}
                </div>
                <div>
                  <span className="font-medium">Gasto:</span> {formatCurrency(selectedEvento.gasto)}
                </div>
                {selectedEvento.fecha_evento && (
                  <div>
                    <span className="font-medium">Fecha:</span> {createLocalDate(selectedEvento.fecha_evento).toLocaleDateString()}
                  </div>
                )}
                <div>
                  <span className="font-medium">Estado:</span> Finalizado
                </div>
              </div>
            </div>
          )}

          {loadingData ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {asistencias.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Asistencias ({asistencias.length})</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={exportToCSV}
                      icon={Download}
                    >
                      Exportar CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto Pagado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Anticipo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Restante</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {asistencias.map((asistencia) => (
                          <tr key={asistencia.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{asistencia.cliente?.nombre || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{asistencia.cliente?.celular || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(asistencia.monto_pagado)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(asistencia.monto_anticipo || 0)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(asistencia.monto_restante || 0)}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                asistencia.apartado_id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {asistencia.apartado_id ? 'Apartado' : 'Directo'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {new Date(asistencia.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay asistencias registradas para este evento.</p>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}; 