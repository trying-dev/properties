'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Send,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Check,
} from 'lucide-react'
import {
  getProcessDetailsAction,
  initializeContractAction,
} from '+/actions/confirmacion-de-inicio-de-proceso'
import { useSession } from '+/hooks/useSession'
import { ProcessDetails } from '+/actions/confirmacion-de-inicio-de-proceso/manager'

export default function ConfirmacionDeInicioDeProceso() {
  const router = useRouter()
  const { session } = useSession()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [contractInitialized, setContractInitialized] = useState(false)
  const [processDetails, setProcessDetails] = useState<ProcessDetails | null>(null)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')

  // Datos obtenidos del localStorage
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [selectedTenantId, setSelectedTenantId] = useState('')

  useEffect(() => {
    // Obtener IDs del localStorage
    try {
      const unitId = localStorage.getItem('np:selectedUnitId')
      const tenantId = localStorage.getItem('selectedTenantId')

      if (!unitId || !tenantId) {
        setError('No se encontraron los datos necesarios. Por favor, inicia el proceso nuevamente.')
        setLoading(false)
        return
      }

      setSelectedUnitId(unitId)
      setSelectedTenantId(tenantId)

      loadProcessDetails(unitId, tenantId)
    } catch (err) {
      console.error('Error al acceder a los datos almacenados.', err)
      setError('Error al acceder a los datos almacenados.')
      setLoading(false)
    }
  }, [])

  const loadProcessDetails = async (unitId: string, tenantId: string) => {
    try {
      const result = await getProcessDetailsAction(unitId, tenantId)

      if (result.success) {
        setProcessDetails(result.data ?? null)
      } else {
        setError(result.error || 'Error al cargar los detalles')
      }
    } catch (err) {
      console.error('Error al cargar los detalles del proceso', err)
      setError('Error al cargar los detalles del proceso')
    } finally {
      setLoading(false)
    }
  }

  const handleInitializeContract = async () => {
    if (!selectedUnitId || !selectedTenantId || !session?.user?.id) {
      setError('Faltan datos para inicializar el contrato')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const result = await initializeContractAction({
        unitId: selectedUnitId,
        tenantId: selectedTenantId,
        adminId: session.user.id,
        notes: notes.trim() || undefined,
      })

      if (result.success) {
        setContractInitialized(true)

        // Limpiar localStorage
        localStorage.removeItem('np:selectedUnitId')
        localStorage.removeItem('selectedTenantId')
      } else {
        setError(result.error || 'Error al inicializar el contrato')
      }
    } catch (err) {
      console.error('Error al procesar la solicitud', err)
      setError('Error al procesar la solicitud')
    } finally {
      setProcessing(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando detalles del proceso...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (contractInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contrato Inicializado!</h2>
            <p className="text-gray-600">
              El contrato ha sido inicializado exitosamente y se ha enviado un email de notificación al
              inquilino.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center text-blue-700 mb-2">
              <Mail className="w-5 h-5 mr-2" />
              <span className="font-medium">Email Enviado</span>
            </div>
            <p className="text-blue-600 text-sm">
              El inquilino recibirá instrucciones para continuar con el proceso.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Ir al Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard/admin/nuevo-proceso')}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
            >
              Iniciar Otro Proceso
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button onClick={handleGoBack} className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inicialización de Contrato</h1>
          <p className="text-gray-600">
            Revisa los detalles y confirma la inicialización del contrato de alquiler
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información de la Unidad */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Información de la Unidad
            </h2>

            {processDetails?.unit && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{processDetails.unit.property.name}</h3>
                  <p className="text-gray-600">Unidad {processDetails.unit.unitNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Habitaciones</p>
                    <p className="font-medium">{processDetails.unit.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Baños</p>
                    <p className="font-medium">{processDetails.unit.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Área</p>
                    <p className="font-medium">{processDetails.unit.area}m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Piso</p>
                    <p className="font-medium">{processDetails.unit.floor || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Precio de Alquiler</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(processDetails.unit.baseRent || 0)}
                  </p>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {processDetails.unit.property.city}, {processDetails.unit.property.neighborhood}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Información del Inquilino */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información del Inquilino
            </h2>

            {processDetails?.tenant && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {processDetails.tenant.user.name} {processDetails.tenant.user.lastName}
                    </h3>
                    <p className="text-gray-600">{processDetails.tenant.user.profession}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{processDetails.tenant.user.email}</span>
                  </div>

                  {processDetails.tenant.user.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{processDetails.tenant.user.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{processDetails.tenant.user.documentNumber}</span>
                  </div>

                  {processDetails.tenant.user.city && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{processDetails.tenant.user.city}</span>
                    </div>
                  )}
                </div>

                {processDetails.tenant.monthlyIncome && (
                  <div>
                    <p className="text-sm text-gray-500">Ingresos Mensuales</p>
                    <p className="font-medium text-green-600">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(processDetails.tenant.monthlyIncome)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notas y Confirmación */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notas del Contrato (Opcional)</h2>

          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Agrega cualquier nota o comentario sobre este contrato..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">¿Qué sucederá a continuación?</span>
            </div>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Se creará un contrato inicial con los datos de la unidad</li>
              <li>• Se enviará un email al inquilino con las instrucciones</li>
              <li>• El inquilino podrá revisar los términos propuestos</li>
              <li>• Podrás gestionar el progreso desde el dashboard</li>
              <li>• Las fechas se definirán cuando se active el contrato</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleGoBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={processing}
            >
              Cancelar
            </button>
            <button
              onClick={handleInitializeContract}
              disabled={processing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Inicializando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirmar e Inicializar Contrato
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
