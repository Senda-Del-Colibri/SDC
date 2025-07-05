import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  UserPlus, 
  Phone, 
  Calendar,
  DollarSign,
  Users,
  RefreshCw
} from 'lucide-react';
import { clienteService } from '../../services/api';
import { Button, Input, Card, LoadingSpinner } from '../../components/ui';
import type { Cliente } from '../../types';
import { toast } from 'react-toastify';

export const BusquedaClientes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minVisitas: '',
    maxVisitas: '',
    minMonto: '',
    maxMonto: '',
    conCelular: false,
    sinCelular: false
  });

  // Query para obtener todos los clientes
  const { data: allClientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
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
      const results = await clienteService.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error('Error al buscar clientes');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Aplicar filtros a los resultados
  const applyFilters = (clientes: Cliente[]) => {
    return clientes.filter(cliente => {
      // Filtro por número de visitas
      if (filters.minVisitas && cliente.visitas < parseInt(filters.minVisitas)) return false;
      if (filters.maxVisitas && cliente.visitas > parseInt(filters.maxVisitas)) return false;
      
      // Filtro por monto acumulado
      if (filters.minMonto && cliente.monto_acumulado < parseFloat(filters.minMonto)) return false;
      if (filters.maxMonto && cliente.monto_acumulado > parseFloat(filters.maxMonto)) return false;
      
      // Filtro por celular
      if (filters.conCelular && !cliente.celular) return false;
      if (filters.sinCelular && cliente.celular) return false;
      
      return true;
    });
  };

  // Obtener clientes a mostrar
  const clientesToShow = searchQuery.trim() 
    ? applyFilters(searchResults)
    : applyFilters(allClientes);

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      minVisitas: '',
      maxVisitas: '',
      minMonto: '',
      maxMonto: '',
      conCelular: false,
      sinCelular: false
    });
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
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Búsqueda de Clientes</h1>
        <p className="page-subtitle">
          Buscar y gestionar clientes existentes
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
                  placeholder="Buscar por nombre, apellidos o celular..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Visitas mínimas
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minVisitas}
                    onChange={(e) => setFilters(prev => ({ ...prev, minVisitas: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Visitas máximas
                  </label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={filters.maxVisitas}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxVisitas: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Monto mínimo
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minMonto}
                    onChange={(e) => setFilters(prev => ({ ...prev, minMonto: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Monto máximo
                  </label>
                  <Input
                    type="number"
                    placeholder="99999"
                    value={filters.maxMonto}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxMonto: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.conCelular}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      conCelular: e.target.checked,
                      sinCelular: e.target.checked ? false : prev.sinCelular
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Con celular</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.sinCelular}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      sinCelular: e.target.checked,
                      conCelular: e.target.checked ? false : prev.conCelular
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Sin celular</span>
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
              <LoadingSpinner size="sm" />
              Buscando...
            </span>
          ) : (
            <span>
              {searchQuery ? 
                `${clientesToShow.length} resultado(s) para "${searchQuery}"` :
                `${clientesToShow.length} cliente(s) total`
              }
            </span>
          )}
        </div>
      </div>

      {/* Tabla de resultados */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : clientesToShow.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 
                'Intenta con otros términos de búsqueda o ajusta los filtros' :
                'Comienza agregando tu primer cliente'
              }
            </p>
            {!searchQuery && (
              <Button icon={UserPlus}>
                Agregar Cliente
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesToShow.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.nombre} {cliente.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {cliente.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cliente.celular ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {cliente.celular}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin celular</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{cliente.visitas} visitas</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span>{formatCurrency(cliente.monto_acumulado)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(cliente.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            // TODO: Implementar vista de detalles
                            toast.info('Vista de detalles próximamente');
                          }}
                        >
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => {
                            // TODO: Implementar edición
                            toast.info('Edición próximamente');
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}; 