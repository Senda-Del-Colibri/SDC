import React from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  Clock,
  TrendingUp
} from 'lucide-react';
import type { Cliente } from '../types';
import { Card, CardHeader, CardBody } from './ui';

interface ClienteDetailsProps {
  cliente: Cliente;
}

export const ClienteDetails: React.FC<ClienteDetailsProps> = ({ cliente }) => {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular promedio por visita
  const promedioPerVisita = cliente.visitas > 0 ? cliente.monto_acumulado / cliente.visitas : 0;

  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Información Personal
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nombre Completo
              </label>
              <p className="text-lg font-medium text-gray-900">
                {cliente.nombre} {cliente.apellidos}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                ID Cliente
              </label>
              <p className="text-lg font-mono text-primary-600">
                #{cliente.id}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Teléfono Celular
              </label>
              {cliente.celular ? (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{cliente.celular}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">No registrado</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Fecha de Registro
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{formatDate(cliente.created_at)}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Estadísticas
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{cliente.visitas}</p>
              <p className="text-sm text-gray-600">Visitas Totales</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(cliente.monto_acumulado)}</p>
              <p className="text-sm text-gray-600">Monto Acumulado</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(promedioPerVisita)}</p>
              <p className="text-sm text-gray-600">Promedio por Visita</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Comentarios */}
      {cliente.comentarios && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              Comentarios
            </h3>
          </CardHeader>
          <CardBody>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{cliente.comentarios}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Métricas Adicionales */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Métricas de Fidelidad
          </h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Nivel de Actividad</span>
                <span className="text-sm text-gray-900">
                  {cliente.visitas === 0 ? 'Nuevo' : 
                   cliente.visitas <= 2 ? 'Ocasional' : 
                   cliente.visitas <= 5 ? 'Regular' : 
                   cliente.visitas <= 10 ? 'Frecuente' : 'VIP'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    cliente.visitas === 0 ? 'bg-gray-400 w-1/12' :
                    cliente.visitas <= 2 ? 'bg-yellow-400 w-2/12' :
                    cliente.visitas <= 5 ? 'bg-blue-400 w-5/12' :
                    cliente.visitas <= 10 ? 'bg-green-400 w-8/12' : 'bg-purple-400 w-full'
                  }`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Valor del Cliente</p>
                <p className="text-lg font-semibold text-gray-900">
                  {cliente.monto_acumulado >= 5000 ? 'Alto' :
                   cliente.monto_acumulado >= 2000 ? 'Medio' :
                   cliente.monto_acumulado >= 500 ? 'Bajo' : 'Nuevo'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Días desde registro</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(cliente.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}; 