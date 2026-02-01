'use server'

import { confirmCoDebtorAction } from '+/actions/codeudor'

type ConfirmPageProps = {
  searchParams: {
    processId?: string
    token?: string
  }
}

export default async function ConfirmCoDebtorPage({ searchParams }: ConfirmPageProps) {
  const processId = searchParams.processId?.trim()
  const token = searchParams.token?.trim()

  if (!processId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace invalido</h1>
          <p className="text-gray-600">Faltan datos para confirmar la solicitud.</p>
        </div>
      </div>
    )
  }

  const result = await confirmCoDebtorAction({ processId, token })

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{result.success ? 'Confirmacion exitosa' : 'No se pudo confirmar'}</h1>
        <p className="text-gray-600">
          {result.success
            ? 'Gracias por confirmar tu participacion como codeudor.'
            : (result.error ?? 'Intenta nuevamente desde el enlace recibido.')}
        </p>
      </div>
    </div>
  )
}
