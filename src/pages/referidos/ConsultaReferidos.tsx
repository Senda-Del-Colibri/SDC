import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users, 
  ArrowRight, 
  RefreshCw, 
  UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { clienteService, referidoService } from '../../services/api';
import type { Cliente, Referido } from '../../types';
import { Card, Input, Button, LoadingSpinner } from '../../components/ui';

interface ReferidoWithDetails extends Referido {
  cliente?: Cliente;
  referido?: Cliente;
}

interface ReferidoStats {
  cliente: Cliente;
  referidos: ReferidoWithDetails[];
  totalReferidos: number;
}

export const ConsultaReferidos: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [referidosStats, setReferidosStats] = useState<ReferidoStats[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Query para obtener todos los clientes
  const { data: clientes = [], isLoading: isLoadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para obtener todos los referidos
  const { data: referidos = [], isLoading: isLoadingReferidos, refetch: refetchReferidos } = useQuery({
    queryKey: ['referidos'],
    queryFn: referidoService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Calcular estadísticas de referidos por cliente
  useEffect(() => {
    if (clientes.length > 0 && referidos.length > 0) {
      const stats: ReferidoStats[] = [];
      
      clientes.forEach(cliente => {
        const clienteReferidos = referidos.filter(ref => ref.cliente_id === cliente.id);
        
        if (clienteReferidos.length > 0) {
          stats.push({
            cliente,
            referidos: clienteReferidos,
            totalReferidos: clienteReferidos.length
          });
        }
      });

      // Ordenar por mayor cantidad de referidos
      stats.sort((a, b) => b.totalReferidos - a.totalReferidos);
      setReferidosStats(stats);
    }
  }, [clientes, referidos]);

  const handleRefresh = () => {
    refetchReferidos();
    toast.success('Datos actualizados');
  };

  const handleClienteSelect = (clienteId: number) => {
    setSelectedClienteId(selectedClienteId === clienteId ? null : clienteId);
  };

  const getClienteById = (id: number) => {
    return clientes.find(cliente => cliente.id === id);
  };

  // Filtrar resultados según búsqueda
  const filteredStats = referidosStats.filter(stat => 
    searchTerm === '' || 
    `${stat.cliente.nombre} ${stat.cliente.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.cliente.celular?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLoading = isLoadingClientes || isLoadingReferidos;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Consulta de Referidos</h1>
          <p className="page-subtitle">Ver referidos por cliente</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Consulta de Referidos</h1>
        <p className="page-subtitle">Ver referidos por cliente</p>
      </div>

      {/* Barra de búsqueda */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Búsqueda principal */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar cliente por nombre, apellidos o celular..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearching(!!e.target.value.trim());
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                icon={UserPlus}
                onClick={() => navigate('/referidos/alta')}
              >
                Nuevo Referido
              </Button>
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={handleRefresh}
              >
                Actualizar
              </Button>
              {searchTerm && (
                <Button
                  variant="secondary"
                  onClick={clearSearch}
                  icon={RefreshCw}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
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
              {searchTerm ? 
                `${filteredStats.length} resultado(s) para "${searchTerm}"` :
                `${referidosStats.length} cliente(s) con referidos`
              }
            </span>
          )}
        </div>
      </div>



      {/* Lista de clientes con referidos */}
      <Card>
        {referidosStats.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay referidos registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Cuando se registren referidos, aparecerán aquí organizados por cliente.
            </p>
            <Button
              icon={UserPlus}
              onClick={() => navigate('/referidos/alta')}
            >
              Agregar Referido
            </Button>
          </div>
        ) : filteredStats.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600 mb-4">
              No hay clientes con referidos que coincidan con "{searchTerm}".
            </p>
            <Button
              variant="secondary"
              onClick={clearSearch}
              icon={RefreshCw}
            >
              Limpiar búsqueda
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {filteredStats.map((stat) => (
              <div key={stat.cliente.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleClienteSelect(stat.cliente.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {stat.cliente.nombre} {stat.cliente.apellidos}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {stat.cliente.celular ? `📱 ${stat.cliente.celular}` : 'Sin celular'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {stat.totalReferidos} referido{stat.totalReferidos !== 1 ? 's' : ''}
                        </span>
                        <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${
                          selectedClienteId === stat.cliente.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {selectedClienteId === stat.cliente.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                      Personas referidas por {stat.cliente.nombre}:
                    </h4>
                    <div className="space-y-3">
                      {stat.referidos.map((referido) => {
                        const referidoCliente = getClienteById(referido.referido_id);
                        return (
                          <div key={referido.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {referidoCliente ? `${referidoCliente.nombre} ${referidoCliente.apellidos}` : 'Cliente no encontrado'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Referido el {formatDate(referido.created_at)}
                              </p>
                            </div>
                            {referidoCliente?.celular && (
                              <p className="text-xs text-gray-600">
                                📱 {referidoCliente.celular}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}; 