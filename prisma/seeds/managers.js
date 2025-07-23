// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient, AdminLevel, Permission } = require("@prisma/client");

async function createUsersAndAdmins(prisma) {
  console.log("🌱 Iniciando seed de usuarios administradores...");

  // Datos base para usuarios
  const baseUsers = [
    {
      name: "Juan",
      lastName: "Melo",
      email: "juan.super@properties.com",
      phone: "+57 300 123 4567",
      address: "Calle 100 #15-25, Bogotá",
      adminLevel: AdminLevel.SUPER_ADMIN,
      permissions: [Permission.FULL_ACCESS],
    },
    {
      name: "María",
      lastName: "González",
      email: "maria.manager@properties.com",
      phone: "+57 301 234 5678",
      address: "Carrera 11 #93-45, Bogotá",
      adminLevel: AdminLevel.MANAGER,
      permissions: [
        Permission.PROPERTY_MANAGEMENT,
        Permission.FINANCIAL_MANAGEMENT,
        Permission.USER_MANAGEMENT,
      ],
    },
    {
      name: "Luis",
      lastName: "Martínez",
      email: "luis.standard@properties.com",
      phone: "+57 302 345 6789",
      address: "Avenida 19 #120-30, Bogotá",
      adminLevel: AdminLevel.STANDARD,
      permissions: [Permission.PROPERTY_MANAGEMENT, Permission.MAINTENANCE_MANAGEMENT],
    },
    {
      name: "Ana",
      lastName: "López",
      email: "ana.limited@properties.com",
      phone: "+57 303 456 7890",
      address: "Calle 72 #10-15, Bogotá",
      adminLevel: AdminLevel.LIMITED,
      permissions: [Permission.READ_ONLY],
    },
    {
      name: "Roberto",
      lastName: "Silva",
      email: "roberto.financial@properties.com",
      phone: "+57 304 567 8901",
      address: "Carrera 15 #85-20, Bogotá",
      adminLevel: AdminLevel.STANDARD,
      permissions: [Permission.FINANCIAL_MANAGEMENT],
    },
    {
      name: "Patricia",
      lastName: "Hernández",
      email: "patricia.maintenance@properties.com",
      phone: "+57 305 678 9012",
      address: "Calle 63 #12-40, Bogotá",
      adminLevel: AdminLevel.STANDARD,
      permissions: [Permission.MAINTENANCE_MANAGEMENT],
    },
  ];

  // Crear usuarios y administradores
  for (const userData of baseUsers) {
    try {
      console.log(`📝 Creando usuario: ${userData.name} ${userData.lastName} (${userData.adminLevel})`);

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          status: "ACTIVE",
          birthDate: new Date(
            1980 + Math.floor(Math.random() * 25),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1,
          ),
        },
      });

      // Crear admin
      const admin = await prisma.admin.create({
        data: {
          userId: user.id,
          adminLevel: userData.adminLevel,
        },
      });

      // Crear permisos
      for (const permission of userData.permissions) {
        await prisma.adminPermission.create({
          data: {
            adminId: admin.id,
            permission: permission,
          },
        });
      }

      console.log(`✅ Usuario creado exitosamente: ${userData.email}`);
      console.log(`   - AdminLevel: ${userData.adminLevel}`);
      console.log(`   - Permisos: ${userData.permissions.join(", ")}`);
      console.log("");
    } catch (error) {
      console.error(`❌ Error creando usuario ${userData.email}:`, error.message);
    }
  }

  // Mostrar resumen
  console.log("📊 RESUMEN DE USUARIOS CREADOS:");
  console.log("================================");

  const adminLevels = await prisma.admin.groupBy({
    by: ["adminLevel"],
    _count: {
      adminLevel: true,
    },
  });

  for (const level of adminLevels) {
    console.log(`${level.adminLevel}: ${level._count.adminLevel} usuario(s)`);
  }

  console.log("");
  console.log("📋 PERMISOS ASIGNADOS:");
  console.log("======================");

  const permissions = await prisma.adminPermission.groupBy({
    by: ["permission"],
    _count: {
      permission: true,
    },
  });

  for (const perm of permissions) {
    console.log(`${perm.permission}: ${perm._count.permission} usuario(s)`);
  }

  console.log("");
  console.log("🎉 Seed de usuarios completado exitosamente!");
}

// Función principal para ejecutar directamente si es necesario
async function main() {
  const prisma = new PrismaClient();

  try {
    await createUsersAndAdmins(prisma);
  } catch (error) {
    console.error("💥 Error en el seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exportar la función
module.exports = { createUsersAndAdmins };

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
