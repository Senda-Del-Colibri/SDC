import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  DollarSign, 
  Save, 
  AlertCircle, 
  CheckCircle,
  MapPin,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { clienteService, eventoService, apartadoService } from '../../services/api';
import type { ApartadoForm } from '../../types';
import { Card, Button, Input, LoadingSpinner } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorHandler';
import { createLocalDate } from '../../utils';

interface FormData {
  cliente_id: string;
  evento_id: string;
  monto_anticipo: string;
  monto_total_esperado: string;
  notas: string;
}

interface FormErrors {
  cliente_id?: string;
  evento_id?: string;
  monto_anticipo?: string;
  monto_total_esperado?: string;
  general?: string;
}

export const ApartarLugar: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    cliente_id: '',
    evento_id: '',
    monto_anticipo: '',
    monto_total_esperado: '',
    notas: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: clientes = [], isLoading: isLoadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
  });

  const { data: allEventos = [], isLoading: isLoadingEventos } = useQuery({
    queryKey: ['eventos'],
    queryFn: eventoService.getAll,
  });

  // Filtrar solo eventos próximos (con fecha futura)
  const eventos = allEventos.filter(evento => {
    if (!evento.fecha_evento) return false;
    const eventoDate = createLocalDate(evento.fecha_evento);
    const now = new Date();
    return eventoDate > now;
  });

  const { data: apartados = [] } = useQuery({
    queryKey: ['apartados'],
    queryFn: apartadoService.getAll,
  });

  // Mutation para crear apartado
  const createApartadoMutation = useMutation({
    mutationFn: (apartado: ApartadoForm) => apartadoService.create(apartado),
    onSuccess: () => {
      toast.success(`Lugar apartado exitosamente para el evento`);
      queryClient.invalidateQueries({ queryKey: ['apartados'] });
      
      // Limpiar formulario
      setFormData({
        cliente_id: '',
        evento_id: '',
        monto_anticipo: '',
        monto_total_esperado: '',
        notas: ''
      });
      setErrors({});
    },
    onError: (error: unknown) => {
      const specificError = getErrorMessage(error);
      
      setErrors({
        general: specificError
      });
      
      toast.error(specificError);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar cliente
    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Selecciona un cliente';
    }

    // Validar evento
    if (!formData.evento_id) {
      newErrors.evento_id = 'Selecciona un evento';
    }

    // Validar monto anticipo
    if (!formData.monto_anticipo) {
      newErrors.monto_anticipo = 'Ingresa el monto del anticipo';
    } else {
      const anticipo = parseFloat(formData.monto_anticipo);
      if (isNaN(anticipo) || anticipo <= 0) {
        newErrors.monto_anticipo = 'El monto del anticipo debe ser mayor a 0';
      }
    }

    // Validar monto total esperado
    if (!formData.monto_total_esperado) {
      newErrors.monto_total_esperado = 'Ingresa el monto total esperado';
    } else {
      const total = parseFloat(formData.monto_total_esperado);
      const anticipo = parseFloat(formData.monto_anticipo);
      
      if (isNaN(total) || total <= 0) {
        newErrors.monto_total_esperado = 'El monto total debe ser mayor a 0';
      } else if (!isNaN(anticipo) && total < anticipo) {
        newErrors.monto_total_esperado = 'El monto total debe ser mayor o igual al anticipo';
      }
    }

    // Validar que no exista apartado duplicado
    if (formData.cliente_id && formData.evento_id) {
      const clienteId = parseInt(formData.cliente_id);
      const eventoId = parseInt(formData.evento_id);
      
      const existeApartado = apartados.some(apartado => 
        apartado.cliente_id === clienteId && 
        apartado.evento_id === eventoId && 
        apartado.estado === 'apartado'
      );
      
      if (existeApartado) {
        newErrors.general = 'Este cliente ya tiene un lugar apartado para este evento';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const apartadoData: ApartadoForm = {
        cliente_id: parseInt(formData.cliente_id),
        evento_id: parseInt(formData.evento_id),
        monto_anticipo: parseFloat(formData.monto_anticipo),
        monto_total_esperado: parseFloat(formData.monto_total_esperado),
        notas: formData.notas.trim() || undefined
      };

      await createApartadoMutation.mutateAsync(apartadoData);
    } catch {
      // Error ya manejado en onError del mutation
    } finally {
      setIsSubmitting(false);
    }
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
    const evento = eventos.find(e => e.id === parseInt(eventoId));
    return evento;
  };

  const getClienteInfo = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === parseInt(clienteId));
    return cliente;
  };

  if (isLoadingClientes || isLoadingEventos) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Apartar Lugar
              </h1>
              <p className="text-gray-600 mt-1">
                Apartar lugar en evento con anticipo
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Apartar Lugar
            </h1>
            <p className="text-gray-600 mt-1">
              Apartar lugar en evento con anticipo
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error general */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-800">{errors.general}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="form-group">
                  <label htmlFor="cliente_id" className="form-label">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="cliente_id"
                      name="cliente_id"
                      value={formData.cliente_id}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.cliente_id ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Selecciona un cliente...</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellidos}
                          {cliente.celular && ` - ${cliente.celular}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.cliente_id && (
                    <div className="form-error">{errors.cliente_id}</div>
                  )}
                </div>

                {/* Evento */}
                <div className="form-group">
                  <label htmlFor="evento_id" className="form-label">
                    Evento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="evento_id"
                      name="evento_id"
                      value={formData.evento_id}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.evento_id ? 'border-red-500' : ''}`}
                      required
                      disabled={eventos.length === 0}
                    >
                      <option value="">
                        {eventos.length === 0 ? 'No hay eventos próximos disponibles' : 'Selecciona un evento...'}
                      </option>
                      {eventos.map(evento => (
                        <option key={evento.id} value={evento.id}>
                          {evento.nombre}
                          {evento.fecha_evento && ` - ${formatDate(evento.fecha_evento)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.evento_id && (
                    <div className="form-error">{errors.evento_id}</div>
                  )}
                  {eventos.length === 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Solo se pueden apartar lugares en eventos próximos. No hay eventos futuros disponibles en este momento.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Monto Anticipo */}
                <div className="form-group">
                  <label htmlFor="monto_anticipo" className="form-label">
                    Monto del Anticipo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="number"
                      id="monto_anticipo"
                      name="monto_anticipo"
                      value={formData.monto_anticipo}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={`pl-10 ${errors.monto_anticipo ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {errors.monto_anticipo && (
                    <div className="form-error">{errors.monto_anticipo}</div>
                  )}
                </div>

                {/* Monto Total Esperado */}
                <div className="form-group">
                  <label htmlFor="monto_total_esperado" className="form-label">
                    Monto Total Esperado <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="number"
                      id="monto_total_esperado"
                      name="monto_total_esperado"
                      value={formData.monto_total_esperado}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={`pl-10 ${errors.monto_total_esperado ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {errors.monto_total_esperado && (
                    <div className="form-error">{errors.monto_total_esperado}</div>
                  )}
                </div>
              </div>

              {/* Notas */}
              <div className="form-group">
                <label htmlFor="notas" className="form-label">
                  Notas (opcional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    id="notas"
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    placeholder="Notas adicionales sobre el apartado..."
                    className="input-field pl-10 min-h-[100px] resize-y"
                    rows={3}
                  />
                </div>
              </div>

              {/* Resumen */}
              {formData.cliente_id && formData.evento_id && formData.monto_anticipo && formData.monto_total_esperado && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Resumen del apartado</span>
                  </div>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Cliente:</strong> {getClienteInfo(formData.cliente_id)?.nombre} {getClienteInfo(formData.cliente_id)?.apellidos}</p>
                    <p><strong>Evento:</strong> {getEventoInfo(formData.evento_id)?.nombre}</p>
                    <p><strong>Anticipo:</strong> {formatCurrency(parseFloat(formData.monto_anticipo))}</p>
                    <p><strong>Total esperado:</strong> {formatCurrency(parseFloat(formData.monto_total_esperado))}</p>
                    <p><strong>Restante:</strong> {formatCurrency(parseFloat(formData.monto_total_esperado) - parseFloat(formData.monto_anticipo))}</p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/asistencias/confirmar')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  icon={Save}
                  loading={isSubmitting}
                  disabled={isSubmitting || eventos.length === 0}
                >
                  {isSubmitting ? 'Apartando...' : 'Apartar Lugar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Panel lateral con información */}
        <div className="space-y-6">
          {/* Información del evento seleccionado */}
          {formData.evento_id && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Evento</h3>
              {(() => {
                const evento = getEventoInfo(formData.evento_id);
                return evento ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium">{evento.nombre}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{evento.ubicacion}</span>
                    </div>
                    {evento.fecha_evento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{formatDate(evento.fecha_evento)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">Gasto estimado</p>
                      <p className="font-medium">{formatCurrency(evento.gasto)}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </Card>
          )}

          {/* Información importante */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Importante sobre apartados
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• El anticipo se cobra al momento de apartar</li>
                  <li>• El monto restante se cobra al confirmar asistencia</li>
                  <li>• Un cliente solo puede apartar una vez por evento</li>
                  <li>• Los apartados deben confirmarse antes del evento</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 