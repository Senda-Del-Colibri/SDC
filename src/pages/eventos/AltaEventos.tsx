import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Users,
  Clock,
  CalendarPlus
} from 'lucide-react';
import { eventoService } from '../../services/api';
import { Button, Input, Card, CardHeader, CardBody } from '../../components/ui';
import type { EventoForm } from '../../types';
import { toast } from 'react-toastify';
import { createLocalDate } from '../../utils';

interface FormErrors {
  nombre?: string;
  ubicacion?: string;
  gasto?: string;
  fecha_evento?: string;
}

export const AltaEventos: React.FC = () => {
  const [formData, setFormData] = useState<EventoForm>({
    nombre: '',
    ubicacion: '',
    gasto: 0,
    fecha_evento: ''
  });
  
  const [gastoInput, setGastoInput] = useState<string>('');
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Mutation para crear evento
  const createEventoMutation = useMutation({
    mutationFn: eventoService.create,
    onSuccess: (data) => {
      toast.success(`Evento "${data.nombre}" creado exitosamente con ID: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      resetForm();
    },
    onError: (error: Error) => {
      console.error('Error al crear evento:', error);
      toast.error('Error al crear el evento: ' + (error.message || 'Error desconocido'));
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Validaciones del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del evento es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 200) {
      newErrors.nombre = 'El nombre no puede exceder 200 caracteres';
    }

    // Validar ubicación
    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es obligatoria';
    } else if (formData.ubicacion.trim().length < 3) {
      newErrors.ubicacion = 'La ubicación debe tener al menos 3 caracteres';
    } else if (formData.ubicacion.trim().length > 300) {
      newErrors.ubicacion = 'La ubicación no puede exceder 300 caracteres';
    }

    // Validar gasto
    if (formData.gasto < 0) {
      newErrors.gasto = 'El gasto no puede ser negativo';
    } else if (formData.gasto > 999999.99) {
      newErrors.gasto = 'El gasto no puede exceder $999,999.99';
    }

    // Validar fecha del evento (opcional)
    if (formData.fecha_evento && formData.fecha_evento.trim()) {
      // Crear fecha en zona horaria local para evitar problemas de UTC
      const fechaEvento = createLocalDate(formData.fecha_evento);
      
      if (isNaN(fechaEvento.getTime())) {
        newErrors.fecha_evento = 'La fecha del evento no es válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos
  const handleInputChange = (field: keyof EventoForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Manejar cambio específico del gasto
  const handleGastoChange = (value: string) => {
    setGastoInput(value);
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, gasto: numValue }));
      
      // Limpiar error del campo
      if (errors.gasto) {
        setErrors(prev => ({ ...prev, gasto: undefined }));
      }
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    
    // Preparar datos para envío
    const eventoData: EventoForm = {
      nombre: formData.nombre.trim(),
      ubicacion: formData.ubicacion.trim(),
      gasto: Number(formData.gasto),
      ...(formData.fecha_evento && formData.fecha_evento.trim() && {
        fecha_evento: formData.fecha_evento.trim()
      })
    };

    createEventoMutation.mutate(eventoData);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      ubicacion: '',
      gasto: 0,
      fecha_evento: ''
    });
    setGastoInput('');
    setErrors({});
  };

  // Formatear moneda para mostrar
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Alta de Eventos
            </h1>
            <p className="text-gray-600 mt-1">
              Crear nuevos eventos de meditación y actividades
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarPlus className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Información del Evento
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre del Evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Evento *
                  </label>
                  <Input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Meditación Mindfulness Básica"
                    className={errors.nombre ? 'border-red-500' : ''}
                    maxLength={200}
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nombre}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.nombre.length}/200 caracteres
                  </p>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                      placeholder="Ej: Sala Principal - Centro Senda del Colibrí"
                      className={`pl-10 ${errors.ubicacion ? 'border-red-500' : ''}`}
                      maxLength={300}
                    />
                  </div>
                  {errors.ubicacion && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.ubicacion}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.ubicacion.length}/300 caracteres
                  </p>
                </div>

                {/* Gasto del Evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gasto del Evento
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="number"
                      value={gastoInput}
                      onChange={(e) => handleGastoChange(e.target.value)}
                      placeholder="0.00"
                      className={`pl-10 ${errors.gasto ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                      max="999999.99"
                    />
                  </div>
                  {errors.gasto && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.gasto}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Gastos asociados al evento (materiales, renta, etc.)
                  </p>
                </div>

                {/* Fecha del Evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Evento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="date"
                      value={formData.fecha_evento || ''}
                      onChange={(e) => handleInputChange('fecha_evento', e.target.value)}
                      className={`pl-10 ${errors.fecha_evento ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.fecha_evento && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fecha_evento}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Fecha programada para la realización del evento (opcional)
                  </p>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    icon={Save}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Evento'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                    icon={RotateCcw}
                    disabled={isSubmitting}
                  >
                    Limpiar
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Panel Lateral de Información */}
        <div className="space-y-6">
          {/* Vista Previa */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Vista Previa
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formData.nombre || 'Sin nombre'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formData.ubicacion || 'Sin ubicación'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gasto Estimado
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatCurrency(formData.gasto)}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </label>
                  <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {new Date().toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Información
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Los eventos se crean con estadísticas en cero (0 personas, $0 cobrado)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Las estadísticas se actualizan automáticamente al registrar asistencias
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    El gasto es opcional y se usa para calcular la rentabilidad del evento
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Los eventos se pueden editar posteriormente desde el módulo de búsqueda
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}; 