import { Resend } from "resend";

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendNewUserRegistrationEmail({
    tenantEmail,
    tenantName,
    registrationToken,
  }: {
    tenantEmail: string;
    tenantName: string;
    registrationToken: string;
  }) {
    try {
      const registrationUrl = `${process.env.NEXTAUTH_URL}/registro-con-token?token=${registrationToken}`;

      const emailResult = await this.resend.emails.send({
        from: process.env.FROM_EMAIL as string,
        to: [tenantEmail],
        subject: "¡Bienvenido! Completa tu registro para continuar",
        html: this.getNewUserRegistrationTemplate(tenantName, registrationUrl),
      });

      return {
        success: true,
        emailId: emailResult.data?.id || `registration_${Date.now()}`,
        sentAt: new Date(),
        mode: "production",
        registrationUrl,
      };
    } catch (error) {
      console.error("Error enviando email de registro:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        emailId: `failed_registration_${Date.now()}`,
        sentAt: new Date(),
        mode: "error",
      };
    }
  }

  async sendExistingUserContinueEmail({
    tenantEmail,
    tenantName,
  }: {
    tenantEmail: string;
    tenantName: string;
  }) {
    try {
      const emailResult = await this.resend.emails.send({
        from: process.env.FROM_EMAIL as string,
        to: [tenantEmail],
        subject: "Continúa con tu proceso de alquiler",
        html: this.getExistingUserContinueTemplate(tenantName),
      });

      return {
        success: true,
        emailId: emailResult.data?.id || `continue_${Date.now()}`,
        sentAt: new Date(),
        mode: "production",
      };
    } catch (error) {
      console.error("Error enviando email de continuación:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        emailId: `failed_continue_${Date.now()}`,
        sentAt: new Date(),
        mode: "error",
      };
    }
  }

  private getNewUserRegistrationTemplate(tenantName: string, registrationUrl: string) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Completa tu registro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-align: center; }
          .warning { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 ¡Bienvenido!</h1>
        </div>
        
        <div class="content">
          <h2>¡Hola ${tenantName}!</h2>
          
          <p>¡Excelentes noticias! Tu proceso de solicitud de alquiler ha sido iniciado exitosamente para:</p>
          
          <h3>🚀 Siguiente Paso: Completa tu Registro</h3>
          <p>Para continuar con el proceso, necesitas completar tu registro en nuestra plataforma. Esto te permitirá:</p>
          
          <ul>
            <li>✅ Completar tu perfil y documentación</li>
            <li>📄 Revisar detalles de la propiedad</li>
            <li>💬 Comunicarte directamente con tu administrador</li>
            <li>📊 Realizar seguimiento de tu solicitud</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationUrl}" class="button">🔗 Completar Registro</a>
          </div>
          
          <div class="warning">
            <strong>⏰ Importante:</strong> Este enlace es válido por 24 horas. Si no completas tu registro en este tiempo, contacta con tu administrador para generar un nuevo enlace.
          </div>
          
          <h3>🔐 Seguridad</h3>
          <p>Durante el registro deberás crear una contraseña segura que te permitirá acceder a tu cuenta en el futuro.</p>
          
          <p><strong>📞 ¿Necesitas ayuda?</strong></p>
          <p>Si tienes problemas con el registro o preguntas sobre el proceso:</p>
          <ul>
            <li>📧 Email: soporte@tudominio.com</li>
            <li>📱 Teléfono: +57 300 123 4567</li>
            <li>🕒 Horario: Lunes a Viernes, 8:00 AM - 6:00 PM</li>
          </ul>
          
          <p>¡Estamos emocionados de tenerte como parte de nuestra comunidad!</p>
          
          <p>Saludos cordiales,<br>
          <strong>Equipo de Gestión de Propiedades</strong></p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas directamente a este mensaje.</p>
          <p>Si no solicitaste este registro, puedes ignorar este email.</p>
        </div>
      </body>
      </html>
    `;
  }

  private getExistingUserContinueTemplate(tenantName: string) {
    const loginUrl = `${process.env.NEXTAUTH_URL}`;
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Continúa tu proceso de alquiler</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #7c3aed; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background-color: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-align: center; }
          .info { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔄 Continúa tu Proceso</h1>
        </div>
        
        <div class="content">
          <h2>¡Hola de nuevo, ${tenantName}!</h2>
          
          <p>Se ha iniciado un nuevo proceso de solicitud de alquiler asociado a tu cuenta para:</p>
          
          <h3>🚪 Accede a tu Cuenta</h3>
          <p>Ya tienes una cuenta en nuestra plataforma, solo necesitas iniciar sesión para continuar con tu solicitud.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" class="button">🔐 Iniciar Sesión</a>
          </div>
          
          <h3>📋 Una vez dentro podrás:</h3>
          <ul>
            <li>📄 Completar tu solicitud de alquiler</li>
            <li>✍️ Subir la documentación requerida</li>
            <li>💬 Comunicarte con tu administrador</li>
            <li>📊 Seguir el progreso de tu solicitud</li>
          </ul>
          
          <div class="info">
            <strong>💡 Recordatorio:</strong> Si no recuerdas tu contraseña, puedes usar la opción "Olvidé mi contraseña" en la página de inicio de sesión.
          </div>
          
          <p><strong>📞 ¿Necesitas ayuda?</strong></p>
          <p>Si tienes problemas para acceder a tu cuenta o preguntas sobre el proceso:</p>
          <ul>
            <li>📧 Email: soporte@tudominio.com</li>
            <li>📱 Teléfono: +57 300 123 4567</li>
            <li>🕒 Horario: Lunes a Viernes, 8:00 AM - 6:00 PM</li>
          </ul>
          
          <p>¡Esperamos verte pronto en la plataforma!</p>
          
          <p>Saludos cordiales,<br>
          <strong>Equipo de Gestión de Propiedades</strong></p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas directamente a este mensaje.</p>
          <p>Si no solicitaste este proceso, contacta con soporte.</p>
        </div>
      </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();
