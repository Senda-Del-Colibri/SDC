# Sistema de Gestión Senda del Colibrí

Sistema web completo para la gestión de un centro de meditación, desarrollado con React, TypeScript, Vite y Supabase.

## 🌟 Características

- **Gestión de Clientes**: Registro, búsqueda y actualización de información de clientes
- **Gestión de Eventos**: Creación y administración de eventos de meditación
- **Sistema de Referidos**: Seguimiento de referencias entre clientes
- **Control de Asistencias**: Registro de asistencia a eventos con montos
- **Dashboard Interactivo**: Estadísticas en tiempo real y navegación intuitiva
- **Autenticación Segura**: Sistema de login con Supabase Auth
- **Diseño Responsivo**: Interfaz optimizada para móviles y escritorio

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: TailwindCSS con tema personalizado
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estado**: React Query para manejo de estado del servidor
- **Navegación**: React Router DOM v6
- **Iconos**: Lucide React
- **Notificaciones**: React Toastify

## 📊 Esquema de Base de Datos

### Estructura de IDs
- **Clientes**: IDs numéricos de 6 dígitos (comenzando en 100000)
- **Eventos**: IDs numéricos comenzando en 1
- **Referidos**: IDs numéricos secuenciales desde 1
- **Asistencias**: IDs numéricos secuenciales desde 1

### Tablas

#### Clientes
```sql
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY DEFAULT nextval('clientes_id_seq'), -- 6 dígitos: 100000+
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(200) NOT NULL,
  celular VARCHAR(15),
  comentarios TEXT,
  visitas INTEGER DEFAULT 0, -- Calculado automáticamente
  monto_acumulado DECIMAL(10,2) DEFAULT 0, -- Calculado automáticamente
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Eventos
```sql
CREATE TABLE eventos (
  id INTEGER PRIMARY KEY DEFAULT nextval('eventos_id_seq'), -- Comenzando en 1
  nombre VARCHAR(200) NOT NULL,
  ubicacion VARCHAR(300) NOT NULL,
  gasto DECIMAL(10,2) DEFAULT 0,
  total_cobrado DECIMAL(10,2) DEFAULT 0, -- Calculado automáticamente
  cantidad_personas INTEGER DEFAULT 0, -- Calculado automáticamente
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Referidos
```sql
CREATE TABLE referidos (
  id INTEGER PRIMARY KEY DEFAULT nextval('referidos_id_seq'),
  cliente_id INTEGER REFERENCES clientes(id) NOT NULL,
  referido_id INTEGER REFERENCES clientes(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cliente_id, referido_id),
  CHECK (cliente_id != referido_id)
);
```

#### Asistencias
```sql
CREATE TABLE asistencias (
  id INTEGER PRIMARY KEY DEFAULT nextval('asistencias_id_seq'),
  cliente_id INTEGER REFERENCES clientes(id) NOT NULL,
  evento_id INTEGER REFERENCES eventos(id) NOT NULL,
  monto_pagado DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cliente_id, evento_id)
);
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn
- Cuenta de Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd SDC
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Configurar la base de datos**
- Crear un nuevo proyecto en [Supabase](https://supabase.com)
- Ejecutar el script `supabase-setup.sql` en el SQL Editor de Supabase
- Esto creará todas las tablas, triggers, índices y políticas de seguridad

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Construir para producción**
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes base (Button, Input, Card, etc.)
│   ├── Layout.tsx       # Layout principal con navegación
│   └── ProtectedRoute.tsx
├── pages/               # Páginas de la aplicación
│   ├── clientes/        # Módulo de clientes
│   ├── eventos/         # Módulo de eventos
│   ├── referidos/       # Módulo de referidos
│   ├── asistencias/     # Módulo de asistencias
│   ├── Home.tsx         # Dashboard principal
│   └── Login.tsx        # Página de login
├── services/            # Servicios y API
│   ├── supabase.ts      # Cliente de Supabase
│   ├── authService.ts   # Servicios de autenticación
│   └── api.ts           # Servicios de API para cada módulo
├── hooks/               # Hooks personalizados
├── types/               # Definiciones de tipos TypeScript
├── utils/               # Utilidades y helpers
└── styles/              # Estilos globales
```

## 🔧 Configuración de Desarrollo

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de la construcción
- `npm run lint` - Verificación de código con ESLint

### Arquitectura de Componentes
El proyecto sigue una arquitectura modular basada en:
- **Componentes UI reutilizables** en `components/ui/`
- **Páginas específicas** organizadas por módulo
- **Servicios centralizados** para manejo de datos
- **Hooks personalizados** para lógica compartida
- **Tipos TypeScript** para seguridad de tipos

## 📋 Reglas de Negocio

### Clientes
- ✅ Crear, leer, actualizar
- ❌ No se pueden eliminar
- 🔄 Visitas y monto acumulado se calculan automáticamente

### Eventos
- ✅ Crear, leer, actualizar
- ❌ No se pueden eliminar
- 🔄 Total cobrado y cantidad de personas se calculan automáticamente

### Referidos
- ✅ Crear, leer
- ❌ No se pueden actualizar ni eliminar
- 🚫 Un cliente no puede referirse a sí mismo
- 🔒 Relación única entre cliente y referido

### Asistencias
- ✅ Solo crear
- ❌ No se pueden actualizar ni eliminar
- 🔒 Una asistencia por cliente por evento
- 🔄 Actualiza automáticamente estadísticas de cliente y evento

## 🎨 Diseño y UX

- **Tema de colores**: Inspirado en la meditación con tonos tierra y verdes
- **Responsive**: Diseño mobile-first con TailwindCSS
- **Accesibilidad**: Componentes accesibles con ARIA labels
- **Animaciones**: Transiciones suaves y feedback visual
- **Iconografía**: Lucide React para iconos consistentes

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Autenticación requerida** para todas las operaciones
- **Validación de datos** en frontend y backend
- **Sanitización de inputs** para prevenir inyecciones
- **Políticas de acceso** configuradas en Supabase

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Deploy automático en cada push

### Netlify
1. Conectar repositorio a Netlify
2. Configurar variables de entorno
3. Deploy automático

### Manual
```bash
npm run build
# Subir carpeta dist/ a tu servidor web
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte o preguntas sobre el sistema, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para Senda del Colibrí**
