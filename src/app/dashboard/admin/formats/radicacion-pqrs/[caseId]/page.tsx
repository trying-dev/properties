import { notFound } from 'next/navigation'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import { caseKindLabel, caseStatusConfig } from '+/lib/caseLabels'
import FormatSheet, { FormatBlock, FormatField } from '+/components/formats/FormatSheet'

// F-091 Radicación de PQRS, generada desde un caso.
export default async function RadicacionPqrsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  const scope = await getCurrentAdminScope()
  if (!scope) return notFound()

  const item = await prisma.tenantCase.findFirst({
    where: { id: caseId, property: propertyAccessFilter(scope) },
    select: {
      number: true,
      kind: true,
      status: true,
      subject: true,
      description: true,
      response: true,
      respondedAt: true,
      createdAt: true,
      property: { select: { name: true } },
      unit: { select: { unitNumber: true } },
      tenant: { select: { user: { select: { name: true, lastName: true, email: true, phone: true } } } },
    },
  })
  if (!item) return notFound()

  const tenantName = [item.tenant.user.name, item.tenant.user.lastName].filter(Boolean).join(' ')

  return (
    <FormatSheet code="F-091" title="Radicación de PQRS" signatures={['Quien radica', 'Quien recibe']}>
      <FormatBlock title="Radicado">
        <div className="grid grid-cols-2 gap-4">
          <FormatField label="Número" value={item.number} />
          <FormatField label="Fecha" value={item.createdAt.toLocaleDateString('es-CO')} />
          <FormatField label="Tipo" value={caseKindLabel[item.kind]} />
          <FormatField label="Estado" value={caseStatusConfig[item.status].label} />
        </div>
      </FormatBlock>

      <FormatBlock title="Solicitante">
        <div className="grid grid-cols-2 gap-4">
          <FormatField label="Nombre" value={tenantName} />
          <FormatField label="Correo" value={item.tenant.user.email} />
          <FormatField label="Teléfono" value={item.tenant.user.phone} />
          <FormatField label="Propiedad y unidad" value={`${item.property.name}${item.unit ? ` · Unidad ${item.unit.unitNumber}` : ''}`} />
        </div>
      </FormatBlock>

      <FormatBlock title="Contenido">
        <FormatField label="Asunto" value={item.subject} />
        <div className="mt-4">
          <FormatField label="Descripción" value={item.description} />
        </div>
      </FormatBlock>

      <FormatBlock title="Respuesta">
        <FormatField label={`Respondida el ${item.respondedAt ? item.respondedAt.toLocaleDateString('es-CO') : '-'}`} value={item.response} />
      </FormatBlock>
    </FormatSheet>
  )
}
