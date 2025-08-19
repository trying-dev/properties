"use server";

import { resitroConToken } from "./manager";

export async function validateRegistrationToken(token: string) {
  try {
    if (!token) {
      return {
        success: false,
        error: "Token no proporcionado o inválido",
      };
    }

    const tenant = await resitroConToken.validateRegistrationToken(token);

    return {
      success: true,
      tenant: tenant,
    };
  } catch (error) {
    console.error("Error en validateRegistrationToken:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error validando el token",
    };
  }
}

export async function completeUserRegistration({ token, password }: { token: string; password: string }) {
  try {
    // Validaciones básicas
    if (!token || typeof token !== "string") {
      return {
        success: false,
        error: "Token no proporcionado o inválido",
      };
    }

    if (!password || typeof password !== "string") {
      return {
        success: false,
        error: "Contraseña no proporcionada",
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 8 caracteres",
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        success: false,
        error: "La contraseña debe incluir mayúsculas, minúsculas y números",
      };
    }

    await resitroConToken.completeUserRegistration({
      token,
      password,
    });

    return { success: true };
  } catch (error) {
    console.error("Error en completeUserRegistration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error completando el registro",
    };
  }
}
