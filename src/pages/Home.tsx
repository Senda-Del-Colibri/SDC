import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Search, 
  Calendar, 
  List, 
  Users, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '../services/api';
import { Card, CardBody } from '../components/ui';

const dashboardCards = [
  {
    title: 'Alta de Clientes',
    description: 'Registrar nuevos clientes',
    href: '/clientes/alta',
    icon: User,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Búsqueda de Clientes',
    description: 'Buscar y gestionar clientes',
    href: '/clientes/busqueda',
    icon: Search,
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Alta de Eventos',
    description: 'Crear nuevos eventos',
    href: '/eventos/alta',
    icon: Calendar,
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Búsqueda de Eventos',
    description: 'Ver y gestionar eventos',
    href: '/eventos/busqueda',
    icon: List,
    color: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Consulta de Referidos',
    description: 'Ver referidos por cliente',
    href: '/referidos/consulta',
    icon: Users,
    color: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Registrar Asistencia',
    description: 'Registrar asistencia a eventos',
    href: '/asistencias/alta',
    icon: CheckCircle,
    color: 'from-indigo-500 to-indigo-600'
  }
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsService.getDashboardStats,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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

      {/* Tarjetas de navegación */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.href}
                className="dashboard-card group"
                onClick={() => navigate(card.href)}
              >
                <CardBody>
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {card.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                    <span className="mr-2">Acceder</span>
                    <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
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