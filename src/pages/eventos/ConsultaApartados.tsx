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
  Clock,
  User
} from 'lucide-react';
import { eventoService, apartadoService } from '../../services/api';
import { Button, Input, Card, Modal } from '../../components/ui';
import type { Evento } from '../../types';
import { toast } from 'react-toastify';
import { formatCurrency, createLocalDate } from '../../utils';

// Interface para apartados con relaciones
interface ApartadoWithCliente {
  id: number;
  cliente_id: number;
  evento_id: number;
  monto_anticipo: number;
  monto_total_esperado: number;
  estado: 'apartado' | 'confirmado' | 'cancelado';
  notas?: string;
  created_at: string;
  updated_at: string;
  cliente?: {
    id: number;
    nombre: string;
    apellidos: string;
    celular?: string;
  };
}

export const ConsultaApartados: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Evento[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apartados, setApartados] = useState<ApartadoWithCliente[]>([]);
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

  // Query para obtener todos los apartados
  const { data: allApartados = [], isLoading: isLoadingApartados } = useQuery({
    queryKey: ['apartados'],
    queryFn: apartadoService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Crear un Set de IDs de eventos que tienen apartados PENDIENTES para búsqueda más eficiente
  const eventosConApartadosIds = React.useMemo(() => {
    if (isLoadingApartados || !allApartados.length) return new Set();
    
    const ids = new Set<number>();
    allApartados.forEach((apartado: ApartadoWithCliente) => {
      if (apartado && apartado.evento_id && apartado.estado === 'apartado') {
        ids.add(apartado.evento_id);
      }
    });
    
    return ids;
  }, [allApartados, isLoadingApartados]);

  // Filtrar solo eventos que tienen apartados PENDIENTES
  const eventosConApartados = React.useMemo(() => {
    if (isLoadingApartados || isLoading) return [];
    
    const filtered = allEventos.filter((evento: Evento) => {
      const hasApartadosPendientes = eventosConApartadosIds.has(evento.id);
      return hasApartadosPendientes;
    });
    
    return filtered;
  }, [allEventos, eventosConApartadosIds, isLoadingApartados, isLoading]);

  // Función para filtrar eventos
  const filteredEventos = eventosConApartados.filter((evento: Evento) => {
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
    const filteredResults = eventosConApartados.filter((evento: Evento) => 
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
      const apartadosData = await apartadoService.getByEventoId(evento.id);
      // Filtrar solo apartados pendientes
      const apartadosPendientes = apartadosData.filter(apartado => apartado.estado === 'apartado');
      setApartados(apartadosPendientes);
    } catch (error) {
      console.error('Error al cargar apartados:', error);
      toast.error('Error al cargar los apartados del evento');
    } finally {
      setLoadingData(false);
    }
  };

  const exportToCSV = () => {
    if (!selectedEvento || apartados.length === 0) return;

    let csvContent = 'Cliente,Monto Anticipo,Monto Total Esperado,Estado,Fecha\n';
    apartados.forEach((apartado) => {
      csvContent += `"${apartado.cliente?.nombre || 'N/A'}","${formatCurrency(apartado.monto_anticipo)}","${formatCurrency(apartado.monto_total_esperado)}","${apartado.estado}","${new Date(apartado.created_at).toLocaleDateString()}"\n`;
    });

    const filename = `apartados_${selectedEvento.nombre}_${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consulta Apartados
            </h1>
            <p className="text-gray-600 mt-1">
              Solo eventos con apartados pendientes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
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

                    {/* Lista de eventos */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
                            Eventos ({displayedEventos.length})
          </h2>
        </div>

        {isLoading || isLoadingApartados ? (
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
                                                  {(() => {
                            if (!evento.fecha_evento) {
                              return (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Sin fecha
                                </span>
                              );
                            }
                            const eventoDate = createLocalDate(evento.fecha_evento);
                            const now = new Date();
                            const isUpcoming = eventoDate > now;
                            
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isUpcoming ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {isUpcoming ? 'Próximo' : 'Finalizado'}
                              </span>
                            );
                          })()}
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
                        Consultar apartados para este evento
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(evento)}
                        icon={Eye}
                      >
                        Ver Apartados
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {displayedEventos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                                {eventosConApartados.length === 0
                ? 'No hay eventos con apartados pendientes disponibles.' 
                  : 'No se encontraron eventos que coincidan con los criterios de búsqueda.'
                }
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal de apartados */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvento ? `Apartados: ${selectedEvento.nombre}` : 'Apartados del evento'}
        size="xl"
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
                  <span className="font-medium">Estado:</span> {(() => {
                  if (!selectedEvento.fecha_evento) return 'Sin fecha';
                  const eventoDate = createLocalDate(selectedEvento.fecha_evento);
                  const now = new Date();
                  return eventoDate > now ? 'Próximo' : 'Finalizado';
                })()}
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
              {apartados.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Apartados ({apartados.length})</h3>
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
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Anticipo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Esperado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {apartados.map((apartado) => (
                          <tr key={apartado.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{apartado.cliente?.nombre || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(apartado.monto_anticipo)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(apartado.monto_total_esperado)}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                apartado.estado === 'apartado' ? 'bg-yellow-100 text-yellow-800' :
                                apartado.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {apartado.estado}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {new Date(apartado.created_at).toLocaleDateString()}
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
                  <p>No hay apartados para este evento.</p>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}; 