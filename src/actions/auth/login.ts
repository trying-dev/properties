"use server";

import { AuthError } from "next-auth";

import { signIn } from " +/lib/auth";

export async function authenticate(
  prevState:
    | {
        success: boolean;
        message: string;
        errors?: Record<string, string[]>;
      }
    | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log(`🔐 Iniciando autenticación para: ${email}`);

    // Validaciones detalladas
    const errors: Record<string, string[]> = {};

    if (!email) {
      errors.email = ["El email es requerido"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ["El formato del email no es válido"];
    }

    if (!password) {
      errors.password = ["La contraseña es requerida"];
    } else if (password.length < 6) {
      errors.password = ["La contraseña debe tener al menos 6 caracteres"];
    }

    if (Object.keys(errors).length > 0) {
      console.log(`❌ Errores de validación para ${email}:`, errors);
      return {
        success: false,
        message: "Por favor corrige los errores en el formulario",
        errors,
      };
    }

    // Intentar login SIN redirección automática
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // ✅ NO redirigir - manejamos desde la página
    });

    // Verificar resultado
    if (result?.error) {
      console.log(`❌ Login fallido para ${email}: ${result.error}`);
      return {
        success: false,
        message: "Credenciales incorrectas. Verifica tu email y contraseña.",
      };
    }

    // ✅ Login exitoso - sin redirección automática
    console.log(`✅ Login exitoso para: ${email}`);

    return {
      success: true,
      message: "¡Autenticación exitosa! Redirigiendo al dashboard...",
    };
  } catch (error) {
    let message = "Error interno del servidor";

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          message = "Email o contraseña incorrectos";
          break;
        case "AccessDenied":
          message = "Tu cuenta está deshabilitada. Contacta al administrador.";
          break;
        case "CallbackRouteError":
          message = "Error en el proceso de autenticación";
          break;
        default:
          message = "Error de autenticación. Intenta de nuevo.";
      }
    }

    console.error("❌ Error en authenticate:", {
      type: error instanceof AuthError ? error.type : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      email: formData.get("email"),
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message,
    };
  }
}
