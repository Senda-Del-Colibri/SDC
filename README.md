# Sistema Web de Gestión Senda del Colibrí

Un sistema web completo para la gestión de clientes, eventos, referidos y asistencias de meditación, desarrollado con React + TypeScript + Supabase.

## 🚀 Características

- **Gestión de Clientes**: Registro y búsqueda de clientes con seguimiento automático de visitas y montos
- **Gestión de Eventos**: Creación y administración de eventos de meditación
- **Sistema de Referidos**: Seguimiento de referidos entre clientes
- **Registro de Asistencias**: Control de asistencia a eventos con actualización automática de estadísticas
- **Dashboard Interactivo**: Estadísticas en tiempo real y navegación intuitiva
- **Autenticación Segura**: Sistema de login con Supabase Auth
- **Diseño Responsivo**: Interfaz optimizada para dispositivos móviles y desktop

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + API REST automática)
- **Autenticación**: Supabase Auth
- **Gestión de Estado**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM v6
- **Notificaciones**: React Toastify
- **Iconografía**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd sdc-system
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Crear proyecto en Supabase
1. Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto
2. Anota la URL del proyecto y la clave anónima

#### 3.2 Configurar base de datos
Ejecuta el siguiente SQL en el editor SQL de Supabase:

```sql
-- Tabla Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(200) NOT NULL,
  celular VARCHAR(15),
  comentarios TEXT,
  visitas INTEGER DEFAULT 0 CHECK (visitas >= 0),
  monto_acumulado DECIMAL(10,2) DEFAULT 0 CHECK (monto_acumulado >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla Eventos
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  ubicacion VARCHAR(300) NOT NULL,
  gasto DECIMAL(10,2) DEFAULT 0 CHECK (gasto >= 0),
  total_cobrado DECIMAL(10,2) DEFAULT 0 CHECK (total_cobrado >= 0),
  cantidad_personas INTEGER DEFAULT 0 CHECK (cantidad_personas >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla Referidos
CREATE TABLE referidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  referido_id UUID REFERENCES clientes(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cliente_id, referido_id),
  CHECK (cliente_id != referido_id)
);

-- Tabla Asistencias
CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  evento_id UUID REFERENCES eventos(id) NOT NULL,
  monto_pagado DECIMAL(10,2) NOT NULL CHECK (monto_pagado >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cliente_id, evento_id)
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at 
    BEFORE UPDATE ON eventos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas de cliente
CREATE OR REPLACE FUNCTION update_cliente_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clientes 
        SET 
            visitas = visitas + 1,
            monto_acumulado = monto_acumulado + NEW.monto_pagado
        WHERE id = NEW.cliente_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Función para actualizar estadísticas de evento
CREATE OR REPLACE FUNCTION update_evento_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE eventos 
        SET 
            cantidad_personas = cantidad_personas + 1,
            total_cobrado = total_cobrado + NEW.monto_pagado
        WHERE id = NEW.evento_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers para actualización automática
CREATE TRIGGER trigger_update_cliente_stats
    AFTER INSERT ON asistencias
    FOR EACH ROW EXECUTE FUNCTION update_cliente_stats();

CREATE TRIGGER trigger_update_evento_stats
    AFTER INSERT ON asistencias
    FOR EACH ROW EXECUTE FUNCTION update_evento_stats();
```

#### 3.3 Configurar Row Level Security (RLS)
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE referidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados
CREATE POLICY "Allow all operations for authenticated users" ON clientes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON eventos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON referidos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON asistencias
    FOR ALL USING (auth.role() = 'authenticated');
```

### 4. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 5. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 👤 Primer Usuario

Para crear el primer usuario administrador, ve a la sección de Authentication en tu dashboard de Supabase y crea un usuario manualmente, o usa el signup en la aplicación (aunque esté comentado en el código de producción).

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes UI base
│   ├── Layout.tsx       # Layout principal
│   └── ProtectedRoute.tsx
├── pages/               # Páginas de la aplicación
│   ├── clientes/        # Módulo de clientes
│   ├── eventos/         # Módulo de eventos
│   ├── referidos/       # Módulo de referidos
│   ├── asistencias/     # Módulo de asistencias
│   ├── Home.tsx         # Dashboard
│   └── Login.tsx        # Autenticación
├── services/            # Servicios de API
│   ├── supabase.ts      # Cliente Supabase
│   ├── api.ts           # Servicios de entidades
│   └── authService.ts   # Servicio de autenticación
├── types/               # Tipos TypeScript
├── utils/               # Utilidades
└── hooks/               # Custom hooks
```

## 🔒 Funcionalidades de Seguridad

- **Autenticación obligatoria**: Todas las rutas están protegidas
- **Row Level Security**: Implementado en Supabase
- **Validaciones**: Frontend y backend
- **Sanitización**: Datos limpios antes de envío

## 🎯 Funcionalidades por Módulo

### Clientes
- ✅ Alta de clientes con validaciones
- ✅ Búsqueda y filtrado
- ✅ Edición de datos básicos
- ❌ Eliminación (no permitida)
- 📊 Campos calculados automáticos

### Eventos
- ✅ Creación de eventos
- ✅ Gestión y consulta
- ✅ Edición de información
- ❌ Eliminación (no permitida)
- 📊 Estadísticas automáticas

### Referidos
- ✅ Registro de referidos
- ✅ Consulta por cliente
- ❌ Modificación/eliminación
- 🔒 Validaciones de integridad

### Asistencias
- ✅ Registro de asistencia
- ❌ Modificación/eliminación
- ⚡ Actualización automática de estadísticas
- 🔒 Una asistencia por cliente/evento

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm run build
# Subir carpeta dist/ a Vercel
```

### Netlify
```bash
npm run build
# Subir carpeta dist/ a Netlify
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linter de código

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica las variables de entorno
- Confirma que las URLs sean correctas
- Revisa que RLS esté configurado

### Problemas de autenticación
- Verifica que el usuario exista en Supabase Auth
- Confirma las políticas de RLS
- Revisa la configuración de Auth en Supabase

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios propuestos.

---

**Desarrollado con ❤️ para Senda del Colibrí**
