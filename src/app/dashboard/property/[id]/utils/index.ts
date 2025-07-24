import { AdminLevel } from "@prisma/client";

export const formatAdminLevel = (level: AdminLevel) => {
  const levels = {
    SUPER_ADMIN: "Super Administrador",
    MANAGER: "Manager",
    STANDARD: "Estándar",
    LIMITED: "Limitado",
  };
  return levels[level];
};
