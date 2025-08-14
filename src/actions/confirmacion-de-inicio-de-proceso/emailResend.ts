// ========================================
// EMAIL SERVICE - Implementación con Resend
// ========================================

import { Resend } from "resend";

// Inicializar Resend con tu API key
const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendNotificationEmail({
    tenantEmail,
    tenantName,
    unitInfo,
    processId,
  }: {
    tenantEmail: string;
    tenantName: string;
    unitInfo: string;
    processId: string;
  }) {
    try {
      // Validar que existe la API key
      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY no configurada, simulando envío de email");
        return {
          success: true,
          emailId: `simulated_${Date.now()}`,
          sentAt: new Date(),
          mode: "simulation",
        };
      }

      // Envío real con Resend
      const emailResult = await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@tudominio.com",
        to: [tenantEmail],
        subject: "Proceso de Alquiler Iniciado - Acción Requerida",
        html: this.getEmailTemplate(tenantName, unitInfo, processId),
      });

      return {
        success: true,
        emailId: emailResult.data?.id || `email_${Date.now()}`,
        sentAt: new Date(),
        mode: "production",
      };
    } catch (error) {
      console.error("Error enviando email:", error);

      // En caso de error, simular envío para no romper el flujo
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        emailId: `failed_${Date.now()}`,
        sentAt: new Date(),
        mode: "error",
      };
    }
  }

  private static getEmailTemplate(tenantName: string, unitInfo: string, processId: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proceso de Alquiler Iniciado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .steps { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .step { margin: 10px 0; padding-left: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 Proceso de Alquiler Iniciado</h1>
        </div>
        
        <div class="content">
          <h2>¡Hola ${tenantName}!</h2>
          
          <p>Nos complace informarte que se ha iniciado exitosamente el proceso de alquiler para:</p>
          
          <div class="highlight">
            <strong>📍 Propiedad:</strong> ${unitInfo}<br>
            <strong>🔢 ID del Proceso:</strong> ${processId}
          </div>
          
          <h3>📋 Próximos Pasos</h3>
          <div class="steps">
            <div class="step">✅ <strong>Paso 1:</strong> Revisar términos y condiciones del contrato</div>
            <div class="step">📄 <strong>Paso 2:</strong> Completar documentación requerida</div>
            <div class="step">💰 <strong>Paso 3:</strong> Confirmar términos financieros</div>
            <div class="step">✍️ <strong>Paso 4:</strong> Firma del contrato</div>
          </div>
          
          <p><strong>📞 ¿Necesitas ayuda?</strong></p>
          <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos:</p>
          <ul>
            <li>📧 Email: soporte@tudominio.com</li>
            <li>📱 Teléfono: +57 300 123 4567</li>
            <li>🕒 Horario: Lunes a Viernes, 8:00 AM - 6:00 PM</li>
          </ul>
          
          <p>Recibirás más instrucciones detalladas en los próximos días.</p>
          
          <p>¡Gracias por confiar en nosotros para tu nuevo hogar!</p>
          
          <p>Saludos cordiales,<br>
          <strong>Equipo de Gestión de Propiedades</strong></p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas directamente a este mensaje.</p>
          <p>ID de Referencia: ${processId}</p>
        </div>
      </body>
      </html>
    `;
  }

  // Método alternativo para emails de texto plano
  static async sendPlainTextEmail({
    tenantEmail,
    tenantName,
    unitInfo,
    processId,
  }: {
    tenantEmail: string;
    tenantName: string;
    unitInfo: string;
    processId: string;
  }) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY no configurada, simulando envío de email");
        return {
          success: true,
          emailId: `simulated_text_${Date.now()}`,
          sentAt: new Date(),
          mode: "simulation",
        };
      }

      const emailResult = await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@tudominio.com",
        to: [tenantEmail],
        subject: "Proceso de Alquiler Iniciado",
        text: `
Hola ${tenantName},

Se ha iniciado el proceso de alquiler para: ${unitInfo}

ID del Proceso: ${processId}

Próximos pasos:
1. Revisar términos y condiciones
2. Completar documentación requerida
3. Confirmar términos financieros
4. Firma del contrato

Recibirás más instrucciones pronto.

Gracias por confiar en nosotros.

Equipo de Gestión de Propiedades
        `,
      });

      return {
        success: true,
        emailId: emailResult.data?.id || `email_text_${Date.now()}`,
        sentAt: new Date(),
        mode: "production",
      };
    } catch (error) {
      console.error("Error enviando email de texto:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        emailId: `failed_text_${Date.now()}`,
        sentAt: new Date(),
        mode: "error",
      };
    }
  }
}
