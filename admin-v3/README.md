# PetoClub Admin v3

Panel de administración completo para la plataforma PetoClub, construido con React, TypeScript y Supabase.

## 🚀 Características

### Módulos Principales
- **Dashboard** con estadísticas en tiempo real
- **Gestión de Usuarios** con roles y permisos
- **Gestión de Mascotas** y perfiles
- **Sistema de Membresías** Premium
- **Tienda Online** completa
- **Gestión de Eventos** y calendario
- **Lugares y Negocios Aliados**
- **Banners Promocionales**
- **Red de Ayuda Comunitaria**
- **Refugios de Animales**
- **Analíticas y Reportes**

### Funcionalidades Técnicas
- Autenticación segura con Supabase Auth
- Roles de administrador y permisos granulares
- Interface responsive y moderna
- Actualizaciones en tiempo real
- Exportación de datos
- Sistema de notificaciones
- Soporte para modo oscuro

## 📋 Prerrequisitos

- Node.js 18+
- npm o yarn
- Acceso a Supabase con permisos de administrador

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   cd project/admin-v3
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crear un archivo `.env` en la raíz del proyecto:
   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Acceder al panel**
   - Abrir http://localhost:3001
   - Iniciar sesión con credenciales de administrador

## 🏗️ Estructura del Proyecto

```
admin-v3/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/             # Componentes UI básicos
│   │   ├── layout/         # Layout y navegación
│   │   ├── auth/           # Componentes de autenticación
│   │   └── forms/          # Formularios específicos
│   ├── pages/              # Páginas principales
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── usuarios/       # Gestión de usuarios
│   │   ├── mascotas/       # Gestión de mascotas
│   │   ├── membresias/     # Gestión de membresías
│   │   ├── tienda/         # Módulo de tienda
│   │   ├── eventos/        # Gestión de eventos
│   │   ├── lugares/        # Gestión de lugares
│   │   ├── banners/        # Gestión de banners
│   │   ├── red-de-ayuda/   # Gestión de Red de Ayuda
│   │   ├── refugios/       # Gestión de refugios
│   │   ├── analytics/      # Analíticas
│   │   └── configuracion/  # Configuración
│   ├── services/           # Servicios de API
│   ├── contexts/           # Contextos de React
│   ├── hooks/              # Hooks personalizados
│   ├── utils/              # Utilidades
│   └── types/              # Tipos TypeScript
├── public/                 # Archivos estáticos
└── package.json           # Dependencias del proyecto
```

## 🗄️ Base de Datos

El panel se conecta a las siguientes tablas principales de Supabase:

### Usuarios y Autenticación
- `profiles` - Perfiles de usuario
- `admin_users` - Usuarios administradores

### Gestión de Mascotas
- `pets` - Información de mascotas
- `pet_photos` - Fotos de mascotas
- `pet_interests` - Intereses de mascotas

### Membresías
- `membership_types` - Tipos de membresía
- `user_memberships` - Membresías de usuarios

### Tienda
- `productos` - Catálogo de productos
- `categorias_productos` - Categorías
- `pedidos` - Órdenes de compra
- `pedidos_items` - Items de pedidos
- `cupones_tienda` - Cupones de descuento

### Eventos y Lugares
- `events` - Eventos programados
- `places` - Lugares y negocios

### Red de Ayuda
- `red_de_ayuda` - Avisos de la red
- `refugios` - Refugios de animales

### Marketing
- `banners` - Banners promocionales
- `coupons` - Códigos de descuento

## 🔐 Permisos y Roles

### Administrador
- Acceso completo a todos los módulos
- Gestión de usuarios y permisos
- Configuración del sistema
- Acceso a analíticas avanzadas

### Usuario con Acceso a Dashboard
- Visualización limitada según permisos
- Gestión básica de contenido
- Reportes restringidos

## 📊 Dashboard y Estadísticas

El dashboard principal muestra:

### Métricas Principales
- Usuarios totales y activos
- Mascotas registradas y activas
- Membresías vendidas y activas
- Pedidos y ingresos
- Eventos y participación
- Avisos de Red de Ayuda
- Refugios registrados

### Actividad Reciente
- Nuevos usuarios
- Pedidos recientes
- Avisos recientes de Red de Ayuda

### Acciones Rápidas
- Acceso directo a módulos principales
- Atajos a funciones comunes

## 🎨 Componentes UI

El proyecto utiliza componentes modernos y accesibles:

### Base UI
- Botones con múltiples variantes
- Formularios controlados
- Tablas de datos con paginación
- Diálogos modales
- Menús desplegables
- Switches y toggles

### Componentes Específicos
- Tarjetas de estadísticas
- Tablas de datos complejas
- Formularios de creación/edición
- Selectores de fecha y hora
- Upload de imágenes
- Visualización de datos

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Previsualizar build de producción
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir automáticamente con ESLint
npm run type-check   # Verificación de tipos TypeScript
```

### Tecnologías Utilizadas
- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Estado**: React Query + Context API
- **UI**: Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Íconos**: Lucide React

### Estándares de Código
- TypeScript strict mode
- ESLint con reglas personalizadas
- Componentes con ForwardRef
- Hooks personalizados para lógica compleja
- Servicios centralizados para API

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Variables de Entorno para Producción
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-production-key
```

### Configuración de Supabase
1. **RLS Policies**: Configurar Row Level Security
2. **Permisos**: Definir roles y accesos
3. **API Keys**: Utilizar keys de producción
4. **Webhooks**: Configurar si es necesario

## 🔒 Seguridad

### Medidas Implementadas
- Autenticación con Supabase Auth
- Verificación de rol de administrador
- Protección de rutas
- Validación de datos en frontend
- Sanitización de inputs
- HTTPS obligatorio en producción

### Buenas Prácticas
- No exponer secrets en el frontend
- Utilizar variables de entorno
- Validar permisos en cada acción
- Implementar rate limiting
- Mantener dependencias actualizadas

## 📈 Mejoras Futuras

### Características Planeadas
- Sistema de notificaciones en tiempo real
- Reportes avanzados y exportación
- Integración con servicios de pago
- Sistema de auditoría
- Multi-idioma
- Temas personalizables
- API para integraciones externas

### Optimizaciones
- Implementación de cache
- Lazy loading de componentes
- Virtual scrolling para tablas grandes
- Optimización de imágenes
- Service Worker para modo offline

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Error de autenticación**: Verificar variables de entorno
2. **Permisos denegados**: Revisar configuración de RLS en Supabase
3. **CORS issues**: Configurar orígenes permitidos en Supabase
4. **Build fails**: Verificar tipos TypeScript

### Debugging
- Usar React DevTools
- Revisar consola de Supabase
- Verificar network requests
- Revisar logs de aplicación

## 📞 Soporte

Para soporte técnico:
- Revisar la documentación de Supabase
- Consultar issues del proyecto
- Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto es propiedad de PetoClub. Todos los derechos reservados.

---

**Desarrollado con ❤️ para PetoClub**