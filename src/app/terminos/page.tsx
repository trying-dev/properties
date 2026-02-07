import Header from '+/components/Header'
import Footer from '+/components/Footer'

const sections = [
  {
    id: '1',
    title: '1. Búsqueda y solicitud de arriendo',
    content: [
      'Puede buscar unidades disponibles para arrendar utilizando criterios como tipo de inmueble (apartamento, casa, habitación, local comercial, oficina, bodega), ubicación, número de habitaciones, baños, área, precio, si está amoblado, si permite mascotas, y otras comodidades.',
      'Al solicitar el arriendo de una unidad, acepta proporcionar información completa y veraz. El proceso incluye: (1) Iniciación - reserva temporal de la unidad, (2) Revisión - el administrador evalúa su solicitud, (3) Documentación - presenta documentos requeridos, (4) Aprobación - el administrador aprueba o rechaza, (5) Firma del contrato.',
      'Una vez firmado el contrato, este constituye un acuerdo legal vinculante entre usted (arrendatario) y el propietario/administrador (arrendador). El contrato especifica todos los términos del arrendamiento: canon mensual, duración, depósitos, servicios incluidos, políticas de cancelación, reglas de uso y obligaciones de ambas partes.',
    ],
  },
  {
    id: '2',
    title: '2. Verificación y documentación requerida',
    content: [
      'Durante el proceso de solicitud, deberá proporcionar: documento de identidad válido, comprobantes de ingresos (certificados laborales, extractos bancarios de los últimos 3 meses, declaración de renta), referencias personales y laborales, y otros documentos según el tipo de unidad.',
      'Usted autoriza a la plataforma y al administrador a verificar la autenticidad de los documentos, realizar consultas en centrales de riesgo crediticio, contactar referencias, y validar información de ingresos.',
      'Los requisitos varían según el tipo de unidad: Viviendas pueden requerir ingresos mínimos de 2-3 veces el canon. Locales comerciales requieren actividad comercial y registro mercantil. Oficinas pueden solicitar certificado de constitución.',
    ],
  },
  {
    id: '3',
    title: '3. Obligaciones financieras',
    content: [
      'Usted se compromete a pagar el canon de arriendo mensual en las fechas estipuladas en el contrato mediante los métodos autorizados. La plataforma registra los pagos pero no procesa transacciones directamente.',
      'El depósito de seguridad se utiliza para cubrir posibles daños al inmueble o incumplimientos del contrato. Este será devuelto al finalizar el contrato, sujeto a inspección y deducción de cualquier daño que exceda el desgaste normal.',
      'Los pagos realizados después de la fecha de vencimiento están sujetos a cargos por mora según lo establecido en el contrato. El sistema calculará automáticamente estos cargos de acuerdo con los términos acordados y la legislación aplicable.',
    ],
  },
  {
    id: '4',
    title: '4. Responsabilidades del arrendatario',
    content: [
      'Debe utilizar la unidad exclusivamente para el fin acordado: viviendas para uso residencial, locales para la actividad comercial declarada, oficinas para uso administrativo. No está permitido cambiar el uso sin autorización, subarrendar, realizar modificaciones estructurales, ni usar la unidad para actividades ilegales.',
      'Es su responsabilidad mantener la unidad en buen estado, realizar mantenimiento preventivo, reportar daños inmediatamente, permitir inspecciones con aviso previo de 48 horas, pagar servicios públicos según lo acordado, y cumplir con el reglamento de propiedad horizontal.',
      'Toda persona que vaya a residir en la unidad debe ser declarada al inicio del contrato. Cualquier cambio debe notificarse al administrador. Usted es responsable por las acciones de todos los ocupantes y visitantes.',
      'Si la unidad permite mascotas, debe declarar el tipo y número, asumir responsabilidad por daños, mantener vacunas al día, y cumplir normas de convivencia.',
    ],
  },
  {
    id: '5',
    title: '5. Cancelaciones y terminación',
    content: [
      'Si cancela el proceso de solicitud antes de la firma del contrato, se aplicarán las políticas de reembolso según la etapa en que se encuentre. Los documentos y tasas de aplicación generalmente no son reembolsables.',
      'La terminación anticipada del contrato debe seguir los procedimientos establecidos y puede estar sujeta a penalidades. Debe proporcionar aviso previo según lo estipulado (generalmente 30-60 días) y cumplir con todas las obligaciones pendientes.',
      'Los contratos con cláusula de renovación automática se renovarán según los términos acordados, salvo notificación previa de cualquiera de las partes.',
    ],
  },
  {
    id: '6',
    title: '6. Privacidad y protección de datos',
    content: [
      'Al utilizar nuestra plataforma, usted autoriza el tratamiento de sus datos personales de acuerdo con la Ley 1581 de 2012 y nuestra Política de Privacidad. Sus datos serán utilizados exclusivamente para gestionar el proceso de arrendamiento, verificación, comunicaciones y cumplimiento de obligaciones legales.',
      'Usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos personales, así como a revocar la autorización para su tratamiento, conforme a la legislación aplicable.',
    ],
  },
  {
    id: '7',
    title: '7. Resolución de conflictos',
    content: [
      'Cualquier disputa relacionada con pagos, daños o incumplimientos puede gestionarse a través de nuestro Centro de Resolución. Tanto arrendatarios como administradores pueden reportar incidencias y solicitar mediación.',
      'Si el administrador presenta una reclamación válida por daños al inmueble, usted será notificado y tendrá oportunidad de responder. Si se determina su responsabilidad, la plataforma puede facilitar el cobro del monto correspondiente.',
    ],
  },
  {
    id: '8',
    title: '8. Normativa aplicable',
    content: [
      'Estos términos se rigen por las leyes de la República de Colombia, incluyendo el Código Civil, Código de Comercio, Ley 820 de 2003 (arrendamiento de vivienda urbana), Ley 1581 de 2012 (protección de datos), y demás normativa aplicable.',
      'Para cualquier controversia derivada de estos términos, las partes se someten a la jurisdicción de los jueces y tribunales de Colombia, específicamente en la ciudad donde se ubique la unidad arrendada.',
    ],
  },
  {
    id: '9',
    title: '9. Modificaciones',
    content: [
      'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados con al menos 30 días de anticipación. El uso continuado de la plataforma después de la entrada en vigor de los cambios constituye aceptación de los nuevos términos.',
    ],
  },
  {
    id: '10',
    title: '10. Disposiciones generales',
    content: [
      'La plataforma actúa como facilitador de la gestión de arrendamientos. No somos parte de los contratos de arrendamiento ni asumimos responsabilidad por disputas entre propietarios y arrendatarios.',
      'Ninguna de las partes será responsable por incumplimientos causados por eventos de fuerza mayor, incluyendo desastres naturales, pandemias, actos de autoridad, o cualquier otra circunstancia fuera de su control razonable.',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y condiciones</h1>
          <p className="text-sm text-gray-600">Última actualización: 7 de febrero de 2026</p>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-6">
            Estos Términos de Servicio constituyen un contrato legal entre usted y nuestra plataforma. Al utilizar nuestros servicios de búsqueda y
            gestión de arrendamiento de unidades inmobiliarias (apartamentos, casas, habitaciones, locales comerciales, oficinas, bodegas), usted
            acepta estos términos.
          </p>

          <p className="text-gray-700 mb-8">
            <strong>Aplicable a usuarios en Colombia.</strong> Estos términos se rigen por la Ley 820 de 2003, el Código de Comercio, la Ley 1581 de
            2012, y demás normativa colombiana aplicable.
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
            <p className="text-sm text-gray-600">Si tienes preguntas sobre estos términos, puedes contactar a nuestro equipo de soporte.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
