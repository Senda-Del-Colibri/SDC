import React from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Clock,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';
import type { Evento } from '../types';
import { Card, CardHeader, CardBody } from './ui';

interface EventoDetailsProps {
  evento: Evento;
}

export const EventoDetails: React.FC<EventoDetailsProps> = ({ evento }) => {
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

  // Calcular ganancia/pérdida
  const ganancia = evento.total_cobrado - evento.gasto;
  const margenGanancia = evento.total_cobrado > 0 ? (ganancia / evento.total_cobrado) * 100 : 0;

  // Calcular promedio por persona
  const promedioPorPersona = evento.cantidad_personas > 0 ? evento.total_cobrado / evento.cantidad_personas : 0;

  // Determinar estado del evento
  const getEstadoEvento = () => {
    if (evento.cantidad_personas === 0) return { texto: 'Sin asistentes', color: 'gray' };
    if (ganancia > 0) return { texto: 'Rentable', color: 'green' };
    if (ganancia === 0) return { texto: 'Punto de equilibrio', color: 'yellow' };
    return { texto: 'Con pérdida', color: 'red' };
  };

  const estadoEvento = getEstadoEvento();

  return (
    <div className="space-y-6">
      {/* Información General */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Información General
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nombre del Evento
              </label>
              <p className="text-lg font-medium text-gray-900">
                {evento.nombre}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                ID Evento
              </label>
              <p className="text-lg font-mono text-primary-600">
                #{evento.id}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ubicación
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{evento.ubicacion}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Fecha de Creación
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{formatDate(evento.created_at)}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estadísticas Financieras */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Estadísticas Financieras
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(evento.gasto)}</p>
              <p className="text-sm text-gray-600">Gasto Total</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(evento.total_cobrado)}</p>
              <p className="text-sm text-gray-600">Total Cobrado</p>
            </div>
            <div className="text-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-3 ${
                ganancia > 0 ? 'bg-green-100' : ganancia < 0 ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <BarChart3 className={`w-6 h-6 ${
                  ganancia > 0 ? 'text-green-600' : ganancia < 0 ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <p className={`text-2xl font-bold ${
                ganancia > 0 ? 'text-green-600' : ganancia < 0 ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {formatCurrency(ganancia)}
              </p>
              <p className="text-sm text-gray-600">Ganancia/Pérdida</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(promedioPorPersona)}</p>
              <p className="text-sm text-gray-600">Promedio por Persona</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estadísticas de Asistencia */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Estadísticas de Asistencia
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{evento.cantidad_personas}</p>
              <p className="text-sm text-gray-600">Personas Asistentes</p>
            </div>
            <div className="text-center">
              <div className={`flex items-center justify-center w-16 h-16 rounded-lg mx-auto mb-4 ${
                estadoEvento.color === 'green' ? 'bg-green-100' :
                estadoEvento.color === 'yellow' ? 'bg-yellow-100' :
                estadoEvento.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <Target className={`w-8 h-8 ${
                  estadoEvento.color === 'green' ? 'text-green-600' :
                  estadoEvento.color === 'yellow' ? 'text-yellow-600' :
                  estadoEvento.color === 'red' ? 'text-red-600' : 'text-gray-600'
                }`} />
              </div>
              <p className={`text-xl font-bold ${
                estadoEvento.color === 'green' ? 'text-green-600' :
                estadoEvento.color === 'yellow' ? 'text-yellow-600' :
                estadoEvento.color === 'red' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {estadoEvento.texto}
              </p>
              <p className="text-sm text-gray-600">Estado del Evento</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Análisis de Rentabilidad */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Análisis de Rentabilidad
          </h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Margen de Ganancia</span>
                <span className={`text-sm font-medium ${
                  margenGanancia > 0 ? 'text-green-600' : margenGanancia < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {margenGanancia.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    margenGanancia > 0 ? 'bg-green-400' : margenGanancia < 0 ? 'bg-red-400' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(Math.abs(margenGanancia), 100)}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Eficiencia</p>
                <p className="text-lg font-semibold text-gray-900">
                  {evento.cantidad_personas > 0 ? 
                    (evento.total_cobrado > evento.gasto ? 'Alta' : 'Media') : 
                    'Baja'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ROI (Retorno de Inversión)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {evento.gasto > 0 ? 
                    `${((evento.total_cobrado - evento.gasto) / evento.gasto * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recomendaciones */}
      {evento.cantidad_personas > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Recomendaciones
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm">
              {ganancia > 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    Evento exitoso financieramente. Considera replicar este formato.
                  </p>
                </div>
              )}
              {ganancia < 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    Revisar estrategia de precios o reducir gastos para futuros eventos similares.
                  </p>
                </div>
              )}
              {evento.cantidad_personas < 5 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    Baja asistencia. Considera mejorar la promoción o ajustar horarios.
                  </p>
                </div>
              )}
              {promedioPorPersona > 500 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    Alto valor por persona. Evento premium con buen retorno.
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}; 