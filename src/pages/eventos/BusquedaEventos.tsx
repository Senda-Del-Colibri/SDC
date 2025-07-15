import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Calendar, 
  MapPin, 
  DollarSign,
  Users,
  RefreshCw,
  Download,
  TrendingUp,
  Target
} from 'lucide-react';
import { eventoService } from '../../services/api';
import { Button, Input, Card, Modal } from '../../components/ui';
import { EventoDetails } from '../../components/EventoDetails';
import type { Evento } from '../../types';
import { toast } from 'react-toastify';
import { exportEventosToCSV } from '../../utils/exportUtils';
import { createLocalDate } from '../../utils';

export const BusquedaEventos: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Evento[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    minGasto: '',
    maxGasto: '',
    minCobrado: '',
    maxCobrado: '',
    minPersonas: '',
    maxPersonas: '',
    fechaDesde: '',
    fechaHasta: '',
    soloRentables: false,
    soloConPerdida: false,
    soloProximos: false,
    soloPasados: false
  });

  // Query para obtener todos los eventos
  const { data: allEventos = [], isLoading } = useQuery({
    queryKey: ['eventos'],
    queryFn: eventoService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Función para realizar búsqueda
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await eventoService.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error('Error al buscar eventos');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Aplicar filtros a los resultados
  const applyFilters = (eventos: Evento[]) => {
    return eventos.filter(evento => {
      // Filtro por gasto
      if (filters.minGasto && evento.gasto < parseFloat(filters.minGasto)) return false;
      if (filters.maxGasto && evento.gasto > parseFloat(filters.maxGasto)) return false;
      
      // Filtro por total cobrado
      if (filters.minCobrado && evento.total_cobrado < parseFloat(filters.minCobrado)) return false;
      if (filters.maxCobrado && evento.total_cobrado > parseFloat(filters.maxCobrado)) return false;
      
      // Filtro por cantidad de personas
      if (filters.minPersonas && evento.cantidad_personas < parseInt(filters.minPersonas)) return false;
      if (filters.maxPersonas && evento.cantidad_personas > parseInt(filters.maxPersonas)) return false;
      
      // Filtro por fecha del evento
      if (evento.fecha_evento) {
        const fechaEvento = createLocalDate(evento.fecha_evento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (filters.fechaDesde && fechaEvento < new Date(filters.fechaDesde)) return false;
        if (filters.fechaHasta && fechaEvento > new Date(filters.fechaHasta)) return false;
        if (filters.soloProximos && fechaEvento < hoy) return false;
        if (filters.soloPasados && fechaEvento >= hoy) return false;
      } else {
        // Si no tiene fecha del evento, solo pasa si no se solicitan filtros de fecha específicos
        if (filters.soloProximos || filters.soloPasados) return false;
      }
      
      // Filtro por rentabilidad
      const ganancia = evento.total_cobrado - evento.gasto;
      if (filters.soloRentables && ganancia <= 0) return false;
      if (filters.soloConPerdida && ganancia >= 0) return false;
      
      return true;
    });
  };

  // Obtener eventos a mostrar
  const eventosToShow = searchQuery.trim() 
    ? applyFilters(searchResults)
    : applyFilters(allEventos);

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      minGasto: '',
      maxGasto: '',
      minCobrado: '',
      maxCobrado: '',
      minPersonas: '',
      maxPersonas: '',
      fechaDesde: '',
      fechaHasta: '',
      soloRentables: false,
      soloConPerdida: false,
      soloProximos: false,
      soloPasados: false
    });
  };

  // Manejar vista de detalles
  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvento(null);
  };

  // Exportar resultados a CSV
  const handleExportCSV = () => {
    if (eventosToShow.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    const filename = searchQuery 
      ? `busqueda_eventos_${searchQuery.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      : `todos_los_eventos_${new Date().toISOString().split('T')[0]}.csv`;
    
    exportEventosToCSV(eventosToShow, filename);
    toast.success(`Exportados ${eventosToShow.length} eventos a CSV`);
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return createLocalDate(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calcular estado del evento
  const getEventoStatus = (evento: Evento) => {
    const ganancia = evento.total_cobrado - evento.gasto;
    if (evento.cantidad_personas === 0) return { text: 'Sin asistentes', color: 'gray' };
    if (ganancia > 0) return { text: 'Rentable', color: 'green' };
    if (ganancia === 0) return { text: 'Equilibrio', color: 'yellow' };
    return { text: 'Con pérdida', color: 'red' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Búsqueda de Eventos</h1>
        <p className="page-subtitle">
          Ver y gestionar eventos existentes
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Búsqueda principal */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim()) {
                      handleSearch(e.target.value);
                    } else {
                      clearSearch();
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                icon={Filter}
              >
                Filtros
              </Button>
              {(searchQuery || Object.values(filters).some(v => v !== '' && v !== false)) && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    clearSearch();
                    clearFilters();
                  }}
                  icon={RefreshCw}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Filtros avanzados */}
          {showFilters && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros Avanzados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Gasto mínimo
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minGasto}
                    onChange={(e) => setFilters(prev => ({ ...prev, minGasto: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Gasto máximo
                  </label>
                  <Input
                    type="number"
                    placeholder="99999"
                    value={filters.maxGasto}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxGasto: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cobrado mínimo
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minCobrado}
                    onChange={(e) => setFilters(prev => ({ ...prev, minCobrado: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cobrado máximo
                  </label>
                  <Input
                    type="number"
                    placeholder="99999"
                    value={filters.maxCobrado}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxCobrado: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Personas mínimas
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minPersonas}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPersonas: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Personas máximas
                  </label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={filters.maxPersonas}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPersonas: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fecha desde
                  </label>
                  <Input
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fecha hasta
                  </label>
                  <Input
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.soloRentables}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      soloRentables: e.target.checked,
                      soloConPerdida: e.target.checked ? false : prev.soloConPerdida
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Solo rentables</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.soloConPerdida}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      soloConPerdida: e.target.checked,
                      soloRentables: e.target.checked ? false : prev.soloRentables
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Con pérdida</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.soloProximos}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      soloProximos: e.target.checked,
                      soloPasados: e.target.checked ? false : prev.soloPasados
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Solo próximos</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.soloPasados}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      soloPasados: e.target.checked,
                      soloProximos: e.target.checked ? false : prev.soloProximos
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Solo pasados</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Estadísticas de búsqueda */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {isSearching ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
              Buscando...
            </span>
          ) : (
            <span>
              {searchQuery ? 
                `${eventosToShow.length} resultado(s) para "${searchQuery}"` :
                `${eventosToShow.length} evento(s) total`
              }
            </span>
          )}
        </div>
        {eventosToShow.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Tabla de resultados */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
          </div>
        ) : eventosToShow.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No se encontraron eventos' : 'No hay eventos registrados'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 
                'Intenta con otros términos de búsqueda o ajusta los filtros' :
                'Comienza creando tu primer evento'
              }
            </p>
            {!searchQuery && (
              <Button icon={Calendar}>
                Crear Evento
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Financiero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asistencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventosToShow.map((evento) => {
                  const status = getEventoStatus(evento);
                  const ganancia = evento.total_cobrado - evento.gasto;
                  
                  return (
                    <tr key={evento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {evento.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {evento.id} • Creado: {formatDate(evento.created_at)}
                            {evento.fecha_evento && (
                              <span className="block text-primary-600 font-medium">
                                Evento: {formatDate(evento.fecha_evento)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-xs">{evento.ubicacion}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="w-4 h-4 text-red-500" />
                            <span>Gasto: {formatCurrency(evento.gasto)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span>Cobrado: {formatCurrency(evento.total_cobrado)}</span>
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-medium ${
                            ganancia > 0 ? 'text-green-600' : ganancia < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            <Target className="w-4 h-4" />
                            <span>Ganancia: {formatCurrency(ganancia)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">{evento.cantidad_personas}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          status.color === 'green' ? 'bg-green-100 text-green-800' :
                          status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          status.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleViewDetails(evento)}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => {
                              toast.info('Edición próximamente');
                            }}
                          >
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de detalles del evento */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedEvento ? selectedEvento.nombre : ''}
        size="lg"
      >
        {selectedEvento && <EventoDetails evento={selectedEvento} />}
      </Modal>
    </div>
  );
};