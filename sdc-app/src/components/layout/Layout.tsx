import React from 'react';
import { Box, Drawer, DrawerContent, useDisclosure } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Sidebar fijo para desktop */}
      <Sidebar
        onClose={onClose}
        display={{ base: 'none', md: 'block' }}
      />
      
      {/* Drawer para mobile */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>
      
      {/* Navbar */}
      <Box ml={{ base: 0, md: 60 }}>
        <Navbar onOpenSidebar={onOpen} />
        
        {/* Contenido principal */}
        <Box p="4">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 