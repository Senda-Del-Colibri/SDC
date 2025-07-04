# SDC Meditaciones - Sistema de Gestión

Una aplicación web para la gestión de un negocio de meditaciones, construida con React, TypeScript, Chakra UI y Supabase.

## Características

- Gestión de clientes
- Gestión de eventos
- Seguimiento de referidos
- Control de asistencias
- Interfaz moderna y responsiva

## Tecnologías

- React 19
- TypeScript
- Chakra UI
- Supabase (Base de datos PostgreSQL)
- React Router
- Formik y Yup para validación de formularios

## Requisitos previos

- Node.js (versión 18 o superior)
- NPM o Yarn
- Cuenta en Supabase (https://supabase.com)

## Configuración

1. Clona este repositorio:
   ```
   git clone <url-del-repositorio>
   cd sdc-app
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   REACT_APP_SUPABASE_URL=tu_url_de_supabase
   REACT_APP_SUPABASE_KEY=tu_clave_anon_de_supabase
   ```

4. Configura la base de datos en Supabase:
   - Crea un nuevo proyecto en Supabase
   - Ve a SQL Editor y ejecuta el script SQL ubicado en `database/schema.sql`

## Ejecución

Para iniciar la aplicación en modo desarrollo:

```
npm start
```

La aplicación estará disponible en http://localhost:3000

## Estructura del proyecto

```
sdc-app/
├── public/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── clients/      # Componentes específicos para clientes
│   │   └── layout/       # Componentes de diseño (Layout, Navbar, Sidebar)
│   ├── context/          # Contextos de React
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Páginas de la aplicación
│   │   ├── clients/      # Página de clientes
│   │   ├── events/       # Página de eventos
│   │   └── home/         # Página de inicio
│   ├── services/         # Servicios para comunicación con API
│   ├── types/            # Definiciones de tipos TypeScript
│   └── utils/            # Utilidades y helpers
├── database/             # Scripts SQL para la base de datos
└── .env                  # Variables de entorno (no incluido en el repositorio)
```

## Modelo de datos

### Clientes
- Información personal de los clientes
- Historial de asistencias
- Referidos generados

### Eventos
- Detalles de los eventos de meditación
- Ubicación, fecha y capacidad
- Información financiera

### Referidos
- Sistema de referidos para nuevos clientes
- Seguimiento del estado de los referidos

### Asistencias
- Control de asistencias a eventos
- Estado de pagos
- Relación cliente-evento
