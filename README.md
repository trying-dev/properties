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
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
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
pnpm dev              # Servidor local (regenera cliente sqlite y arranca)
pnpm dev:prod         # Servidor local apuntando a la BD de PRODUCCIÓN
pnpm build            # Compilar para producción
pnpm build:seed       # Compilar sembrando la BD antes (usado en el deploy)
pnpm start            # Servidor de producción
pnpm lint             # Ejecutar linter
```

### Base de datos

```bash
pnpm db:generate      # Generar cliente Prisma (según DATABASE_URL)
pnpm db:push          # Aplicar schema sin migraciones
pnpm db:migrate       # Crear y aplicar migración
pnpm db:studio        # Abrir Prisma Studio (GUI)
pnpm db:seed          # Poblar la BD LOCAL con datos demo
pnpm db:reset         # Resetear base de datos
```

### Tocar producción desde local

Todos apuntan a `PROD_DATABASE_URL` (ver [Base de datos: local vs producción](#base-de-datos-local-vs-producción)):

```bash
pnpm db:studio:prod   # Inspeccionar la BD de prod
pnpm db:push:prod     # Sincronizar schema hacia prod
pnpm db:seed:prod     # Sembrar prod (⚠️ BORRA todo; regenera + push + seed)
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

## Base de datos: local vs producción

El proyecto usa **un solo `.env`** y elige la base según la URL, sin código de detección:

| Entorno | Cómo se elige la BD | Qué haces |
|---|---|---|
| **Local** (`pnpm dev`) | `DATABASE_URL` = SQLite (`file:...`) | nada, `localhost:3000` usa SQLite |
| **Producción** (Vercel) | Vercel inyecta su `DATABASE_URL` + `PRISMA_DATABASE_URL` | nada, se resuelve solo |
| **Prod desde local** | los scripts `*:prod` intercambian `PROD_DATABASE_URL` → `DATABASE_URL` | usar `pnpm *:prod` |

### Cómo funciona

- **Selección de schema/adapter automática** por el prefijo de `DATABASE_URL`:
  - `file:` → SQLite · `libsql://` → Turso · `postgres://` → PostgreSQL.
  - Lógica en [`prisma.config.ts`](prisma.config.ts) (elige `schema.sqlite.prisma` o `schema.postgresql.prisma`) y [`src/lib/prisma.ts`](src/lib/prisma.ts) (adapter/Accelerate).
- **El cliente Prisma se compila para UN provider** en cada `prisma generate`. Por eso `pnpm dev` y `pnpm dev:prod` regeneran el cliente al arrancar (SQLite vs PostgreSQL). Alternar es transparente, cuesta ~100 ms.
- **Un solo `.env`.** La BD de prod vive en `PROD_DATABASE_URL` (y `PROD_PRISMA_DATABASE_URL` para Accelerate). Los scripts `*:prod` usan [`scripts/prod-db.mjs`](scripts/prod-db.mjs), que carga `.env`, pone `DATABASE_URL = PROD_DATABASE_URL` y ejecuta el comando. Vercel **no** auto-carga estas vars → cero riesgo de tocar prod por accidente.

### Sembrar / desplegar

- El seed hace `resetDatabase()` (**borra toda la base**). Guarda en [`prisma/seed/index.ts`](prisma/seed/index.ts): rechaza cualquier BD que no sea SQLite local salvo `ALLOW_PROD_SEED=yes` (lo setean `db:seed:prod` y `build:seed`).
- En Vercel, el **Build Command** es `pnpm build:seed` → `generate → db push → seed → build`. Repuebla prod en cada deploy (útil mientras no haya datos reales; quitar al entrar en testeo/producción real).
- Si prefieres NO reseedear en cada deploy: deja el Build Command en `pnpm build` y siembra a mano con `pnpm db:seed:prod` cuando haga falta.

> Nota: cada seed regenera los `id` (cuid). Enlaces `/units/<id>` viejos dejan de existir tras reseedear.

## Migrando a producción

### Variables de entorno críticas

Asegúrate de configurar en producción:

- `NEXTAUTH_SECRET`: Secreto fuerte y único
- `NEXT_PUBLIC_APP_URL`: URL de producción
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

### Error: `unknown variant 'postgres', expected 'sqlite'` (o al revés)

El cliente Prisma quedó compilado para otro provider que la `DATABASE_URL` activa.
Regenera para el entorno correcto: `pnpm dev` (SQLite) o `pnpm dev:prod` (PostgreSQL);
ambos regeneran el cliente al arrancar.

### Error: `The column X does not exist` / `P2022`

Drift de schema: la BD está atrás del `.prisma`. Sincroniza el schema:
`pnpm db:push` (local) o `pnpm db:push:prod` (prod). `db:seed:prod` y `build:seed`
ya hacen `db push` antes de sembrar.

### Error: `⛔ Seed BLOQUEADO`

Protección anti-borrado: el seed borra toda la base y solo corre en SQLite local.
Para sembrar prod a propósito: `pnpm db:seed:prod` (setea `ALLOW_PROD_SEED=yes`).

### Página `/units/<id>` da 404 pero aparece en la home

La BD del entorno no tiene ese registro (BD de prod vacía, o `id` cambió tras un
reseed). Verifica con `pnpm db:studio:prod` y siembra si hace falta.

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
