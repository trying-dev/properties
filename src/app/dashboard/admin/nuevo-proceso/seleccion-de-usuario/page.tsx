'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, Edit, User, Mail, Phone, MapPin, CheckCircle } from 'lucide-react'
import { DocumentType, ContractStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'

import { CreateTenantForm } from './CreateTenantForm'
import type { CreateTenantSubmit } from './CreateTenantForm'

import { createTenantAction, getTenantsAction, TenantListItem } from '+/actions/gestion-de-inquilinos'
type GetTenantsResponse = { success: true; data: TenantListItem[] } | { success: false; error: string }

const useDebouncedValue = <T,>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function SeleccionDeUsuario() {
  const router = useRouter()

  const [tenants, setTenants] = useState<TenantListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [search, setSearch] = useState('')

  const reqCounter = useRef(0)
  const debouncedSearch = useDebouncedValue(search, 300)

  const loadTenants = useCallback(async () => {
    setLoading(true)
    const currentReq = ++reqCounter.current

    try {
      const result = (await getTenantsAction({ search: debouncedSearch })) as GetTenantsResponse

      if (currentReq !== reqCounter.current) return // a newer request finished first

      setTenants(result.success ? (result.data ?? []) : [])
      if (!result.success) console.error(result.error)
    } catch (error) {
      if (currentReq === reqCounter.current) {
        console.error('Error al cargar inquilinos:', error)
        setTenants([])
      }
    } finally {
      if (currentReq === reqCounter.current) setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    loadTenants()
  }, [debouncedSearch, loadTenants])

  const handleCreateTenant = async (tenantData: CreateTenantSubmit) => {
    try {
      const result = await createTenantAction(tenantData)
      if (result.success) {
        setShowCreateModal(false)

        const createdId = result.data?.id

        loadTenants()

        if (createdId) {
          goToConfirmationWith(createdId)
        } else {
          console.error('Inquilino creado, pero no recibí el ID. Revisa la respuesta del servidor.')
        }
      } else {
        console.error(result.error || 'Error al crear el inquilino')
      }
    } catch (error) {
      console.error('Error:', error)
      console.error('Error al crear el inquilino')
    }
  }

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'No especificado'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getDocumentTypeLabel = (type?: DocumentType | null) => {
    if (!type) return 'No especificado'
    const types: Record<DocumentType, string> = {
      CC: 'Cédula de Ciudadanía',
      CE: 'Cédula de Extranjería',
      TI: 'Tarjeta de Identidad',
      PASSPORT: 'Pasaporte',
      NIT: 'NIT',
      OTHER: 'Otro',
    }
    return types[type] ?? 'No especificado'
  }

  const goToConfirmationWith = (id: string) => {
    try {
      localStorage.setItem('selectedTenantId', id)
    } catch (e) {
      console.error('No se pudo guardar en localStorage', e)
    }
    router.push('/dashboard/admin/nuevo-proceso/confirmacion-de-inicio-de-proceso')
  }

  const getStatusBadge = (tenant: TenantListItem) => {
    const hasActiveContract = tenant.contracts.some(
      (c: { status: string }) => c.status === ContractStatus.ACTIVE
    )
    if (tenant.user.disable) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Deshabilitado</span>
    }
    if (hasActiveContract) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span>
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Sin contrato</span>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seleccion de Inquilino</h1>
          <p className="text-gray-600">
            Selecciona el inquilino para continuar con el proceso de incio de contrato.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Inquilino</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar inquilino</label>
        <input
          type="text"
          placeholder="Buscar por nombre, email, documento..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Inquilinos ({tenants.length})</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando inquilinos...</p>
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron inquilinos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: 'Inquilino', align: 'left' },
                    { label: 'Contacto', align: 'left' },
                    { label: 'Documento', align: 'left' },
                    { label: 'Ubicación', align: 'left' },
                    { label: 'Estado', align: 'left' },
                    { label: 'Contratos', align: 'left' },
                    { label: 'Acciones', align: 'right' },
                  ].map(({ label, align }) => (
                    <th
                      key={label}
                      className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="pl-6 px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {tenant.user.name} {tenant.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tenant.user.profession || 'Sin profesión especificada'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        {tenant.user.email}
                      </div>
                      {tenant.user.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {tenant.user.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDocumentTypeLabel(tenant.user.documentType)}
                      </div>
                      <div className="text-sm text-gray-500">{tenant.user.documentNumber}</div>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {tenant.user.city || 'No especificado'}
                      </div>
                      {tenant.user.state && <div className="text-sm text-gray-500">{tenant.user.state}</div>}
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      {getStatusBadge(tenant)}
                      {tenant.monthlyIncome && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatCurrency(tenant.monthlyIncome)}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.contracts.length} contrato(s)</div>
                      {tenant.contracts.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Último: {tenant.contracts[0]?.unit?.property?.name}
                        </div>
                      )}
                    </td>

                    <td className="px-3 pr-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          title="Elegir"
                          onClick={() => goToConfirmationWith(tenant.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 cursor-pointer" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateTenantForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTenant}
      />
    </div>
  )
}
