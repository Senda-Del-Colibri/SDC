import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle, 
  User, 
  Calendar, 
  DollarSign, 
  Save, 
  RotateCcw,
  AlertCircle,
  Users,
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react';
import { asistenciaService, clienteService, eventoService } from '../../services/api';
import { Button, Input, Card, CardHeader, CardBody } from '../../components/ui';
import type { AsistenciaForm, Cliente, Evento } from '../../types';
import { toast } from 'react-toastify';

interface FormErrors {
  cliente_id?: string;
  evento_id?: string;
  monto_pagado?: string;
}

export const AltaAsistencias: React.FC = () => {
  const [formData, setFormData] = useState<AsistenciaForm>({
    cliente_id: 0,
    evento_id: 0,
    monto_pagado: 0
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [eventoSearch, setEventoSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showEventoDropdown, setShowEventoDropdown] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  
  const queryClient = useQueryClient();

  // Queries para obtener datos
  const { data: allClientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allEventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: eventoService.getAll,
    staleTime: 5 * 60 * 1000,
  });

  // Filtrar clientes por búsqueda
  const filteredClientes = allClientes.filter(cliente =>
    `${cliente.nombre} ${cliente.apellidos}`.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    cliente.id.toString().includes(clienteSearch) ||
    (cliente.celular && cliente.celular.includes(clienteSearch))
  );

  // Filtrar eventos por búsqueda
  const filteredEventos = allEventos.filter(evento =>
    evento.nombre.toLowerCase().includes(eventoSearch.toLowerCase()) ||
    evento.ubicacion.toLowerCase().includes(eventoSearch.toLowerCase()) ||
    evento.id.toString().includes(eventoSearch)
  );

  // Mutation para crear asistencia
  const createAsistenciaMutation = useMutation({
    mutationFn: asistenciaService.create,
    onSuccess: (data) => {
      toast.success(`Asistencia registrada exitosamente. ID: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      resetForm();
    },
    onError: (error: Error) => {
      console.error('Error al registrar asistencia:', error);
      if (error.message.includes('duplicate key')) {
        toast.error('Este cliente ya está registrado en este evento');
      } else {
        toast.error('Error al registrar asistencia: ' + (error.message || 'Error desconocido'));
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Validaciones del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar cliente
    if (!formData.cliente_id || formData.cliente_id === 0) {
      newErrors.cliente_id = 'Debe seleccionar un cliente';
    }

    // Validar evento
    if (!formData.evento_id || formData.evento_id === 0) {
      newErrors.evento_id = 'Debe seleccionar un evento';
    }

    // Validar monto
    if (formData.monto_pagado <= 0) {
      newErrors.monto_pagado = 'El monto debe ser mayor a 0';
    } else if (formData.monto_pagado > 999999.99) {
      newErrors.monto_pagado = 'El monto no puede exceder $999,999.99';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Seleccionar cliente
  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormData(prev => ({ ...prev, cliente_id: cliente.id }));
    setClienteSearch(`${cliente.nombre} ${cliente.apellidos} (ID: ${cliente.id})`);
    setShowClienteDropdown(false);
    
    // Limpiar error del campo
    if (errors.cliente_id) {
      setErrors(prev => ({ ...prev, cliente_id: undefined }));
    }
  };

  // Seleccionar evento
  const handleSelectEvento = (evento: Evento) => {
    setSelectedEvento(evento);
    setFormData(prev => ({ ...prev, evento_id: evento.id }));
    setEventoSearch(`${evento.nombre} (ID: ${evento.id})`);
    setShowEventoDropdown(false);
    
    // Limpiar error del campo
    if (errors.evento_id) {
      setErrors(prev => ({ ...prev, evento_id: undefined }));
    }
  };

  // Manejar cambio de monto
  const handleMontoChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, monto_pagado: numValue }));
    
    // Limpiar error del campo
    if (errors.monto_pagado) {
      setErrors(prev => ({ ...prev, monto_pagado: undefined }));
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
    createAsistenciaMutation.mutate(formData);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      cliente_id: 0,
      evento_id: 0,
      monto_pagado: 0
    });
    setErrors({});
    setClienteSearch('');
    setEventoSearch('');
    setSelectedCliente(null);
    setSelectedEvento(null);
    setShowClienteDropdown(false);
    setShowEventoDropdown(false);
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowClienteDropdown(false);
        setShowEventoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Registrar Asistencia</h1>
        <p className="page-subtitle">
          Registrar la asistencia de clientes a eventos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-600" />
                Información de Asistencia
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selección de Cliente */}
                <div className="dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value);
                        setShowClienteDropdown(true);
                        if (!e.target.value) {
                          setSelectedCliente(null);
                          setFormData(prev => ({ ...prev, cliente_id: 0 }));
                        }
                      }}
                      onFocus={() => setShowClienteDropdown(true)}
                      placeholder="Buscar cliente por nombre, ID o celular..."
                      className={`pl-10 ${errors.cliente_id ? 'border-red-500' : ''}`}
                    />
                    {showClienteDropdown && clienteSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredClientes.length > 0 ? (
                          filteredClientes.slice(0, 10).map((cliente) => (
                            <div
                              key={cliente.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleSelectCliente(cliente)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {cliente.nombre} {cliente.apellidos}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: {cliente.id} • {cliente.celular || 'Sin celular'}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  <p>{cliente.visitas} visitas</p>
                                  <p>{formatCurrency(cliente.monto_acumulado)}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 text-center">
                            No se encontraron clientes
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.cliente_id && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cliente_id}
                    </p>
                  )}
                </div>

                {/* Selección de Evento */}
                <div className="dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={eventoSearch}
                      onChange={(e) => {
                        setEventoSearch(e.target.value);
                        setShowEventoDropdown(true);
                        if (!e.target.value) {
                          setSelectedEvento(null);
                          setFormData(prev => ({ ...prev, evento_id: 0 }));
                        }
                      }}
                      onFocus={() => setShowEventoDropdown(true)}
                      placeholder="Buscar evento por nombre, ubicación o ID..."
                      className={`pl-10 ${errors.evento_id ? 'border-red-500' : ''}`}
                    />
                    {showEventoDropdown && eventoSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredEventos.length > 0 ? (
                          filteredEventos.slice(0, 10).map((evento) => (
                            <div
                              key={evento.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleSelectEvento(evento)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {evento.nombre}
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {evento.ubicacion}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    ID: {evento.id}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  <p className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {evento.cantidad_personas}
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {formatCurrency(evento.total_cobrado)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 text-center">
                            No se encontraron eventos
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.evento_id && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.evento_id}
                    </p>
                  )}
                </div>

                {/* Monto Pagado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Pagado *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="number"
                      value={formData.monto_pagado}
                      onChange={(e) => handleMontoChange(e.target.value)}
                      placeholder="0.00"
                      className={`pl-10 ${errors.monto_pagado ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                      max="999999.99"
                    />
                  </div>
                  {errors.monto_pagado && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.monto_pagado}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Monto que el cliente pagó por asistir al evento
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
                    {isSubmitting ? 'Registrando...' : 'Registrar Asistencia'}
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
                    Cliente
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedCliente ? 
                      `${selectedCliente.nombre} ${selectedCliente.apellidos}` : 
                      'Sin seleccionar'
                    }
                  </p>
                  {selectedCliente && (
                    <p className="text-xs text-gray-500">
                      ID: {selectedCliente.id} • {selectedCliente.visitas} visitas
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedEvento ? selectedEvento.nombre : 'Sin seleccionar'}
                  </p>
                  {selectedEvento && (
                    <p className="text-xs text-gray-500">
                      ID: {selectedEvento.id} • {selectedEvento.cantidad_personas} asistentes
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto a Pagar
                  </label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatCurrency(formData.monto_pagado)}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
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

          {/* Información sobre Efectos */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Efectos del Registro
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Se incrementará el contador de visitas del cliente en +1
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Se sumará el monto pagado al total acumulado del cliente
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Se incrementará la cantidad de personas del evento en +1
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Se sumará el monto al total cobrado del evento
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    No se puede registrar el mismo cliente dos veces en el mismo evento
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