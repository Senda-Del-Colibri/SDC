import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card, CardBody } from '../components/ui';
import { toast } from 'react-toastify';
import { sanitizeInput, validateEmail, checkRateLimit } from '../utils/security';

export const Login: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Si ya está autenticado, redirigir al dashboard
  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Sanitizar y validar email
    const cleanEmail = sanitizeInput(formData.email.trim());
    if (!cleanEmail) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(cleanEmail)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar contraseña
    const cleanPassword = sanitizeInput(formData.password);
    if (!cleanPassword) {
      newErrors.password = 'La contraseña es requerida';
    } else if (cleanPassword.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Rate limiting para prevenir ataques de fuerza bruta
    if (!checkRateLimit('login', 5, 300000)) { // 5 intentos por 5 minutos
      toast.error('Demasiados intentos de login. Espera 5 minutos.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { user, error } = await AuthService.signIn(formData.email, formData.password);
      
      if (error) {
        toast.error(error);
      } else if (user) {
        toast.success('¡Bienvenido a Senda del Colibrí!');
        navigate('/', { replace: true });
      }
    } catch {
      toast.error('Error inesperado al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Senda del Colibrí
          </h2>
          <p className="text-gray-600">
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        {/* Login Form */}
        <Card className="animate-fadeIn">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                icon={LogIn}
              >
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                  onClick={() => toast.info('Contacta al administrador para crear una cuenta')}
                >
                  Contactar administrador
                </button>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Senda del Colibrí. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}; 