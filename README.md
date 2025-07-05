# SDC - Sistema de Gestión Senda del Colibrí

Sistema web para la gestión de clientes, eventos y asistencias del centro de meditación Senda del Colibrí.

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Query
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Toastify

## 📋 Funcionalidades

- ✅ **Dashboard** con estadísticas generales
- ✅ **Gestión de Clientes** (alta y búsqueda)
- ✅ **Gestión de Eventos** (alta y búsqueda)
- ✅ **Registro de Asistencias**
- ✅ **Consulta de Referidos**
- ✅ **Autenticación** con Supabase
- ✅ **Responsive Design**

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🌐 Deploy en GitHub Pages

### Configuración Automática

El proyecto está configurado para deploy automático en GitHub Pages usando GitHub Actions.

### Deploy Manual

```bash
# Instalar gh-pages si no está instalado
npm install -g gh-pages

# Deploy manual
npm run deploy
```

### Configuración en GitHub

1. Ve a **Settings** > **Pages** en tu repositorio
2. Selecciona **Source**: GitHub Actions
3. El deploy se ejecutará automáticamente en cada push a `main`

### URL de Acceso

Una vez deployado, la aplicación estará disponible en:
```
https://tu-usuario.github.io/SDC/
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes UI básicos
│   └── Layout.tsx      # Layout principal
├── pages/              # Páginas de la aplicación
│   ├── auth/           # Páginas de autenticación
│   ├── clientes/       # Gestión de clientes
│   ├── eventos/        # Gestión de eventos
│   └── asistencias/    # Registro de asistencias
├── services/           # Servicios y API
├── hooks/              # Custom hooks
├── types/              # Definiciones de tipos
└── utils/              # Utilidades
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Base de Datos

Ejecuta el script `supabase-setup.sql` en tu proyecto de Supabase para crear las tablas y configuraciones necesarias.

## 📦 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de producción
- `npm run lint` - Linter de código
- `npm run deploy` - Deploy manual a GitHub Pages

## 🔒 Seguridad

- Autenticación mediante Supabase Auth
- Row Level Security (RLS) habilitado
- Validaciones tanto en frontend como backend
- Manejo seguro de variables de entorno

## 📱 Responsive

La aplicación está optimizada para:
- 📱 **Mobile**: Navegación con menú hamburguesa
- 💻 **Desktop**: Barra lateral colapsable
- 📊 **Tablet**: Diseño adaptativo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está destinado únicamente para uso interno de Senda del Colibrí.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el sistema, contacta al administrador del proyecto.

---

**Desarrollado con ❤️ para Senda del Colibrí**
