"use server";

import { processConfirmationManager } from "./manager";
import { emailService } from "./emailResend";

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

// 🔧 FUNCIONES AUXILIARES NECESARIAS

/**
 * Genera un token único para el registro
 */
async function generateRegistrationToken(): Promise<string> {
  const crypto = await import("crypto");
  return crypto.randomBytes(32).toString("hex");
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
    const details = await processConfirmationManager.getProcessDetails({
      unitId,
      tenantId,
    });

    const tenantUser = details.tenant.user;

    // 🔍 DETERMINAR TIPO DE USUARIO
    const isNewUser = tenantUser.password === null;

    let emailResult;

    if (isNewUser) {
      // 🎯 FLUJO 1: USUARIO NUEVO
      console.log("📧 Enviando email de registro para usuario nuevo:", tenantUser.email);

      // Generar token de registro
      const registrationToken = await generateRegistrationToken();

      // Guardar token en la base de datos
      await processConfirmationManager.updateUserRegistrationToken(tenantUser.id, registrationToken);

      // Enviar email con token para completar registro
      emailResult = await emailService.sendNewUserRegistrationEmail({
        // tenantEmail: tenantUser.email,
        tenantEmail: "revi-pruebas@outlook.com",
        tenantName: `${tenantUser.name} ${tenantUser.lastName}`,
        registrationToken,
      });
    } else {
      // 🎯 FLUJO 2: USUARIO EXISTENTE
      console.log("📧 Enviando email de continuación para usuario existente:", tenantUser.email);

      // Enviar email simple para continuar proceso
      emailResult = await emailService.sendExistingUserContinueEmail({
        // tenantEmail: tenantUser.email,
        tenantEmail: "revi-pruebas@outlook.com",
        tenantName: `${tenantUser.name} ${tenantUser.lastName}`,
      });
    }

    // revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        contract,
        emailSent: emailResult.success,
        emailId: emailResult.emailId,
        userType: isNewUser ? "new" : "existing",
        emailType: isNewUser ? "registration" : "continue",
      },
      message: isNewUser
        ? "Contrato inicializado y email de registro enviado al usuario nuevo"
        : "Contrato inicializado y email de continuación enviado al usuario existente",
    };
  } catch (error) {
    console.error("Error en initializeContractAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al inicializar el contrato",
    };
  }
}
