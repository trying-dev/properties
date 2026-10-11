import { prisma } from '+/lib/prisma'
import { MANUAL_CODE, MANUAL_VERSION } from '+/lib/manual'

// ¿Aceptó este usuario la versión vigente del manual? Úsalo como requisito antes de
// aprobar solicitudes o activar contratos (el servidor es quien decide, no la UI).
export const hasAcceptedManual = async (userId: string) => {
  const acceptance = await prisma.manualAcceptance.findUnique({
    where: { userId_manualCode_manualVersion: { userId, manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION } },
    select: { id: true },
  })
  return !!acceptance
}
