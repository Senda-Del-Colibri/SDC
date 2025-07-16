import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Users
} from 'lucide-react';
import { Card, Button } from '../../components/ui';

export const GestionResponsivas: React.FC = () => {
  const navigate = useNavigate();

  const estadisticas = [
    { 
      titulo: 'Cartas Disponibles', 
      descripcion: 'Generar cartas responsivas para clientes',
      icono: FileText,
      color: 'bg-blue-500'
    },
    { 
      titulo: 'Descarga Individual', 
      descripcion: 'Generar carta para un cliente específico',
      icono: Download,
      color: 'bg-green-500'
    },
    { 
      titulo: 'Descarga Masiva', 
      descripcion: 'Generar múltiples cartas en ZIP',
      icono: Users,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Cartas Responsivas
            </h1>
            <p className="text-gray-600 mt-1">
              Genera cartas responsivas para experiencias con medicinas ancestrales
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Estadísticas/Opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {estadisticas.map((stat, index) => {
          const IconComponent = stat.icono;
          return (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stat.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {stat.descripcion}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Download className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Generación Individual
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Busca un cliente específico y genera su carta responsiva personalizada.
          </p>
          <Button 
            onClick={() => navigate('/responsivas/individual')}
            className="w-full"
          >
            Generar Carta Individual
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Generación Masiva
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Genera múltiples cartas responsivas por evento, fecha o selección personalizada.
          </p>
          <Button 
            onClick={() => navigate('/responsivas/masiva')}
            className="w-full"
            variant="secondary"
          >
            Generar Cartas Masivas
          </Button>
        </Card>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">
              Acerca de las Cartas Responsivas
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                Las cartas responsivas son documentos legales que los participantes deben firmar 
                antes de participar en experiencias con medicinas ancestrales.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Incluyen información sobre la naturaleza de las medicinas ancestrales</li>
                <li>Contienen preguntas de salud importantes para la seguridad del participante</li>
                <li>Establecen la responsabilidad del participante en la experiencia</li>
                <li>Deben ser firmadas físicamente por cada participante</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 