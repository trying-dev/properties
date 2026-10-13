import { notFound } from 'next/navigation'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import FormatSheet, { FormatBlock, FormatField } from '+/components/formats/FormatSheet'

const typeLabel = { CORRECTIVE: 'Correctivo', PREVENTIVE: 'Preventivo', INCIDENT: 'Incidente' } as const
const statusLabel = { PENDING: 'Pendiente', SCHEDULED: 'Programado', IN_PROGRESS: 'En ejecución', COMPLETED: 'Completado', CANCELLED: 'Cancelado' } as const
const bearerLabel = { OWNER: 'Propietario', TENANT: 'Arrendatario', PROPERTIES: 'Administración' } as const
const formatDate = (value?: Date | null) => (value ? value.toLocaleDateString('es-CO') : null)
const money = (value?: number | null) => (value == null ? null : `$${value.toLocaleString('es-CO')}`)

// F-058 Reporte de daños, generado desde un registro de mantenimiento.
export default async function ReporteDanosPage({ params }: { params: Promise<{ maintenanceId: string }> }) {
  const { maintenanceId } = await params
  const scope = await getCurrentAdminScope()
  if (!scope) return notFound()

  const item = await prisma.maintenance.findFirst({
    where: { id: maintenanceId, unit: { property: propertyAccessFilter(scope) } },
    select: {
      id: true,
      type: true,
      status: true,
      costBearer: true,
      title: true,
      description: true,
      provider: true,
      diagnosis: true,
      solution: true,
      cost: true,
      severity: true,
      estimatedLoss: true,
      scheduledDate: true,
      completedDate: true,
      createdAt: true,
      unit: {
        select: {
          unitNumber: true,
          property: { select: { name: true, street: true, number: true, city: true } },
          contracts: {
            where: { status: 'ACTIVE' },
            take: 1,
            select: { tenant: { select: { user: { select: { name: true, lastName: true } } } } },
          },
        },
      },
    },
  })
  if (!item) return notFound()

  const occupant = item.unit.contracts[0]?.tenant.user
  const occupantName = occupant ? [occupant.name, occupant.lastName].filter(Boolean).join(' ') : null

  return (
    <FormatSheet code="F-058" title="Reporte de daños" signatures={['Quien reporta', 'Administración']}>
      <FormatBlock title="Ubicación">
        <div className="grid grid-cols-2 gap-4">
          <FormatField label="Propiedad" value={item.unit.property.name} />
          <FormatField label="Unidad" value={item.unit.unitNumber} />
          <FormatField label="Dirección" value={`${item.unit.property.street} ${item.unit.property.number}, ${item.unit.property.city}`} />
          <FormatField label="Ocupante" value={occupantName} />
        </div>
      </FormatBlock>

      <FormatBlock title="Daño reportado">
        <div className="grid grid-cols-2 gap-4">
          <FormatField label="Asunto" value={item.title} />
          <FormatField label="Fecha del reporte" value={formatDate(item.createdAt)} />
          <FormatField label="Tipo" value={typeLabel[item.type]} />
          <FormatField label="Severidad" value={item.severity} />
        </div>
        <div className="mt-4">
          <FormatField label="Descripción" value={item.description} />
        </div>
      </FormatBlock>

      <FormatBlock title="Atención">
        <div className="grid grid-cols-2 gap-4">
          <FormatField label="Estado" value={statusLabel[item.status]} />
          <FormatField label="Proveedor o técnico" value={item.provider} />
          <FormatField label="Fecha programada" value={formatDate(item.scheduledDate)} />
          <FormatField label="Fecha de cierre" value={formatDate(item.completedDate)} />
          <FormatField label="Diagnóstico" value={item.diagnosis} />
          <FormatField label="Solución" value={item.solution} />
        </div>
      </FormatBlock>

      <FormatBlock title="Costos y responsabilidad">
        <div className="grid grid-cols-2 gap-4">
          <FormatField label="Costo de la reparación" value={money(item.cost)} />
          <FormatField label="Pérdida estimada" value={money(item.estimatedLoss)} />
          <FormatField label="Asume el costo" value={bearerLabel[item.costBearer]} />
        </div>
      </FormatBlock>
    </FormatSheet>
  )
}
