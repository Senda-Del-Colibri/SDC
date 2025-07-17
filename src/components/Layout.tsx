import React, { useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Search, 
  Calendar, 
  List, 
  Users, 
  CheckCircle, 
  Clock,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthService } from '../services/authService';
import { toast } from 'react-toastify';
import { Button } from './ui';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  {
    name: 'Clientes',
    icon: User,
    children: [
      { name: 'Alta Clientes', href: '/clientes/alta', icon: User },
      { name: 'Búsqueda Clientes', href: '/clientes/busqueda', icon: Search },
    ]
  },
  {
    name: 'Eventos',
    icon: Calendar,
    children: [
      { name: 'Alta Eventos', href: '/eventos/alta', icon: Calendar },
      { name: 'Búsqueda Eventos', href: '/eventos/busqueda', icon: List },
      { name: 'Consulta Apartados', href: '/eventos/apartados', icon: Clock },
      { name: 'Consulta Asistencias', href: '/eventos/asistencias', icon: CheckCircle },
    ]
  },
  {
    name: 'Referidos',
    icon: Users,
    children: [
      { name: 'Alta Referidos', href: '/referidos/alta', icon: Users },
      { name: 'Consulta Referidos', href: '/referidos/consulta', icon: Users },
    ]
  },
  {
    name: 'Asistencias',
    icon: CheckCircle,
    children: [
      { name: 'Apartar Lugar', href: '/asistencias/apartar', icon: Calendar },
      { name: 'Confirmar Asistencia', href: '/asistencias/confirmar', icon: CheckCircle },
      { name: 'Registro Directo', href: '/asistencias/alta', icon: User },
    ]
  },
  {
    name: 'Cartas Responsivas',
    icon: FileText,
    children: [
      { name: 'Gestión Principal', href: '/responsivas', icon: FileText },
      { name: 'Generación Individual', href: '/responsivas/individual', icon: User },
      { name: 'Generación Masiva', href: '/responsivas/masiva', icon: Users },
    ]
  },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);

  // Función para obtener el nombre a mostrar
  const getDisplayName = () => {
    return user?.user_metadata?.display_name || 
           user?.email?.split('@')[0] || 
           'Usuario';
  };

  const handleLogout = async () => {
    const { error } = await AuthService.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    }
  };

  const isActivePath = useCallback((path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const isGroupActive = useCallback((item: NavigationItem) => {
    if (item.href) {
      return isActivePath(item.href);
    }
    return item.children?.some(child => child.href && isActivePath(child.href)) || false;
  }, [isActivePath]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  // Auto-expandir grupos activos
  React.useEffect(() => {
    navigationItems.forEach(item => {
      if (item.children && isGroupActive(item) && !expandedGroups.includes(item.name)) {
        setExpandedGroups(prev => [...prev, item.name]);
      }
    });
  }, [location.pathname, expandedGroups, isGroupActive]);

  const getDefaultRouteForGroup = (groupName: string) => {
    switch (groupName) {
      case 'Clientes':
        return '/clientes/busqueda';
      case 'Eventos':
        return '/eventos/busqueda';
      case 'Referidos':
        return '/referidos/consulta';
      case 'Asistencias':
        return '/asistencias/confirmar';
      default:
        return '/';
    }
  };

  const handleGroupClick = (item: NavigationItem, isMobile: boolean) => {
    if (!isSidebarOpen && !isMobile) {
      // Si el sidebar está colapsado, navegar directamente a la página por defecto
      const defaultRoute = getDefaultRouteForGroup(item.name);
      navigate(defaultRoute);
    } else {
      // Si el sidebar está expandido, toggle el grupo
      toggleGroup(item.name);
    }
  };

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    const Icon = item.icon;
    const isActive = isGroupActive(item);
    const isExpanded = expandedGroups.includes(item.name);

    if (item.children) {
      // Grupo con submenús
      return (
        <div key={item.name}>
          <button
            onClick={() => handleGroupClick(item, isMobile)}
            className={`flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } ${!isSidebarOpen && !isMobile && 'justify-center py-3'}`}
            title={!isSidebarOpen && !isMobile ? `${item.name} - Ir a ${item.name === 'Referidos' ? 'Consulta' : 'Búsqueda'}` : undefined}
          >
            <Icon className={`${isSidebarOpen || isMobile ? 'w-5 h-5' : 'w-8 h-8'} ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'} ${(isSidebarOpen || isMobile) && 'mr-3'}`} />
            {(isSidebarOpen || isMobile) && (
              <>
                <span className="truncate flex-1 text-left">{item.name}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </>
            )}
          </button>
          
          {/* Submenús */}
          {isExpanded && (isSidebarOpen || isMobile) && (
            <div className="ml-6 mt-2 space-y-1">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = child.href ? isActivePath(child.href) : false;
                return (
                  <Link
                    key={child.name}
                    to={child.href!}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isChildActive
                        ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                  >
                    <ChildIcon className={`w-4 h-4 mr-3 ${isChildActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    {child.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    } else {
      // Elemento simple
      return (
        <Link
          key={item.name}
          to={item.href!}
          className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
            isActive
              ? 'bg-primary-100 text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          } ${!isSidebarOpen && !isMobile && 'justify-center py-3'}`}
          title={!isSidebarOpen && !isMobile ? item.name : undefined}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          <Icon className={`${isSidebarOpen || isMobile ? 'w-5 h-5' : 'w-8 h-8'} ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'} ${(isSidebarOpen || isMobile) && 'mr-3'}`} />
          {(isSidebarOpen || isMobile) && (
            <span className="truncate">{item.name}</span>
          )}
        </Link>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out hidden lg:flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/SDC/logo.png?v=1" 
                alt="SDC Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback si no se encuentra la imagen
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                    fallback.classList.add('flex');
                  }
                }}
              />
              <div className="hidden w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold text-gray-900">SDC</span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => renderNavigationItem(item))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          {isSidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                Cerrar Sesión
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="p-3 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img 
                    src="/SDC/logo.png?v=1" 
                    alt="SDC Logo" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Fallback si no se encuentra la imagen
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                        fallback.classList.add('flex');
                      }
                    }}
                  />
                  <div className="hidden w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">SDC</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => renderNavigationItem(item, true))}
            </nav>

            {/* Mobile User Section */}
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={handleLogout}
                  className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <img 
                    src="/SDC/logo.png?v=1" 
                    alt="SDC Logo" 
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      // Fallback si no se encuentra la imagen
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                        fallback.classList.add('flex');
                      }
                    }}
                  />
                  <div className="hidden w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">SDC</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:block">
                {getDisplayName()}
              </span>
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {getDisplayName().charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};