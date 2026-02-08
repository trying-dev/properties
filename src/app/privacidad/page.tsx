import Header from '+/components/Header'
import Footer from '+/components/Footer'

const sections = [
  {
    id: '1',
    title: '1. Información que recopilamos',
    content: [
      'Recopilamos información que usted nos proporciona directamente al crear una cuenta, solicitar el arriendo de una unidad, o utilizar nuestros servicios: nombre completo, apellidos, documento de identidad (tipo y número), fecha y lugar de nacimiento, dirección de residencia, correo electrónico, número de teléfono, información laboral y profesional, ingresos mensuales, estado civil.',
      'Para el proceso de arrendamiento, también recopilamos: certificados laborales, extractos bancarios, declaración de renta, referencias personales y laborales (nombre, teléfono, relación), información de codeudores (si aplica), documentos de identificación escaneados, fotografías de perfil.',
      'Información que se genera automáticamente: dirección IP, tipo de dispositivo y navegador, páginas visitadas en la plataforma, fecha y hora de acceso, cookies y tecnologías similares, interacciones con anuncios de unidades.',
    ],
  },
  {
    id: '2',
    title: '2. Cómo utilizamos su información',
    content: [
      'Utilizamos sus datos personales para: (1) Gestionar su cuenta y verificar su identidad, (2) Procesar su solicitud de arrendamiento y evaluar su capacidad de pago, (3) Realizar consultas en centrales de riesgo crediticio (DataCrédito, TransUnion, etc.) cuando usted lo autorice, (4) Verificar referencias laborales y personales, (5) Generar y gestionar contratos de arrendamiento.',
      'También para: comunicar actualizaciones sobre su solicitud o contrato, enviar recordatorios de pagos pendientes o vencimientos, calcular y aplicar cargos por mora según los términos contractuales, facilitar la comunicación entre arrendatarios y administradores, generar reportes de ocupación y financieros para administradores.',
      'Adicionalmente: mejorar nuestros servicios y experiencia de usuario, cumplir con obligaciones legales, fiscales y regulatorias, prevenir fraude y actividades ilícitas, resolver disputas y aplicar nuestros términos y condiciones.',
    ],
  },
  {
    id: '3',
    title: '3. Cómo compartimos su información',
    content: [
      'Compartimos su información de forma limitada y necesaria con: Administradores y propietarios durante el proceso de evaluación de su solicitud de arrendamiento. Solo reciben la información necesaria para tomar una decisión informada sobre su solicitud.',
      'Centrales de riesgo crediticio cuando usted autoriza expresamente consultas de su historial crediticio como parte del proceso de verificación.',
      'Proveedores de servicios que nos ayudan a operar la plataforma: servicios de almacenamiento en la nube, procesamiento de datos, envío de correos electrónicos y notificaciones, análisis de uso de la plataforma. Estos proveedores solo acceden a la información necesaria para prestar sus servicios y están obligados a proteger su privacidad.',
      'Autoridades competentes cuando sea requerido por ley, orden judicial, o para prevenir actividades ilegales.',
      'Nunca vendemos su información personal a terceros con fines comerciales o publicitarios.',
    ],
  },
  {
    id: '4',
    title: '4. Seguridad de sus datos',
    content: [
      'Implementamos medidas técnicas y organizativas para proteger sus datos personales: Encriptación de contraseñas mediante algoritmos seguros (bcrypt), Almacenamiento seguro de documentos con control de acceso restringido, Conexiones HTTPS para proteger datos en tránsito, Respaldos regulares para prevenir pérdida de información.',
      'Auditorías periódicas de seguridad, Acceso limitado solo a personal autorizado que necesite la información para cumplir sus funciones, Capacitación continua a nuestro personal sobre protección de datos.',
      'A pesar de nuestros esfuerzos, ningún sistema de seguridad es completamente infalible. Le recomendamos proteger sus credenciales de acceso y notificarnos inmediatamente si sospecha de acceso no autorizado a su cuenta.',
    ],
  },
  {
    id: '5',
    title: '5. Retención de datos',
    content: [
      'Conservamos su información personal mientras su cuenta esté activa y durante el tiempo necesario para cumplir con las finalidades descritas en esta política y nuestras obligaciones legales.',
      'Contratos finalizados: mantenemos registros de contratos durante 10 años conforme a la legislación fiscal y comercial colombiana (Código de Comercio, Estatuto Tributario).',
      'Documentos de verificación: se conservan mientras exista una relación contractual activa y pueden eliminarse una vez finalizado el contrato, salvo requisitos legales de conservación.',
      'Datos de cuenta inactiva: si su cuenta permanece inactiva por más de 2 años sin actividad, podemos eliminarla previa notificación.',
      'Puede solicitar la eliminación de su cuenta en cualquier momento, aunque cierta información puede retenerse por obligaciones legales, prevención de fraude, o resolución de disputas.',
    ],
  },
  {
    id: '6',
    title: '6. Sus derechos (Ley 1581 de 2012)',
    content: [
      'Conforme a la Ley 1581 de 2012 de Protección de Datos Personales de Colombia, usted tiene los siguientes derechos:',
      'Conocer, actualizar y rectificar sus datos personales. Puede acceder a su información en cualquier momento desde su cuenta o solicitando una copia de sus datos.',
      'Solicitar prueba de la autorización otorgada para el tratamiento de sus datos, salvo cuando la ley no lo requiera.',
      'Ser informado sobre el uso que se ha dado a sus datos personales.',
      'Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley de protección de datos.',
      'Revocar la autorización y solicitar la supresión de sus datos cuando no exista un deber legal o contractual que requiera su conservación. Tenga en cuenta que esto puede limitar o impedir el uso de nuestros servicios.',
      'Acceder gratuitamente a sus datos personales que hayan sido objeto de tratamiento.',
      'Para ejercer estos derechos, puede contactar a nuestro equipo de protección de datos a través de los canales indicados al final de esta política.',
    ],
  },
  {
    id: '7',
    title: '7. Cookies y tecnologías similares',
    content: [
      'Utilizamos cookies y tecnologías similares para: Mantener su sesión activa cuando navega en la plataforma, Recordar sus preferencias (idioma, filtros de búsqueda), Analizar cómo se utiliza la plataforma para mejorar la experiencia, Garantizar la seguridad de su cuenta y prevenir fraude.',
      'Tipos de cookies que utilizamos: Cookies esenciales (necesarias para el funcionamiento de la plataforma), Cookies de rendimiento (para analizar el uso y mejorar el servicio), Cookies de funcionalidad (para recordar sus preferencias).',
      'Puede configurar su navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades de la plataforma. La mayoría de navegadores permiten gestionar las preferencias de cookies en su configuración.',
    ],
  },
  {
    id: '8',
    title: '8. Menores de edad',
    content: [
      'Nuestra plataforma está diseñada para usuarios mayores de 18 años. No recopilamos intencionalmente información de menores de edad.',
      'Si un menor aparece como residente adicional en un contrato de arrendamiento, sus datos son proporcionados y gestionados bajo la responsabilidad del titular del contrato (padre, madre o tutor legal) y solo se utilizan para fines administrativos necesarios del contrato.',
      'Si descubrimos que hemos recopilado inadvertidamente información de un menor sin el consentimiento apropiado, tomaremos medidas para eliminar esa información de nuestros sistemas.',
    ],
  },
  {
    id: '9',
    title: '9. Transferencias internacionales',
    content: [
      'Sus datos se almacenan y procesan principalmente en servidores ubicados en Colombia. En caso de utilizar servicios de terceros (como almacenamiento en la nube o herramientas de análisis) cuyos servidores estén en otros países, nos aseguramos de que:',
      'Cumplan con estándares adecuados de protección de datos equivalentes a los de Colombia, Existan garantías contractuales apropiadas para proteger su información, Se respeten sus derechos conforme a la Ley 1581 de 2012.',
      'Solo transferimos datos al extranjero cuando es necesario para prestar nuestros servicios y siempre bajo medidas de protección adecuadas.',
    ],
  },
  {
    id: '10',
    title: '10. Notificaciones y comunicaciones',
    content: [
      'Le enviamos notificaciones por correo electrónico y SMS sobre: Actividad importante en su cuenta (creación, cambios de contraseña), Estado de su solicitud de arrendamiento, Confirmación de contratos firmados, Pagos pendientes, próximos vencimientos y cargos por mora, Notificaciones de administradores o inquilinos, Actualizaciones importantes de la plataforma.',
      'Puede configurar sus preferencias de notificaciones en la configuración de su cuenta. Sin embargo, algunas comunicaciones esenciales (relacionadas con seguridad, cambios en contratos activos, obligaciones de pago) no pueden desactivarse mientras mantenga una cuenta activa.',
    ],
  },
  {
    id: '11',
    title: '11. Cambios a esta política',
    content: [
      'Podemos actualizar esta política de privacidad periódicamente para reflejar cambios en nuestras prácticas, servicios, o requisitos legales.',
      'Los cambios significativos serán notificados con al menos 30 días de anticipación por correo electrónico o mediante un aviso destacado en la plataforma.',
      'La fecha de "Última actualización" al inicio de esta política siempre refleja cuándo se realizó la modificación más reciente.',
      'Su uso continuado de la plataforma después de la entrada en vigor de los cambios constituye su aceptación de la política actualizada.',
    ],
  },
  {
    id: '12',
    title: '12. Contacto y ejercicio de derechos',
    content: [
      'Si tiene preguntas sobre esta política de privacidad, cómo manejamos sus datos, o desea ejercer sus derechos como titular de datos personales, puede contactarnos a través de:',
      'Correo electrónico de protección de datos: proteccion-de-datos@properties.com',
      'Formulario de contacto en la plataforma: Dirigirse a contacto',
      'Dirección física: Bogota D.C.',
      'Responderemos a sus solicitudes en un plazo máximo de 10 días hábiles conforme a la Ley 1581 de 2012.',
      'Si no está satisfecho con nuestra respuesta, tiene derecho a presentar una queja ante la Superintendencia de Industria y Comercio (SIC), autoridad de control en materia de protección de datos personales en Colombia.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de privacidad</h1>
          <p className="text-sm text-gray-600">Última actualización: 7 de febrero de 2026</p>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-6">
            En nuestra plataforma de gestión de arrendamientos, la privacidad y protección de sus datos personales es fundamental. Esta política
            explica qué información recopilamos, cómo la utilizamos, con quién la compartimos y cuáles son sus derechos sobre sus datos.
          </p>

          <p className="text-gray-700 mb-8">
            <strong>Aplicable a usuarios en Colombia.</strong> Esta política cumple con la Ley 1581 de 2012 de Protección de Datos Personales, el
            Decreto 1377 de 2013, y demás normativa colombiana aplicable en materia de privacidad y protección de datos.
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Compromiso con su privacidad</h3>
              <p className="text-sm text-gray-700">
                Nos tomamos muy en serio la protección de sus datos personales. Si tiene alguna preocupación sobre cómo manejamos su información o
                desea ejercer alguno de sus derechos como titular de datos, no dude en contactarnos. Estamos aquí para ayudarlo.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
