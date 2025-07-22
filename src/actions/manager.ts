// lib/db/property-manager.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

// ========================================
// TIPOS Y INTERFACES
// ========================================

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: Record<string, "asc" | "desc">;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ========================================
// CLASE BASE PARA MANEJO DE ERRORES Y OPERACIONES
// ========================================

export class BaseManager {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Método genérico mejorado para manejar errores
  protected async handlePrismaOperation<T>(
    operation: () => Promise<T>,
    context?: string,
  ): Promise<DatabaseResult<T>> {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error(`Prisma operation error${context ? ` in ${context}` : ""}:`, error);

      // Manejo específico de errores de Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return {
          success: false,
          error: this.getPrismaErrorMessage(error),
          code: error.code,
        };
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        return {
          success: false,
          error: "Validation error: Invalid data provided",
          code: "VALIDATION_ERROR",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown database error",
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // Mapeo de códigos de error de Prisma a mensajes legibles
  private getPrismaErrorMessage(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case "P2002":
        return "Record already exists with this unique field";
      case "P2025":
        return "Record not found";
      case "P2003":
        return "Foreign key constraint failed";
      case "P2016":
        return "Query interpretation error";
      default:
        return `Database error: ${error.message}`;
    }
  }

  // Método para paginación
  protected calculatePagination(page: number = 1, limit: number = 10, total: number) {
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

// ========================================
// PROPERTY MANAGER PRINCIPAL
// ========================================

export class PropertyManager extends BaseManager {
  // ========================================
  // GESTIÓN DE PROPIEDADES
  // ========================================

  async createProperty(data: Prisma.PropertyCreateInput): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(
      () =>
        this.prisma.property.create({
          data,
          include: {
            information: true,
            economy: true,
            units: true,
            admin: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
      "createProperty",
    );
  }

  async getProperty(id: string): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(
      () =>
        this.prisma.property.findUnique({
          where: { id },
          include: {
            information: true,
            economy: true,
            legal: {
              include: {
                titleDocuments: true,
                fiscalDetails: true,
              },
            },
            units: {
              include: {
                contracts: {
                  where: {
                    isActive: true,
                  },
                  include: {
                    tenants: {
                      include: {
                        user: {
                          select: {
                            id: true,
                            name: true,
                            lastName: true,
                            email: true,
                            phone: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            insurances: {
              where: {
                status: "ACTIVE",
              },
            },
            services: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        }),
      "getProperty",
    );
  }

  async getPropertiesPaginated(
    adminId?: string,
    options: PaginationOptions = {},
  ): Promise<DatabaseResult<PaginatedResult<any>>> {
    return this.handlePrismaOperation(async () => {
      const { page = 1, limit = 10, orderBy = { createdAt: "desc" } } = options;

      const where = adminId ? { adminId } : {};

      const [properties, total] = await Promise.all([
        this.prisma.property.findMany({
          where,
          ...this.calculatePagination(page, limit, 0),
          orderBy,
          include: {
            information: {
              select: {
                propertyType: true,
                streetAndNumber: true,
                neighborhood: true,
                cityAndState: true,
              },
            },
            units: {
              select: {
                id: true,
                isAvailable: true,
              },
            },
            _count: {
              select: {
                units: true,
                contracts: true,
              },
            },
          },
        }),
        this.prisma.property.count({ where }),
      ]);

      const pagination = this.calculatePagination(page, limit, total);

      return {
        data: properties,
        pagination: pagination.pagination,
      };
    }, "getPropertiesPaginated");
  }

  // ========================================
  // GESTIÓN DE UNIDADES Y CONTRATOS
  // ========================================

  async createUnit(data: Prisma.UnitCreateInput): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(
      () =>
        this.prisma.unit.create({
          data,
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      "createUnit",
    );
  }

  async createContract(data: Prisma.ContractCreateInput): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(
      () =>
        this.prisma.contract.create({
          data,
          include: {
            unit: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            tenants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        }),
      "createContract",
    );
  }

  // ========================================
  // GESTIÓN FINANCIERA
  // ========================================

  async createTransaction(data: Prisma.TransactionCreateInput): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(
      () =>
        this.prisma.transaction.create({
          data,
          include: {
            economy: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            tenant: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        }),
      "createTransaction",
    );
  }

  async getFinancialSummary(propertyId: string): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(async () => {
      const [income, expenses, property] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            economy: { propertyId },
            type: "INCOME",
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            economy: { propertyId },
            type: "EXPENSE",
          },
          _sum: { amount: true },
        }),
        this.prisma.property.findUnique({
          where: { id: propertyId },
          include: {
            economy: true,
            units: {
              include: {
                contracts: {
                  where: { isActive: true },
                },
              },
            },
          },
        }),
      ]);

      const totalIncome = income._sum.amount || 0;
      const totalExpenses = expenses._sum.amount || 0;
      const netIncome = totalIncome - totalExpenses;

      const occupiedUnits =
        property?.units.filter((unit) => unit.contracts.some((contract) => contract.isActive)).length || 0;

      const occupancyRate = property?.units.length ? (occupiedUnits / property.units.length) * 100 : 0;

      return {
        propertyId,
        totalIncome,
        totalExpenses,
        netIncome,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        totalUnits: property?.units.length || 0,
        occupiedUnits,
      };
    }, "getFinancialSummary");
  }

  // ========================================
  // GESTIÓN DE MANTENIMIENTO
  // ========================================

  async createMaintenance(data: Prisma.MaintenanceCreateInput): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(
      () =>
        this.prisma.maintenance.create({
          data,
          include: {
            architecture: true,
            equipment: true,
            worker: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        }),
      "createMaintenance",
    );
  }

  async getUpcomingMaintenances(propertyId?: string): Promise<DatabaseResult<any[]>> {
    return this.handlePrismaOperation(
      () =>
        this.prisma.maintenance.findMany({
          where: {
            ...(propertyId && {
              OR: [{ architecture: { propertyId } }, { equipment: { propertyId } }],
            }),
            status: {
              in: ["PENDING", "SCHEDULED"],
            },
            maintenanceDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Próximos 30 días
            },
          },
          include: {
            architecture: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            equipment: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            worker: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: {
            maintenanceDate: "asc",
          },
        }),
      "getUpcomingMaintenances",
    );
  }

  // ========================================
  // GESTIÓN DE COMUNICACIÓN
  // ========================================

  async createMessage(data: Prisma.MessageCreateInput): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(
      () =>
        this.prisma.message.create({
          data,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      "createMessage",
    );
  }

  // ========================================
  // DASHBOARD Y REPORTES
  // ========================================

  async getDashboardData(adminId?: string): Promise<DatabaseResult<any>> {
    return this.handlePrismaOperation(async () => {
      const where = adminId ? { adminId } : {};

      const [
        totalProperties,
        totalUnits,
        occupiedUnits,
        pendingMaintenances,
        recentTransactions,
        expiringContracts,
      ] = await Promise.all([
        this.prisma.property.count({ where }),

        this.prisma.unit.count({
          where: {
            property: where,
          },
        }),

        this.prisma.unit.count({
          where: {
            property: where,
            isAvailable: false,
          },
        }),

        this.prisma.maintenance.count({
          where: {
            OR: [{ architecture: { property: where } }, { equipment: { property: where } }],
            status: {
              in: ["PENDING", "SCHEDULED"],
            },
          },
        }),

        this.prisma.transaction.findMany({
          where: {
            economy: {
              property: where,
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            economy: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),

        this.prisma.contract.count({
          where: {
            unit: {
              property: where,
            },
            isActive: true,
            endDate: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Próximos 30 días
            },
          },
        }),
      ]);

      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      return {
        summary: {
          totalProperties,
          totalUnits,
          occupiedUnits,
          occupancyRate: Math.round(occupancyRate * 100) / 100,
          pendingMaintenances,
          expiringContracts,
        },
        recentActivity: {
          transactions: recentTransactions,
        },
      };
    }, "getDashboardData");
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  async healthCheck(): Promise<DatabaseResult<boolean>> {
    return this.handlePrismaOperation(async () => {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    }, "healthCheck");
  }

  async closeConnection(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// ========================================
// INSTANCIA SINGLETON
// ========================================

let prismaInstance: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return prismaInstance;
}

export const propertyManager = new PropertyManager(getPrismaClient());

// Cleanup en el cierre de la aplicación
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    await propertyManager.closeConnection();
  });
}
