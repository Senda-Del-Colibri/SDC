import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  UserPlus,
  Plus,
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import { clienteService, eventoService, apartadoService, asistenciaService } from '../../services/api';
import type { AsistenciaForm } from '../../types';
import { Card, Button, Input, LoadingSpinner, Modal } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorHandler';
import { createLocalDate } from '../../utils';

interface ConfirmarApartadoData {
  apartadoId: number;
  montoRestante: number;
}

interface AsistenciaSinApartadoData {
  cliente_id: number;
  monto_pagado: number;
}

interface ApartadoData {
  id: number;
  cliente_id: number;
  evento_id: number;
  monto_anticipo: number;
  monto_total_esperado: number;
  estado: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export const ConfirmarAsistencia: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [eventoSeleccionado, setEventoSeleccionado] = useState<string>('');
  const [apartadoConfirmando, setApartadoConfirmando] = useState<number | null>(null);
  const [montoRestante, setMontoRestante] = useState<string>('');
  const [showModalSinApartado, setShowModalSinApartado] = useState(false);
  const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);
  const [apartadoSeleccionado, setApartadoSeleccionado] = useState<ApartadoData | null>(null);
  const [pagoCompleto, setPagoCompleto] = useState<boolean | null>(null);
  const [montoManual, setMontoManual] = useState<string>('');
  const [asistenciaSinApartado, setAsistenciaSinApartado] = useState<AsistenciaSinApartadoData>({
    cliente_id: 0,
    monto_pagado: 0
  });

  // Queries
  const { data: eventos = [], isLoading: isLoadingEventos } = useQuery({
    queryKey: ['eventos'],
    queryFn: eventoService.getAll,
  });

  const { data: clientes = [], isLoading: isLoadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
  });

  const { data: apartados = [], isLoading: isLoadingApartados } = useQuery({
    queryKey: ['apartados', eventoSeleccionado],
    queryFn: () => eventoSeleccionado ? apartadoService.getByEventoId(parseInt(eventoSeleccionado)) : Promise.resolve([]),
    enabled: !!eventoSeleccionado,
  });

  // Mutations
  const confirmarApartadoMutation = useMutation({
    mutationFn: ({ apartadoId, montoRestante }: ConfirmarApartadoData) => 
      asistenciaService.confirmarApartado(apartadoId, montoRestante),
    onSuccess: () => {
      toast.success('Asistencia confirmada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['apartados'] });
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      // Limpiar estado
      setApartadoConfirmando(null);
      setMontoRestante('');
    },
    onError: (error: unknown) => {
      const specificError = getErrorMessage(error);
      toast.error(specificError);
    }
  });

  const crearAsistenciaSinApartadoMutation = useMutation({
    mutationFn: (asistencia: AsistenciaForm) => asistenciaService.create(asistencia),
    onSuccess: () => {
      toast.success('Asistencia registrada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      // Limpiar y cerrar modal
      setAsistenciaSinApartado({ cliente_id: 0, monto_pagado: 0 });
      setShowModalSinApartado(false);
    },
    onError: (error: unknown) => {
      const specificError = getErrorMessage(error);
      toast.error(specificError);
    }
  });

  const handleConfirmarApartado = (apartado: ApartadoData) => {
    setApartadoSeleccionado(apartado);
    setShowModalConfirmacion(true);
    setPagoCompleto(null);
    setMontoManual('');
  };

  const handleConfirmarPago = () => {
    if (!apartadoSeleccionado || pagoCompleto === null) return;

    let montoRestante: number;

    if (pagoCompleto) {
      // Pago completo: monto restante = total esperado - anticipo
      montoRestante = apartadoSeleccionado.monto_total_esperado - apartadoSeleccionado.monto_anticipo;
    } else {
      // Pago parcial: usar monto manual
      const monto = parseFloat(montoManual);
      if (isNaN(monto) || monto < 0) {
        toast.error('Ingresa un monto válido');
        return;
      }
      montoRestante = monto;
    }

    confirmarApartadoMutation.mutate({
      apartadoId: apartadoSeleccionado.id,
      montoRestante: montoRestante
    });

    // Cerrar modal
    setShowModalConfirmacion(false);
    setApartadoSeleccionado(null);
    setPagoCompleto(null);
    setMontoManual('');
  };

  const handleSubmitConfirmacion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apartadoConfirmando || !montoRestante) return;
    
    const monto = parseFloat(montoRestante);
    if (isNaN(monto) || monto < 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    confirmarApartadoMutation.mutate({
      apartadoId: apartadoConfirmando,
      montoRestante: monto
    });
  };

  const handleCancelarConfirmacion = () => {
    setApartadoConfirmando(null);
    setMontoRestante('');
  };

  const handleAgregarSinApartado = () => {
    if (!eventoSeleccionado) {
      toast.error('Selecciona un evento primero');
      return;
    }
    setShowModalSinApartado(true);
  };

  const handleSubmitSinApartado = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asistenciaSinApartado.cliente_id || !asistenciaSinApartado.monto_pagado) {
      toast.error('Completa todos los campos');
      return;
    }

    const asistenciaData: AsistenciaForm = {
      cliente_id: asistenciaSinApartado.cliente_id,
      evento_id: parseInt(eventoSeleccionado),
      monto_pagado: asistenciaSinApartado.monto_pagado,
      monto_anticipo: 0,
      monto_restante: asistenciaSinApartado.monto_pagado
    };

    crearAsistenciaSinApartadoMutation.mutate(asistenciaData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return createLocalDate(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventoInfo = (eventoId: string) => {
    return eventos.find(e => e.id === parseInt(eventoId));
  };

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellidos}` : 'Cliente no encontrado';
  };

  if (isLoadingEventos || isLoadingClientes) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Confirmar Asistencias</h1>
          <p className="page-subtitle">Confirmar apartados y registrar asistencias</p>
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
            <h1 className="page-title">Confirmar Asistencias</h1>
            <p className="page-subtitle">Confirmar apartados y registrar asistencias</p>
          </div>
          <Button
            onClick={() => navigate('/asistencias/apartar')}
            icon={Plus}
            variant="secondary"
          >
            Apartar Lugar
          </Button>
        </div>
      </div>

      {/* Selector de evento */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Seleccionar Evento</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evento
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={eventoSeleccionado}
                onChange={(e) => setEventoSeleccionado(e.target.value)}
                className="input-field pl-10"
              >
                <option value="">Selecciona un evento...</option>
                {eventos.map(evento => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nombre}
                    {evento.fecha_evento && ` - ${formatDate(evento.fecha_evento)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {eventoSeleccionado && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Información del evento
              </label>
              {(() => {
                const evento = getEventoInfo(eventoSeleccionado);
                return evento ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{evento.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{evento.cantidad_personas} asistentes</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </Card>

      {/* Lista de apartados */}
      {eventoSeleccionado && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Apartados Pendientes</h2>
            <Button
              onClick={handleAgregarSinApartado}
              icon={UserPlus}
              variant="secondary"
              size="sm"
            >
              Agregar sin apartado
            </Button>
          </div>

          {isLoadingApartados ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : apartados.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay apartados pendientes</h3>
              <p className="text-gray-600 mb-4">No se encontraron apartados para este evento</p>
              <Button
                onClick={handleAgregarSinApartado}
                icon={UserPlus}
              >
                Agregar participante
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apartados.map((apartado) => (
                <div key={apartado.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {getClienteNombre(apartado.cliente_id)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Apartado el {formatDate(apartado.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Anticipo pagado</p>
                          <p className="font-medium text-green-600">{formatCurrency(apartado.monto_anticipo)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total esperado</p>
                          <p className="font-medium">{formatCurrency(apartado.monto_total_esperado)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Restante</p>
                          <p className="font-medium text-orange-600">
                            {formatCurrency(apartado.monto_total_esperado - apartado.monto_anticipo)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Estado</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        </div>
                      </div>

                      {apartado.notas && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <p className="text-gray-600"><strong>Notas:</strong> {apartado.notas}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      {apartadoConfirmando === apartado.id ? (
                        <form onSubmit={handleSubmitConfirmacion} className="flex items-center gap-2">
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              type="number"
                              value={montoRestante}
                              onChange={(e) => setMontoRestante(e.target.value)}
                              placeholder="Monto restante"
                              className="pl-8 w-32"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            size="sm"
                            loading={confirmarApartadoMutation.isPending}
                          >
                            Confirmar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelarConfirmacion}
                          >
                            Cancelar
                          </Button>
                        </form>
                      ) : (
                        <Button
                          onClick={() => handleConfirmarApartado(apartado)}
                          icon={CheckCircle}
                          size="sm"
                        >
                          Confirmar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal de confirmación de pago */}
      <Modal
        isOpen={showModalConfirmacion}
        onClose={() => {
          setShowModalConfirmacion(false);
          setApartadoSeleccionado(null);
          setPagoCompleto(null);
          setMontoManual('');
        }}
        title="Confirmar Asistencia"
        size="md"
      >
        {apartadoSeleccionado && (
          <div className="space-y-6">
            {/* Información del apartado */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {getClienteNombre(apartadoSeleccionado.cliente_id)}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Anticipo pagado:</span>
                  <p className="font-medium text-green-600">{formatCurrency(apartadoSeleccionado.monto_anticipo)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total esperado:</span>
                  <p className="font-medium">{formatCurrency(apartadoSeleccionado.monto_total_esperado)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Monto restante:</span>
                  <p className="font-medium text-orange-600">
                    {formatCurrency(apartadoSeleccionado.monto_total_esperado - apartadoSeleccionado.monto_anticipo)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pregunta sobre el pago */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                ¿El cliente pagó el monto restante completo?
              </h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pagoCompleto"
                    value="si"
                    checked={pagoCompleto === true}
                    onChange={() => setPagoCompleto(true)}
                    className="mr-2"
                  />
                  <span>Sí, pagó el monto restante completo ({formatCurrency(apartadoSeleccionado.monto_total_esperado - apartadoSeleccionado.monto_anticipo)})</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pagoCompleto"
                    value="no"
                    checked={pagoCompleto === false}
                    onChange={() => setPagoCompleto(false)}
                    className="mr-2"
                  />
                  <span>No, pagó una cantidad diferente</span>
                </label>
              </div>
            </div>

            {/* Campo para monto manual */}
            {pagoCompleto === false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto restante pagado
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="number"
                    value={montoManual}
                    onChange={(e) => setMontoManual(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModalConfirmacion(false);
                  setApartadoSeleccionado(null);
                  setPagoCompleto(null);
                  setMontoManual('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmarPago}
                loading={confirmarApartadoMutation.isPending}
                disabled={pagoCompleto === null}
              >
                Confirmar Asistencia
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para agregar sin apartado */}
      <Modal
        isOpen={showModalSinApartado}
        onClose={() => setShowModalSinApartado(false)}
        title="Agregar Participante sin Apartado"
      >
        <form onSubmit={handleSubmitSinApartado} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <select
              value={asistenciaSinApartado.cliente_id}
              onChange={(e) => setAsistenciaSinApartado(prev => ({
                ...prev,
                cliente_id: parseInt(e.target.value)
              }))}
              className="input-field"
              required
            >
              <option value={0}>Selecciona un cliente...</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellidos}
                  {cliente.celular && ` - ${cliente.celular}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a pagar
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="number"
                value={asistenciaSinApartado.monto_pagado}
                onChange={(e) => setAsistenciaSinApartado(prev => ({
                  ...prev,
                  monto_pagado: parseFloat(e.target.value) || 0
                }))}
                placeholder="0.00"
                className="pl-10"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModalSinApartado(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={crearAsistenciaSinApartadoMutation.isPending}
            >
              Registrar Asistencia
            </Button>
          </div>
        </form>
      </Modal>

      {/* Información importante */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Importante sobre confirmaciones
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Al confirmar un apartado se registra automáticamente la asistencia</li>
              <li>• El monto restante se suma al anticipo para el total pagado</li>
              <li>• Se actualizan las estadísticas del cliente y evento</li>
              <li>• Los apartados confirmados no se pueden deshacer</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}; 