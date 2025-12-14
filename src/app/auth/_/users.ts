const passwordDemo = process.env.NEXT_PUBLIC_PASSWORD_DEMO || 'No Password'

const adminUsers = [
  {
    role: 'Super Admin',
    email: 'admin1@propiedades.com',
    password: passwordDemo,
  },
  {
    role: 'Manager',
    email: 'admin2@propiedades.com',
    password: passwordDemo,
  },
  {
    role: 'Standard Admin',
    email: 'admin3@propiedades.com',
    password: passwordDemo,
  },
  {
    role: 'Portero (Limited)',
    email: 'portero@propiedades.com',
    password: passwordDemo,
  },
]

const tenantUsers = [
  {
    role: 'Inquilino - Ana Comerciante',
    email: 'comerciante1@gmail.com',
    password: passwordDemo,
  },
  {
    role: 'Inquilino - Pedro Empresario',
    email: 'comerciante2@gmail.com',
    password: passwordDemo,
  },
  {
    role: 'Inquilino - Laura Hernandez',
    email: 'residente1@gmail.com',
    password: passwordDemo,
  },
  {
    role: 'Inquilino - John Smith',
    email: 'extranjero1@gmail.com',
    password: passwordDemo,
  },
]

export const demoUsers = [...adminUsers, ...tenantUsers]
