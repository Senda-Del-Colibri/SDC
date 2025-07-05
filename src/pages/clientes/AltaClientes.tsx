import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, ArrowLeft } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClienteService } from '../../services/api';
import { Button, Input, Card, CardHeader, CardBody } from '../../components/ui';
import { toast } from 'react-toastify';
import type { ClienteFormData } from '../../types';

export const AltaClientes: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    apellidos: '',
    celular: '',
    comentarios: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createClienteMutation = useMutation({
    mutationFn: ClienteService.create,
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Cliente creado exitosamente');
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        
        // Limpiar formulario
        setFormData({
          nombre: '',
          apellidos: '',
          celular: '',
          comentarios: '',
        });
        setErrors({});
      }
    },
    onError: () => {
      toast.error('Error al crear cliente');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    if (formData.celular && formData.celular.trim()) {
      const phoneRegex = /^[\d\s\-+()]+$/;
      if (!phoneRegex.test(formData.celular)) {
        newErrors.celular = 'El formato del celular no es válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Limpiar datos antes de enviar
    const cleanData: ClienteFormData = {
      nombre: formData.nombre.trim(),
      apellidos: formData.apellidos.trim(),
      celular: formData.celular?.trim() || undefined,
      comentarios: formData.comentarios?.trim() || undefined,
    };

    createClienteMutation.mutate(cleanData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/')}
          >
            Volver
          </Button>
          <div>
            <h1 className="page-title">Alta de Clientes</h1>
            <p className="page-subtitle">Registrar un nuevo cliente en el sistema</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <Card className="animate-fadeIn">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Información del Cliente
            </h2>
          </div>
        </CardHeader>
        
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                error={errors.nombre}
                placeholder="Ingrese el nombre"
                required
                autoComplete="given-name"
              />

              <Input
                label="Apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                error={errors.apellidos}
                placeholder="Ingrese los apellidos"
                required
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Celular"
              name="celular"
              type="tel"
              value={formData.celular}
              onChange={handleInputChange}
              error={errors.celular}
              placeholder="Ej: +52 55 1234 5678"
              helperText="Opcional. Formato libre para números telefónicos"
              autoComplete="tel"
            />

            <div className="form-group">
              <label htmlFor="comentarios" className="form-label">
                Comentarios
              </label>
              <textarea
                id="comentarios"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleInputChange}
                className="input-field resize-none"
                rows={4}
                placeholder="Información adicional sobre el cliente (opcional)"
              />
              <div className="text-gray-500 text-sm mt-1">
                Opcional. Cualquier información relevante sobre el cliente
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                icon={Save}
                loading={createClienteMutation.isPending}
                className="flex-1"
              >
                {createClienteMutation.isPending ? 'Guardando...' : 'Guardar Cliente'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/clientes/busqueda')}
                className="flex-1"
              >
                Ver Clientes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardBody>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Información sobre el registro de clientes
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Los campos nombre y apellidos son obligatorios</li>
                <li>• El celular y comentarios son opcionales</li>
                <li>• Los campos de visitas y monto acumulado se calculan automáticamente</li>
                <li>• Una vez registrado, el cliente no puede ser eliminado</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}; 