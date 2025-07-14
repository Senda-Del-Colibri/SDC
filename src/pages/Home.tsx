import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  TrendingUp,
  DollarSign,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { statsService, eventoService } from '../services/api';
import { Card, CardBody } from '../components/ui';



export const Home: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsService.getDashboardStats,
  });

  const { data: proximoEvento, isLoading: isLoadingProximo } = useQuery({
    queryKey: ['proximo-evento'],
    queryFn: eventoService.getProximoEvento,
  });

  const { data: ultimosEventos, isLoading: isLoadingUltimos } = useQuery({
    queryKey: ['ultimos-eventos'],
    queryFn: () => eventoService.getUltimosEventosFinalizados(3),
    enabled: !proximoEvento && !isLoadingProximo, // Solo ejecutar si no hay próximo evento
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Bienvenido al sistema de gestión Senda del Colibrí
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardBody>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card className="border-l-4 border-l-blue-500">
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_clientes}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CalendarDays className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_eventos}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Asistencias</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_asistencias}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.ingresos_totales)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Error al cargar estadísticas</p>
          </div>
        )}
      </div>

      {/* Sección de Eventos */}
      <div>
        {isLoadingProximo || isLoadingUltimos ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : proximoEvento ? (
          // Mostrar próximo evento
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Próximo Evento</h2>
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-green-100">
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-200 rounded-lg">
                      <Calendar className="w-8 h-8 text-green-700" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-green-900">{proximoEvento.nombre}</h3>
                      <p className="text-green-700 mb-2">{proximoEvento.ubicacion}</p>
                      {proximoEvento.fecha_evento && (
                        <p className="text-sm text-green-600 font-medium">
                          📅 {formatDate(proximoEvento.fecha_evento)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 mb-1">Gasto estimado</p>
                    <p className="text-lg font-bold text-green-800">{formatCurrency(proximoEvento.gasto)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : ultimosEventos && ultimosEventos.length > 0 ? (
          // Mostrar últimos eventos finalizados
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Últimos Eventos Finalizados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ultimosEventos.map((evento) => (
                <Card key={evento.id} className="border-l-4 border-l-blue-500">
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900">{evento.nombre}</h3>
                          <p className="text-sm text-gray-600">{evento.ubicacion}</p>
                        </div>
                      </div>
                    </div>
                    {evento.fecha_evento && (
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        📅 {formatDate(evento.fecha_evento)}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Asistentes</p>
                        <p className="font-medium">{evento.cantidad_personas}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Ingresos</p>
                        <p className="font-medium text-green-600">{formatCurrency(evento.total_cobrado)}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // No hay eventos
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Eventos</h2>
            <Card className="border-l-4 border-l-gray-400">
              <CardBody>
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos programados</h3>
                  <p className="text-gray-600 mb-4">Crea tu primer evento para comenzar</p>
                  <button
                    onClick={() => navigate('/eventos/alta')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Crear Evento
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <CardBody>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary-200 rounded-lg flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Sistema de Gestión Integral
              </h3>
              <p className="text-primary-800 leading-relaxed">
                Este sistema permite gestionar de manera integral todos los aspectos del centro de meditación: 
                desde el registro de clientes y eventos, hasta el seguimiento de asistencias y referidos. 
                Todas las estadísticas se actualizan automáticamente para brindar información en tiempo real.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}; 