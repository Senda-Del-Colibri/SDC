import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Spinner,
  useToast,
  HStack,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon} from '@chakra-ui/icons';
import { clientesService } from '../../services/supabase';
import { Cliente } from '../../types';
import ClientFormModal from '../../components/clients/ClientFormModal';

const ClientsPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchClientes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar los clientes. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleAddClick = () => {
    setSelectedCliente(undefined);
    onOpen();
  };

  const handleEditClick = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    onOpen();
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await clientesService.delete(id);
        toast({
          title: 'Cliente eliminado',
          description: 'El cliente ha sido eliminado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchClientes();
      } catch (err) {
        console.error('Error al eliminar cliente:', err);
        toast({
          title: 'Error',
          description: 'Ha ocurrido un error al eliminar el cliente',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleSaveCliente = async (clienteData: Omit<Cliente, 'id' | 'fecha_registro'>) => {
    try {
      if (selectedCliente) {
        // Actualizar cliente existente
        const updatedCliente = await clientesService.update(selectedCliente.id, clienteData);
        setClientes(clientes.map(c => c.id === selectedCliente.id ? updatedCliente : c));
        toast({
          title: 'Cliente actualizado',
          description: 'El cliente ha sido actualizado correctamente.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Crear nuevo cliente
        const newCliente = await clientesService.create(clienteData);
        setClientes([...clientes, newCliente]);
        toast({
          title: 'Cliente creado',
          description: 'El cliente ha sido creado correctamente.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar el cliente. Por favor, inténtalo de nuevo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Gestión de Clientes</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="teal" 
          onClick={handleAddClick}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : clientes.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Sin datos</AlertTitle>
          <AlertDescription>No hay clientes registrados. Agrega uno nuevo para comenzar.</AlertDescription>
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Apellidos</Th>
                <Th>Email</Th>
                <Th>Teléfono</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {clientes.map((cliente) => (
                <Tr key={cliente.id}>
                  <Td>{cliente.nombre}</Td>
                  <Td>{`${cliente.apellido_paterno} ${cliente.apellido_materno}`}</Td>
                  <Td>{cliente.email || '-'}</Td>
                  <Td>{cliente.telefono || '-'}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Editar cliente"
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleEditClick(cliente)}
                      />
                      <IconButton
                        aria-label="Eliminar cliente"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(cliente.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <ClientFormModal
        isOpen={isOpen}
        onClose={onClose}
        cliente={selectedCliente}
        onSuccess={fetchClientes}
      />
    </Box>
  );
};

export default ClientsPage; 