import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { Cliente, ClienteFormData } from '../../types';
import { clientesService } from '../../services/supabase';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: Cliente;
  onSuccess: () => void;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  cliente,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: '',
    direccion: '',
    comentarios: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        apellido_paterno: cliente.apellido_paterno,
        apellido_materno: cliente.apellido_materno,
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        comentarios: cliente.comentarios || '',
      });
    } else {
      setFormData({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
        direccion: '',
        comentarios: '',
      });
    }
  }, [cliente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (cliente) {
        await clientesService.update(cliente.id, formData);
        toast({
          title: 'Cliente actualizado',
          description: 'El cliente ha sido actualizado correctamente.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await clientesService.create(formData);
        toast({
          title: 'Cliente creado',
          description: 'El cliente ha sido creado correctamente.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onSuccess();
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre del cliente"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Apellido Paterno</FormLabel>
                <Input
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  placeholder="Apellido paterno"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Apellido Materno</FormLabel>
                <Input
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  placeholder="Apellido materno"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="555-0123"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Input
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección completa"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Comentarios</FormLabel>
                <Textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  placeholder="Comentarios adicionales"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={isLoading}
              loadingText="Guardando..."
            >
              {cliente ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ClientFormModal; 