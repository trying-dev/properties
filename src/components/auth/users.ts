// Cuentas demo sembradas por prisma/seed (contraseña por defecto: password123).
// Se muestran en el menú "Usuarios Demo" del login para autocompletar.
const passwordDemo = process.env.NEXT_PUBLIC_PASSWORD_DEMO || 'password123'

const adminUsers = [
  {
    role: 'Super Admin — Maria Garcia',
    email: 'm.garciamontejo@propiedades.com',
    password: passwordDemo,
  },
  {
    role: 'Admin — Carlos',
    email: 'admin1@propiedades.com',
    password: passwordDemo,
  },
  {
    role: 'Admin — Luis Gerente',
    email: 'admin3@propiedades.com',
    password: passwordDemo,
  },
]

const ownerUsers = [
  {
    role: 'Dueño Tibabuyes 60% — Roberto',
    email: 'r.gutierrezpena@owner-properties.com',
    password: passwordDemo,
  },
  {
    role: 'Dueño Tibabuyes 40% — Clara',
    email: 'c.montoyarios@owner-properties.com',
    password: passwordDemo,
  },
]

const tenantUsers = [
  {
    role: 'Inquilino Tibabuyes C1-LOCAL-A — Juan',
    email: 'j.perezgomez@tenant-properties.com',
    password: passwordDemo,
  },
  {
    role: 'Inquilino Tibabuyes — Laura',
    email: 'l.torresdiaz@tenant-properties.com',
    password: passwordDemo,
  },
]

export const demoUsers = [...adminUsers, ...ownerUsers, ...tenantUsers]
