# Properties - Sistema de Gestión Inmobiliaria

Aplicación completa para administración de propiedades, unidades, contratos de arrendamiento y gestión de inquilinos. Construida con Next.js 16, incluye autenticación multi-rol, sistema de pagos y flujo completo del proceso de alquiler.

## Características principales

- Gestión multi-propiedad con unidades individuales
- Sistema de roles granular (Super Admin, Manager, Standard, Limited)
- Flujo completo de proceso de alquiler (desde aplicación hasta contrato activo)
- Gestión de contratos con renovación automática
- Sistema de pagos con penalizaciones por mora
- Registro de inquilinos mediante tokens por email
- Dashboard diferenciado por rol de usuario
- Sistema de documentación para contratos

## Stack tecnológico

- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma ORM + SQLite (desarrollo) / PostgreSQL (producción)
- NextAuth v5 (autenticación y autorización)
- Redux Toolkit (gestión de estado global)
- React Hook Form + Zod (validación de formularios)
- Tailwind CSS 4 + PostCSS
- Resend (emails transaccionales)
- bcryptjs (hashing de contraseñas)

## Requisitos previos

- Node.js 20 o superior
- pnpm 8+ (recomendado) o npm/yarn
- SQLite3 (incluido) o PostgreSQL (producción)

## Instalación

1. Clonar el repositorio e instalar dependencias

```bash
   pnpm install
```

2. Configurar variables de entorno

   Copia `example.env` a `.env` y configura:

```env
   # Base de datos
   DATABASE_URL="file:./dev.db"  # SQLite local
   # DATABASE_URL="postgresql://user:password@localhost:5432/properties"  # PostgreSQL

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="tu-secreto-generado-aqui"  # Genera con: openssl rand -base64 32

   # Resend (emails)
   RESEND_API_KEY="re_..."
   FROM_EMAIL="noreply@tudominio.com"

   # Desarrollo/Testing
   NEXT_PUBLIC_PASSWORD_DEMO="DemoPass123!"
   SEED_PASSWORD="Password@123!"
```

3. Inicializar base de datos

```bash
   # Generar cliente Prisma
   pnpm db:generate

   # Aplicar esquema a la base de datos
   pnpm db:push

   # Cargar datos de ejemplo (opcional)
   pnpm db:seed
```

4. Iniciar servidor de desarrollo

```bash
   pnpm dev
```

La aplicación estará disponible en http://localhost:3000

## Usuarios de prueba

Después de ejecutar `pnpm db:seed`, estarán disponibles las siguientes cuentas (password: valor de `SEED_PASSWORD`):

Administradores:

- Super Admin: admin1@propiedades.com
- Manager: admin2@propiedades.com
- Standard: admin3@propiedades.com
- Portero (Limited): portero@propiedades.com

Inquilinos:

- comerciante1@gmail.com (Ana Comerciante)
- comerciante2@gmail.com (Pedro Empresario)
- residente1@gmail.com (Laura Hernandez)
- extranjero1@gmail.com (John Smith)

## Scripts disponibles

### Desarrollo

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Compilar para producción
pnpm start            # Servidor de producción
pnpm lint             # Ejecutar linter
```

### Base de datos

```bash
pnpm db:generate      # Generar cliente Prisma
pnpm db:push          # Aplicar schema sin migraciones
pnpm db:migrate       # Crear y aplicar migración
pnpm db:studio        # Abrir Prisma Studio (GUI)
pnpm db:seed          # Poblar con datos demo
pnpm db:reset         # Resetear base de datos
```

### Utilidades

```bash
pnpm initPrisma       # Generar cliente y aplicar schema
pnpm prepareDB        # Setup completo de BD
pnpm buildWithSetupDB # Preparar BD y compilar
```

## Estructura del proyecto

```
properties/
├── prisma/
│   ├── models/              # Modelos Prisma separados
│   │   ├── users.prisma     # User, Admin, Tenant
│   │   ├── property.prisma  # Property, Unit
│   │   └── contrato.prisma  # Contract, Payment
│   ├── seeds/               # Datos de ejemplo organizados
│   ├── schema.prisma        # Configuración principal
│   └── seed.js              # Script de seed
├── scripts/
│   └── setup-db.js          # Utilidades de configuración
├── src/
│   ├── actions/             # Server Actions por feature
│   │   ├── auth/            # Login, logout
│   │   ├── admin/           # Gestión de admins
│   │   ├── property/        # CRUD propiedades
│   │   ├── nuevo-proceso/   # Inicio de contratos
│   │   └── ...
│   ├── app/                 # Rutas Next.js (App Router)
│   │   ├── dashboard/
│   │   │   ├── admin/       # Panel administrativo
│   │   │   ├── tenant/      # Panel inquilinos
│   │   │   └── fragments/   # Componentes compartidos
│   │   └── registro-con-token/
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilidades y configuración
│   ├── redux/               # Store, slices, provider
│   ├── types/               # Definiciones TypeScript
│   ├── utils/               # Funciones auxiliares
│   └── middleware.ts        # Protección de rutas
├── public/                  # Assets estáticos
└── package.json
```

## Modelos de datos principales

### User

Usuario base del sistema con información personal, dirección y configuraciones. Puede tener rol de Admin o Tenant.

### Admin

Administrador con niveles jerárquicos: SUPER_ADMIN, MANAGER, STANDARD, LIMITED. Gestiona propiedades y contratos.

### Tenant

Inquilino con información adicional: contacto de emergencia, estado laboral, ingresos y referencias.

### Property

Propiedad inmobiliaria con características, dirección, zonas comunes y relación con unidades.

### Unit

Unidad individual dentro de una propiedad (apartamento, local, etc.) con características específicas y estado de ocupación.

### Contract

Contrato de arrendamiento con estados de proceso completo:

- Proceso: INITIATED → UNDER_REVIEW → DOCUMENTATION → APPROVED
- Contrato: DRAFT → PENDING → ACTIVE
- Finales: EXPIRED, RENEWED, TERMINATED, CANCELLED, REJECTED

### Payment

Registro de pagos asociados a contratos con estados, métodos y penalizaciones por mora.

## Control de acceso

El sistema implementa autorización basada en roles mediante middleware:

- SUPER_ADMIN: Acceso completo al sistema
- MANAGER: Gestión de usuarios y propiedades
- STANDARD: Gestión de propiedades asignadas
- LIMITED: Acceso limitado (ej: portero)
- TENANT: Acceso solo a su información y contratos

Ver `src/middleware.ts` para configuración detallada.

## Flujo de trabajo

### Proceso de nuevo inquilino

1. Admin crea proceso desde unidad disponible
2. Sistema genera token y envía email al inquilino
3. Inquilino se registra mediante token
4. Admin revisa aplicación y documentos
5. Se genera contrato y se envía para firma
6. Contrato se activa y se programan pagos

### Gestión de pagos

Los pagos se generan automáticamente según términos del contrato:

- Penalizaciones automáticas después del periodo de gracia
- Tracking de estado (PENDING, PAID, OVERDUE, PARTIAL)
- Soporte para múltiples métodos de pago

## Migrando a producción

### PostgreSQL

1. Actualizar `DATABASE_URL` en `.env`:

```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

2. Ajustar tipos de datos en los modelos Prisma (descomentar anotaciones `@db.Decimal`, etc.)

3. Ejecutar migraciones:

```bash
   pnpm db:migrate
```

### Variables de entorno críticas

Asegúrate de configurar en producción:

- `NEXTAUTH_SECRET`: Secreto fuerte y único
- `NEXTAUTH_URL`: URL de producción
- `RESEND_API_KEY`: API key válida
- Remover o cambiar `SEED_PASSWORD`

### Seguridad

- Cambiar `isDevMode = true` a `false` en `src/app/page.tsx`
- Eliminar credenciales demo del código
- Revisar middleware para rutas protegidas
- Configurar CORS apropiadamente
- Habilitar rate limiting en producción

## Troubleshooting

### Error: "Required environment variables are missing"

Verifica que todas las variables de `.env` estén configuradas correctamente.

### Error de conexión a base de datos

SQLite: Verifica que el directorio `prisma/` tenga permisos de escritura.
PostgreSQL: Confirma credenciales y que el servidor esté accesible.

### Problemas con emails

Verifica que `RESEND_API_KEY` sea válida y que `FROM_EMAIL` esté verificado en Resend.

### Errores de Prisma

Regenera el cliente: `pnpm db:generate`

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto es privado y propietario.

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
