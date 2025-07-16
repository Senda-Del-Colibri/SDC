import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Download, 
  User,
  ArrowLeft,
  Phone
} from 'lucide-react';
import { clienteService } from '../../services/api';
import { Button, Input, Card, LoadingSpinner } from '../../components/ui';
import { generarCartaResponsivaCliente } from '../../utils/pdfGenerator';
import type { Cliente } from '../../types';
import { toast } from 'react-toastify';

export const GeneracionIndividual: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Obtener todos los clientes
  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll
  });

  // Filtrar clientes según búsqueda
  const clientesFiltrados = clientes.filter(cliente => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(searchTerm) ||
      cliente.apellidos.toLowerCase().includes(searchTerm) ||
      cliente.celular?.toLowerCase().includes(searchTerm)
    );
  });

  const handleGenerarCarta = (cliente: Cliente) => {
    try {
      generarCartaResponsivaCliente(cliente);
      toast.success(`Carta responsiva generada para ${cliente.nombre} ${cliente.apellidos}`);
    } catch (error) {
      toast.error('Error al generar la carta responsiva');
      console.error('Error:', error);
    }
  };

  const handleVistaPrevia = (cliente: Cliente) => {
    setSelectedCliente(cliente);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/responsivas')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Generación Individual
              </h1>
              <p className="text-gray-600 mt-1">
                Busca un cliente y genera su carta responsiva personalizada
              </p>
            </div>
          </div>
          <FileText className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      {/* Búsqueda */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar cliente por nombre, apellidos o celular..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-500">
            {clientesFiltrados.length} cliente(s) encontrado(s)
          </div>
        </div>
      </Card>

      {/* Lista de clientes */}
      <div className="space-y-4">
        {clientesFiltrados.length === 0 ? (
          <Card className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Intenta con otros términos de búsqueda' : 'No hay clientes registrados'}
            </p>
          </Card>
        ) : (
          clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cliente.nombre} {cliente.apellidos}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      {cliente.celular && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-1" />
                          {cliente.celular}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {cliente.visitas} visita(s)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleVistaPrevia(cliente)}
                  >
                    Vista Previa
                  </Button>
                  <Button
                    onClick={() => handleGenerarCarta(cliente)}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Generar Carta</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de vista previa */}
      {selectedCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Vista Previa - Carta Responsiva
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCliente(null)}
                  className="p-2"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">¡Bienvenido a Senda del Colibrí!</h3>
              </div>
              <div className="space-y-4 text-sm">
                <p>
                  Nos sentimos honrados de acompañarte en este viaje de sanación y transformación...
                </p>
                <p className="font-bold">
                  Yo, <span className="underline">{selectedCliente.nombre.toUpperCase()} {selectedCliente.apellidos.toUpperCase()}</span>, 
                  ACEPTO TOMAR ESTA EXPERIENCIA DE MEDICINAS ANCESTRALES...
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-bold">Datos del Cliente:</p>
                  <p>Nombre: {selectedCliente.nombre} {selectedCliente.apellidos}</p>
                  <p>Celular: {selectedCliente.celular || 'No registrado'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedCliente(null)}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  handleGenerarCarta(selectedCliente);
                  setSelectedCliente(null);
                }}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Generar PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 