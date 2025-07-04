import React from 'react';
import {
  Box,
  Flex,
  Text,
  CloseButton,
  BoxProps,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiUserPlus, FiCheckSquare } from 'react-icons/fi';
import { IconType } from 'react-icons';

// Definimos los elementos de navegación
interface LinkItemProps {
  name: string;
  path: string;
  icon: IconType;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Inicio', path: '/', icon: FiHome },
  { name: 'Clientes', path: '/clients', icon: FiUsers },
  { name: 'Eventos', path: '/events', icon: FiCalendar },
  { name: 'Referidos', path: '/referrals', icon: FiUserPlus },
  { name: 'Asistencias', path: '/attendance', icon: FiCheckSquare },
];

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const Sidebar = ({ onClose, ...rest }: SidebarProps) => {
  const location = useLocation();
  
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          SDC Meditaciones
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem 
          key={link.name} 
          path={link.path}
          isActive={location.pathname === link.path}
        >
          <Flex align="center">
            <Box mr="4" display="inline-flex">
              {React.createElement(link.icon as React.ComponentType<any>, { size: 16 })}
            </Box>
            {link.name}
          </Flex>
        </NavItem>
      ))}
    </Box>
  );
};

interface NavItemProps extends BoxProps {
  path: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavItem = ({ path, children, isActive, ...rest }: NavItemProps) => {
  const activeBg = useColorModeValue('teal.50', 'teal.900');
  const inactiveBg = useColorModeValue('transparent', 'transparent');
  const activeColor = useColorModeValue('teal.700', 'teal.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.200');
  const hoverColor = useColorModeValue('teal.500', 'teal.300');

  return (
    <Box
      as={RouterLink}
      to={path}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : inactiveBg}
        color={isActive ? activeColor : inactiveColor}
        _hover={{
          bg: activeBg,
          color: hoverColor,
        }}
        {...rest}
      >
        {children}
      </Flex>
    </Box>
  );
};

export default Sidebar; 