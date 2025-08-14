"use server";

import { revalidatePath } from "next/cache";
import { processConfirmationManager } from "./manager";

export async function getProcessDetailsAction(unitId: string, tenantId: string) {
  try {
    const details = await processConfirmationManager.getProcessDetails({ unitId, tenantId });
    return { success: true, data: details };
  } catch (error) {
    console.error("Error en getProcessDetailsAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener detalles del proceso",
    };
  }
}

export async function initializeContractAction({
  unitId,
  tenantId,
  adminId,
  notes,
}: {
  unitId: string;
  tenantId: string;
  adminId: string;
  notes?: string;
}) {
  try {
    // Inicializar el contrato
    const contract = await processConfirmationManager.initializeContract({
      unitId,
      tenantId,
      adminId,
      notes,
    });

    // Obtener detalles para el email
    const details = await processConfirmationManager.getProcessDetails({ unitId, tenantId });

    const unitInfo = `${details.unit.property.name} - Unidad ${details.unit.unitNumber}`;

    // Enviar email de notificación
    const emailResult = await processConfirmationManager.sendNotificationEmail({
      // tenantEmail: details.tenant.user.email,
      tenantEmail: "revi-pruebas@outlook.com",
      tenantName: `${details.tenant.user.name} ${details.tenant.user.lastName}`,
      unitInfo,
      processId: contract.id,
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        contract,
        emailSent: emailResult.success,
        emailId: emailResult.emailId,
      },
      message: "Contrato inicializado exitosamente y email enviado",
    };
  } catch (error) {
    console.error("Error en initializeContractAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al inicializar el contrato",
    };
  }
}
