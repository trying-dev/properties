import { PrismaClient } from "@prisma/client";

export class UserManager {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        tenant: true,
      },
    });
  }

  async updateLastLogin(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

export const userManager = new UserManager(new PrismaClient());
