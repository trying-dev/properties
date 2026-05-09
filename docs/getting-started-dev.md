# Guia de Inicio para Desarrolladores - Properties

## Bienvenido

Esta guia te ayudara a levantar el proyecto Properties y entender su estructura para que puedas contribuir rapidamente.

---

## 1. Requisitos Previos

- **Node.js 20** o superior
- **pnpm 8+** (recomendado). Alternativa: npm, yarn
- **SQLite3** incluido en el proyecto (no requiere instalacion aparte)
- Editor: VS Code recomendado con extensiones para TypeScript, Prisma, Tailwind CSS

---

## 2. Instalacion Rapida

```bash
# Clonar e instalar
pnpm install

# Configurar variables de entorno
cp example.env .env
# Edita .env con tus valores (minimo: NEXTAUTH_SECRET)

# Inicializar base de datos
pnpm db:generate   # Genera cliente Prisma
pnpm db:push       # Aplica schema a SQLite
pnpm db:seed       # Carga datos de prueba (opcional)

# Iniciar servidor
pnpm dev           # http://localhost:3000
```

---

## 3. Variables de Entorno Esenciales

Archivo: `.env` (copiar de `example.env`)

```env
# Base de datos (SQLite para desarrollo local)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-con: openssl rand -base64 32"

# Email (Resend) - opcional para desarrollo
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@localhost.com"

# Modo testing de email (redirige todos los emails a una direccion)
USING_TESTING_EMAIL=true
RESEND_EMAIL_TEST="tu-email@test.com"

# Demo y seed
NEXT_PUBLIC_PASSWORD_DEMO="DemoPass123!"
SEED_PASSWORD="Password@123!"

# Cron jobs
CRON_SECRET="cron-secret-key"
```

---

## 4. Estructura del Proyecto

```
properties/
├── prisma/
│   ├── schema.sqlite.prisma       # Schema para SQLite (desarrollo)
│   ├── schema.postgresql.prisma   # Schema para PostgreSQL (produccion)
│   ├── prisma.config.ts           # Selecciona schema segun DATABASE_URL
│   └── seed/                      # Datos de prueba
├── src/
│   ├── actions/                   # Server Actions por feature
│   │   ├── auth/                  # Login, registro, verificacion, reset password
│   │   ├── admin/                 # Creacion de administradores
│   │   ├── user/                  # Perfil de usuario
│   │   ├── property/              # CRUD de propiedades y unidades
│   │   ├── units/                 # Listado de unidades (admin)
│   │   ├── payments/              # Gestion de pagos
│   │   ├── processes/             # Procesos de aplicacion
│   │   ├── nuevo-proceso/         # Inicio de proceso de alquiler
│   │   ├── confirmacion-de-inicio-de-proceso/
│   │   ├── registro-con-token/    # Registro via token de invitacion
│   │   ├── codeudor/              # Gestion de co-deudores
│   │   ├── gestion-de-inquilinos/ # CRUD de inquilinos (admin)
│   │   ├── notifications/         # Notificaciones del sistema
│   │   ├── favorites/             # Unidades favoritas
│   │   └── messages/              # Mensajeria (placeholder)
│   ├── app/                       # Rutas Next.js (App Router)
│   │   ├── layout.tsx             # Layout raiz
│   │   ├── page.tsx               # Landing page
│   │   ├── dashboard/             # Paneles de admin y tenant
│   │   │   ├── layout.tsx         # Layout con RequireAuth
│   │   │   ├── admin/             # Rutas de administrador
│   │   │   ├── tenant/            # Rutas de inquilino
│   │   │   ├── property/          # Detalle de propiedad
│   │   │   └── fragments/         # Componentes compartidos del dashboard
│   │   ├── process/               # Wizard de aplicacion (4 pasos)
│   │   ├── registro-con-token/    # Registro con token
│   │   ├── reset-password/        # Recuperacion de contrasena
│   │   ├── codeudor/              # Confirmacion de co-deudor
│   │   ├── units/                 # Detalle publico de unidad
│   │   └── api/cron/              # Endpoints para cron jobs
│   ├── components/                # Componentes reutilizables
│   │   ├── Header/                # Barra de navegacion
│   │   ├── Footer/                # Pie de pagina
│   │   ├── Modal/                 # Modal generico
│   │   ├── auth/                  # Componentes de autenticacion
│   │   └── ConfirmDeleteButton.tsx
│   ├── hooks/                     # Custom hooks
│   │   ├── useSession.ts          # Sesion del cliente
│   │   ├── getSession.ts          # Sesion del servidor
│   │   └── useAppRouter.ts        # Navegacion con fallback
│   ├── lib/                       # Utilidades y configuracion
│   │   ├── prisma.ts              # Cliente Prisma singleton
│   │   ├── auth.ts                # Configuracion NextAuth
│   │   ├── email.ts               # Resolucion de emails
│   │   └── payments/              # Logica de pagos y alertas
│   ├── redux/                     # Estado global
│   │   ├── store.ts               # Configuracion de store
│   │   ├── index.ts               # Hooks tipados + persistencia
│   │   ├── Provider.tsx           # Provider para Next.js
│   │   ├── utils.ts               # Utilidades Redux
│   │   └── slices/                # Slices
│   │       ├── auth.ts            # Estado de autenticacion
│   │       ├── user.ts            # Datos del usuario
│   │       ├── property.ts        # Propiedad en vista
│   │       ├── home.ts            # Unidades y filtros
│   │       └── process.ts         # Wizard de aplicacion
│   ├── types/                     # Declaraciones TypeScript
│   │   └── next-auth.d.ts         # Extension de tipos NextAuth
│   └── utils/                     # Funciones auxiliares
│       └── index.ts               # capitalize, serializeDate
├── public/                        # Assets estaticos
├── docs/                          # Documentacion
│   ├── architecture.md
│   ├── data-model.md
│   ├── api.md
│   ├── flows.md
│   ├── components.md
│   └── getting-started-dev.md
├── scripts/                       # Scripts de utilidad
└── package.json
```

---

## 5. Comandos Principales

### Desarrollo
```bash
pnpm dev              # Iniciar servidor de desarrollo (localhost:3000)
pnpm build            # Compilar para produccion
pnpm start            # Iniciar servidor de produccion
pnpm lint             # Ejecutar ESLint
```

### Base de Datos
```bash
pnpm db:generate      # Generar cliente Prisma
pnpm db:push          # Sincronizar schema con BD (sin migraciones)
pnpm db:migrate       # Crear y aplicar migracion
pnpm db:studio        # Abrir Prisma Studio (GUI en puerto 5555)
pnpm db:seed          # Poblar BD con datos de prueba
pnpm db:reset         # Resetear BD (borra datos)
pnpm initPrisma       # generate + push
pnpm prepareDB        # Setup completo de BD
```

---

## 6. Usuarios de Prueba

Despues de ejecutar `pnpm db:seed`, puedes iniciar sesion con (password = valor de `SEED_PASSWORD`):

| Rol | Email | Nivel |
|-----|-------|-------|
| Admin | admin1@propiedades.com | SUPER_ADMIN |
| Admin | admin2@propiedades.com | MANAGER |
| Admin | admin3@propiedades.com | STANDARD |
| Admin | portero@propiedades.com | LIMITED |
| Inquilino | comerciante1@gmail.com | TENANT |
| Inquilino | comerciante2@gmail.com | TENANT |
| Inquilino | residente1@gmail.com | TENANT |
| Inquilino | extranjero1@gmail.com | TENANT |

---

## 7. Convenciones de Codigo

### Nombres de Archivo
- **Directorios de acciones**: kebab-case (`nuevo-proceso/`, `gestion-de-inquilinos/`)
- **Componentes**: PascalCase (`Header.tsx`, `LoginForm.tsx`)
- **Utilidades**: camelCase (`prisma.ts`, `auth.ts`)
- **Tipos**: `types.ts` junto al codigo que los usa

### Server Actions
- Archivo `index.ts` por modulo de feature
- Funciones que retornan `{ success, data?, error? }` llevan sufijo `Action`
- Las Server Actions verifican siempre `auth()` antes de operar

### Componentes
- Usar `'use client'` solo cuando sea necesario (estado, eventos, hooks)
- Preferir Server Components para contenido estatico
- Formularios usan `useActionState` (React 19) con Server Actions

### Idioma
- **Codigo**: Ingles (nombres de variables, funciones, tipos)
- **UI**: Espanol (textos visibles al usuario)
- **Documentacion**: Espanol

---

## 8. Flujo de Desarrollo Tipico

### Agregar una nueva funcionalidad

1. **Modelo**: Si necesitas nueva tabla, agregala en `schema.sqlite.prisma` y `schema.postgresql.prisma`
2. **Server Action**: Crea directorio en `src/actions/tu-feature/index.ts` con `'use server'`
3. **Pagina**: Agrega ruta en `src/app/dashboard/admin/tu-feature/page.tsx`
4. **Redux** (opcional): Si necesitas estado global, agrega slice en `src/redux/slices/`
5. **Prueba**: `pnpm db:push` para aplicar cambios de schema, `pnpm dev` para probar

### Debugging

- **Prisma Studio**: `pnpm db:studio` abre GUI en `localhost:5555`
- **Next.js logs**: Visible en la terminal al correr `pnpm dev`
- **Redux DevTools**: La store esta configurada para DevTools en desarrollo
- **Email testing**: Con `USING_TESTING_EMAIL=true`, todos los emails van a `RESEND_EMAIL_TEST`

---

## 9. Migracion a Produccion

### Cambiar a PostgreSQL
1. Actualizar `DATABASE_URL` en `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/properties"
   ```
2. `prisma.config.ts` seleccionara automaticamente `schema.postgresql.prisma`
3. Ejecutar `pnpm db:migrate` para crear migraciones iniciales
4. Revisar anotaciones `@db.Decimal` en campos monetarios

### Checklist de Produccion
- [ ] Generar `NEXTAUTH_SECRET` fuerte y unico (no usar el de desarrollo)
- [ ] Configurar `NEXT_PUBLIC_APP_URL` con URL real
- [ ] Verificar `RESEND_API_KEY` de produccion
- [ ] Cambiar `isDevMode = false` en `src/app/page.tsx`
- [ ] Eliminar credenciales demo
- [ ] Configurar `CRON_SECRET` fuerte para endpoints de cron
- [ ] Configurar Vercel Cron (o scheduler externo) para `/api/cron/payments` y `/api/cron/alerts`
- [ ] Revisar CORS, rate limiting, headers de seguridad
- [ ] Auditoria de `SEED_PASSWORD` (no debe existir en produccion)

---

## 10. Documentacion Relacionada

| Documento | Contenido |
|-----------|-----------|
| [architecture.md](./architecture.md) | Arquitectura general, capas, patrones |
| [data-model.md](./data-model.md) | Modelos Prisma, relaciones, enums |
| [api.md](./api.md) | Server Actions por feature, parametros, returns |
| [flows.md](./flows.md) | Flujos de negocio principales |
| [components.md](./components.md) | Componentes, jerarquia, estado |
| [cron-payments.md](./cron-payments.md) | Documentacion de cron jobs de pagos |

---

## 11. Solucion de Problemas

### Error: "Required environment variables are missing"
Verifica que `.env` tenga `NEXTAUTH_SECRET` y `DATABASE_URL`.

### Error de conexion a BD
- SQLite: Verifica que `prisma/` tenga permisos de escritura
- PostgreSQL: Confirma credenciales y accesibilidad del servidor

### Problemas con emails
- Verifica `RESEND_API_KEY`
- En desarrollo usa `USING_TESTING_EMAIL=true`

### Errores de Prisma
- `pnpm db:generate` para regenerar el cliente
- Si hay cambios de schema: `pnpm db:push` (dev) o `pnpm db:migrate` (prod)

### El servidor no inicia
- Verifica Node.js >= 20
- `rm -rf .next && pnpm dev` para limpiar cache
- Revisa que `pnpm install` se haya completado sin errores
