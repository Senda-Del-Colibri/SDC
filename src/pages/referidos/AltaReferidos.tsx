import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { clienteService, referidoService } from '../../services/api';
import type { ReferidoForm } from '../../types';
import { Card, Button, LoadingSpinner } from '../../components/ui';

interface FormData {
  cliente_id: string;
  referido_id: string;
}

interface FormErrors {
  cliente_id?: string;
  referido_id?: string;
  general?: string;
}

export const AltaReferidos: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    cliente_id: '',
    referido_id: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query para obtener todos los clientes
  const { data: clientes = [], isLoading: isLoadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
  });

  // Query para obtener todos los referidos existentes
  const { data: referidosExistentes = [] } = useQuery({
    queryKey: ['referidos'],
    queryFn: referidoService.getAll,
  });

  // Mutation para crear referido
  const createReferidoMutation = useMutation({
    mutationFn: (referido: ReferidoForm) => referidoService.create(referido),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referidos'] });
      toast.success('Referido registrado exitosamente');
      
      // Limpiar formulario
      setFormData({
        cliente_id: '',
        referido_id: ''
      });
      setErrors({});
    },
    onError: (error: unknown) => {
      console.error('Error al crear referido:', error);
      
      // Manejar errores específicos de la base de datos
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorMessage.includes('referidos_cliente_id_referido_id_key')) {
        setErrors({
          general: 'Este cliente ya ha referido a esta persona anteriormente.'
        });
      } else if (errorMessage.includes('referidos_cliente_id_fkey')) {
        setErrors({
          cliente_id: 'El cliente seleccionado no existe.'
        });
      } else if (errorMessage.includes('referidos_referido_id_fkey')) {
        setErrors({
          referido_id: 'El cliente referido seleccionado no existe.'
        });
      } else {
        setErrors({
          general: 'Error al registrar el referido. Intenta nuevamente.'
        });
      }
      
      toast.error('Error al registrar el referido');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

    // Validar cliente_id
    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Selecciona el cliente que hace el referido';
    }

    // Validar referido_id
    if (!formData.referido_id) {
      newErrors.referido_id = 'Selecciona el cliente referido';
    }

    // Validar que no sea el mismo cliente
    if (formData.cliente_id && formData.referido_id && formData.cliente_id === formData.referido_id) {
      newErrors.referido_id = 'Un cliente no puede referirse a sí mismo';
    }

    // Validar que la relación específica no exista ya (mismo cliente refiriendo a la misma persona)
    if (formData.cliente_id && formData.referido_id) {
      const clienteId = parseInt(formData.cliente_id);
      const referidoId = parseInt(formData.referido_id);
      
      const existeRelacion = referidosExistentes.some(ref => 
        ref.cliente_id === clienteId && ref.referido_id === referidoId
      );
      
      if (existeRelacion) {
        newErrors.general = 'Este cliente ya ha referido a esta persona anteriormente';
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
      const referidoData: ReferidoForm = {
        cliente_id: parseInt(formData.cliente_id),
        referido_id: parseInt(formData.referido_id)
      };

      await createReferidoMutation.mutateAsync(referidoData);
    } catch {
      // Error ya manejado en onError del mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellidos}` : 'Cliente no encontrado';
  };

  const getClientesDisponiblesParaReferir = (clienteId: string) => {
    if (!clienteId) return clientes;
    
    const clienteIdNum = parseInt(clienteId);
    return clientes.filter(cliente => cliente.id !== clienteIdNum);
  };

  if (isLoadingClientes) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Registrar Referido</h1>
          <p className="page-subtitle">Registrar nuevo referido de cliente</p>
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
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/referidos/consulta')}
          >
            Volver
          </Button>
          <div>
            <h1 className="page-title">Registrar Referido</h1>
            <p className="page-subtitle">Registrar nuevo referido de cliente</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
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
            {/* Cliente que refiere */}
            <div className="form-group">
              <label htmlFor="cliente_id" className="form-label">
                Cliente que refiere <span className="text-red-500">*</span>
              </label>
              <select
                id="cliente_id"
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleInputChange}
                className={`input-field ${errors.cliente_id ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
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
              {errors.cliente_id && (
                <div className="form-error">{errors.cliente_id}</div>
              )}
            </div>

            {/* Cliente referido */}
            <div className="form-group">
              <label htmlFor="referido_id" className="form-label">
                Cliente referido <span className="text-red-500">*</span>
              </label>
              <select
                id="referido_id"
                name="referido_id"
                value={formData.referido_id}
                onChange={handleInputChange}
                className={`input-field ${errors.referido_id ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                required
              >
                <option value="">Selecciona un cliente...</option>
                {getClientesDisponiblesParaReferir(formData.cliente_id).map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellidos}
                    {cliente.celular && ` - ${cliente.celular}`}
                  </option>
                ))}
              </select>
              {errors.referido_id && (
                <div className="form-error">{errors.referido_id}</div>
              )}
            </div>
          </div>

          {/* Resumen de la relación */}
          {formData.cliente_id && formData.referido_id && formData.cliente_id !== formData.referido_id && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Resumen del referido</span>
              </div>
              <p className="text-sm text-green-800">
                <strong>{getClienteNombre(parseInt(formData.cliente_id))}</strong> refiere a{' '}
                <strong>{getClienteNombre(parseInt(formData.referido_id))}</strong>
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/referidos/consulta')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              icon={UserPlus}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Referido'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Información importante */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Importante sobre los referidos
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Un cliente no puede referirse a sí mismo</li>
              <li>• Un mismo cliente no puede referir a la misma persona más de una vez</li>
              <li>• Una persona puede ser referida por múltiples clientes diferentes</li>
              <li>• Los referidos no se pueden modificar ni eliminar una vez registrados</li>
              <li>• Ambos clientes deben estar previamente registrados en el sistema</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clientes.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Referidos Registrados</p>
              <p className="text-2xl font-bold text-gray-900">{referidosExistentes.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 