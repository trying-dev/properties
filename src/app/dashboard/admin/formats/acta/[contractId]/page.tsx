import { notFound } from 'next/navigation'
import { AccessDeviceStatus, InspectionType } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import FormatSheet, { FormatBlock, FormatField } from '+/components/formats/FormatSheet'

const conditionLabel = { GOOD: 'Bueno', FAIR: 'Regular', POOR: 'Malo' } as const
const formatDate = (value?: Date | null) => (value ? value.toLocaleDateString('es-CO') : null)
const money = (value?: number | null) => (value == null ? null : `$${value.toLocaleString('es-CO')}`)

// F-016 Acta de entrega y F-017 Acta de devolución, generadas desde el contrato.
export default async function ActaPage({
  params,
  searchParams,
}: {
  params: Promise<{ contractId: string }>
  searchParams: Promise<{ tipo?: string }>
}) {
  const [{ contractId }, { tipo }] = await Promise.all([params, searchParams])
  const scope = await getCurrentAdminScope()
  if (!scope) return notFound()

  const isReturn = tipo === 'devolucion'

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, unit: { property: propertyAccessFilter(scope) } },
    select: {
      id: true,
      rent: true,
      deposit: true,
      startDate: true,
      endDate: true,
      unitId: true,
      tenant: { select: { user: { select: { name: true, lastName: true, email: true, phone: true, documentNumber: true } } } },
      unit: {
        select: {
          unitNumber: true,
          floor: true,
          area: true,
          bedrooms: true,
          bathrooms: true,
          furnished: true,
          property: { select: { name: true, street: true, number: true, city: true, neighborhood: true } },
        },
      },
      inspections: {
        where: { type: isReturn ? InspectionType.RECEPCION : InspectionType.ENTREGA },
        orderBy: { performedDate: 'desc' },
        take: 1,
        select: { performedDate: true, overallCondition: true, criticalFindings: true, notes: true },
      },
    },
  })
  if (!contract) return notFound()

  const keys = await prisma.keyRecord.findMany({
    where: { unitId: contract.unitId, status: { in: [AccessDeviceStatus.DELIVERED, AccessDeviceStatus.RETURNED] } },
    orderBy: { issuedAt: 'asc' },
    select: { id: true, label: true, quantity: true, status: true, holder: true },
  })

  const { unit, tenant } = contract
  const inspection = contract.inspections[0]
  const tenantName = [tenant.user.name, tenant.user.lastName].filter(Boolean).join(' ')

  return (
    <FormatSheet
      code={isReturn ? 'F-017' : 'F-016'}
      title={isReturn ? 'Acta de devolución' : 'Acta de entrega'}
      signatures={['Administración', 'Arrendatario']}
    >
      <FormatBlock title="Inmueble">
        <div className="grid grid-cols-2 gap-4">
          <FormatField label="Propiedad" value={unit.property.name} />
          <FormatField label="Unidad" value={unit.unitNumber} />
          <FormatField label="Dirección" value={`${unit.property.street} ${unit.property.number}, ${unit.property.neighborhood}, ${unit.property.city}`} />
          <FormatField label="Piso" value={unit.floor} />
          <FormatField label="Área (m²)" value={unit.area} />
          <FormatField label="Alcobas y baños" value={`${unit.bedrooms} y ${unit.bathrooms}`} />
          <FormatField label="Amoblada" value={unit.furnished ? 'Sí' : 'No'} />
        </div>
      </FormatBlock>

      <FormatBlock title="Arrendatario y contrato">
        <div className="grid grid-cols-2 gap-4">
          <FormatField label="Nombre" value={tenantName} />
          <FormatField label="Documento" value={tenant.user.documentNumber} />
          <FormatField label="Correo" value={tenant.user.email} />
          <FormatField label="Teléfono" value={tenant.user.phone} />
          <FormatField label="Inicio del contrato" value={formatDate(contract.startDate)} />
          <FormatField label="Fin del contrato" value={formatDate(contract.endDate)} />
          <FormatField label="Canon mensual" value={money(contract.rent)} />
          <FormatField label="Depósito" value={money(contract.deposit)} />
        </div>
      </FormatBlock>

      <FormatBlock title={isReturn ? 'Estado en la recepción' : 'Estado en la entrega'}>
        {inspection ? (
          <div className="grid grid-cols-2 gap-4">
            <FormatField label="Fecha de la inspección" value={formatDate(inspection.performedDate)} />
            <FormatField label="Estado general" value={inspection.overallCondition ? conditionLabel[inspection.overallCondition] : null} />
            <FormatField label="Hallazgos críticos" value={inspection.criticalFindings} />
            <FormatField label="Observaciones" value={inspection.notes} />
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin inspección registrada. Complete las observaciones a mano.</p>
        )}
        <div className="mt-4 space-y-5">
          {[1, 2, 3].map((line) => (
            <div key={line} className="border-b border-gray-300" style={{ height: 20 }} />
          ))}
        </div>
      </FormatBlock>

      <FormatBlock title="Llaves, tarjetas y controles">
        {keys.length === 0 ? (
          <p className="text-sm text-gray-500">Sin registros de entrega para esta unidad.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-400 text-xs uppercase text-gray-500">
                <th className="py-1">Descripción</th>
                <th className="py-1">Cantidad</th>
                <th className="py-1">Recibe</th>
                <th className="py-1">Estado</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-gray-200">
                  <td className="py-1">{key.label}</td>
                  <td className="py-1">{key.quantity}</td>
                  <td className="py-1">{key.holder}</td>
                  <td className="py-1">{key.status === AccessDeviceStatus.RETURNED ? 'Devuelta' : 'Entregada'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </FormatBlock>
    </FormatSheet>
  )
}
