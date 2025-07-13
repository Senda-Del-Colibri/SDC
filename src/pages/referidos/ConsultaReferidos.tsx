import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Users, User, ArrowRight, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
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

  // Query para obtener todos los clientes
  const { data: clientes = [], isLoading: isLoadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
  });

  // Query para obtener todos los referidos
  const { data: referidos = [], isLoading: isLoadingReferidos, refetch: refetchReferidos } = useQuery({
    queryKey: ['referidos'],
    queryFn: referidoService.getAll,
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

  if (isLoadingClientes || isLoadingReferidos) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Consulta de Referidos</h1>
          <p className="page-subtitle">Ver referidos por cliente</p>
        </div>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Consulta de Referidos</h1>
            <p className="page-subtitle">Ver referidos por cliente</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => navigate('/referidos/alta')}
              className="shrink-0"
            >
              Nuevo Referido
            </Button>
            <Button
              variant="ghost"
              icon={RefreshCw}
              onClick={handleRefresh}
              className="shrink-0"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Referidos</p>
              <p className="text-2xl font-bold text-gray-900">{referidos.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes con Referidos</p>
              <p className="text-2xl font-bold text-gray-900">{referidosStats.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio por Cliente</p>
              <p className="text-2xl font-bold text-gray-900">
                {referidosStats.length > 0 ? (referidos.length / referidosStats.length).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

             {/* Búsqueda */}
       <Card className="p-6">
         <div className="flex items-center space-x-4">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Input
               type="text"
               placeholder="Buscar cliente por nombre, apellidos o celular..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10"
             />
           </div>
         </div>
       </Card>

      {/* Nota informativa */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm text-green-800">
              <strong>Nota:</strong> Una persona puede ser referida por múltiples clientes diferentes. 
              Esta vista muestra quién ha hecho referidos, no quién ha sido referido.
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de clientes con referidos */}
      {referidosStats.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay referidos registrados
          </h3>
          <p className="text-gray-600">
            Cuando se registren referidos, aparecerán aquí organizados por cliente.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {referidosStats
            .filter(stat => 
              searchTerm === '' || 
              `${stat.cliente.nombre} ${stat.cliente.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
              stat.cliente.celular?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((stat) => (
              <Card key={stat.cliente.id} className="overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleClienteSelect(stat.cliente.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {stat.cliente.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {stat.cliente.nombre} {stat.cliente.apellidos}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {stat.cliente.celular && `📱 ${stat.cliente.celular}`}
                        </p>
                      </div>
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
                          <div key={referido.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {referidoCliente?.nombre.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {referidoCliente ? `${referidoCliente.nombre} ${referidoCliente.apellidos}` : 'Cliente no encontrado'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Referido el {new Date(referido.created_at).toLocaleDateString('es-ES')}
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
              </Card>
            ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {searchTerm && referidosStats.filter(stat => 
        `${stat.cliente.nombre} ${stat.cliente.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.cliente.celular?.toLowerCase().includes(searchTerm.toLowerCase())
      ).length === 0 && (
        <Card className="p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-600">
            No hay clientes con referidos que coincidan con "{searchTerm}".
          </p>
        </Card>
      )}
    </div>
  );
}; 