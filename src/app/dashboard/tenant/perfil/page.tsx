'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, FileText, ShieldCheck, Mail, Phone, MapPin, CreditCard, Briefcase } from 'lucide-react'

import Header from '+/components/Header'
import Footer from '+/components/Footer'
import Modal from '+/components/Modal'
import { getUserTenant, type UserTenant } from '+/actions/user'
import TenantCompleteForm from '+/app/dashboard/tenant/formulario-de-tenant/TenantForm'

const formatDate = (value?: Date | string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CO')
}

const formatMoney = (value?: number | null) => {
  if (value == null) return '-'
  return `$${value.toLocaleString('es-CO')}`
}

type TenantProfile = NonNullable<UserTenant['tenant']>

type InfoRowProps = {
  label: string
  value?: string | null
  icon?: typeof User
}

const InfoRow = ({ label, value, icon: Icon = User }: InfoRowProps) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-gray-500">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || '-'}</p>
    </div>
  </div>
)

export default function TenantProfilePage() {
  const [user, setUser] = useState<UserTenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getUserTenant()
        setUser(data)
      } catch (err) {
        console.error('Error loading tenant profile:', err)
        setError('No se pudo cargar la información del perfil')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const tenantData = useMemo(() => user?.tenant ?? null, [user]) as TenantProfile | null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard/tenant" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil y documentos</h1>
            <p className="text-gray-600">Información personal y archivos asociados a tu contrato.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            Editar información
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando perfil...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : !user ? (
          <div className="text-center py-12 text-gray-600">No se encontró información del usuario.</div>
        ) : (
          <div className="space-y-6">
            <section className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Información personal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoRow label="Nombre completo" value={`${user.name ?? ''} ${user.lastName ?? ''}`.trim()} icon={User} />
                <InfoRow label="Correo" value={user.email ?? ''} icon={Mail} />
                <InfoRow label="Teléfono" value={user.phone ?? ''} icon={Phone} />
                <InfoRow
                  label="Documento"
                  value={user.documentType && user.documentNumber ? `${user.documentType} ${user.documentNumber}` : '-'}
                  icon={CreditCard}
                />
                <InfoRow label="Fecha de nacimiento" value={formatDate(user.birthDate)} icon={User} />
                <InfoRow
                  label="Dirección"
                  value={[user.address, user.city, user.state].filter(Boolean).join(', ')}
                  icon={MapPin}
                />
              </div>
            </section>

            <section className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Datos del inquilino</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoRow label="Perfil" value={tenantData?.profile ?? '-'} icon={User} />
                <InfoRow label="Ingreso mensual" value={formatMoney(tenantData?.monthlyIncome)} icon={Briefcase} />
                <InfoRow label="Contacto de emergencia" value={tenantData?.emergencyContact ?? '-'} icon={Phone} />
                <InfoRow label="Teléfono emergencia" value={tenantData?.emergencyContactPhone ?? '-'} icon={Phone} />
              </div>
            </section>

            <section className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-700" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
                    <p className="text-sm text-gray-600">Gestiona y consulta tus archivos del proceso.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/tenant/processes"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Ver procesos
                </Link>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Aún no se han cargado documentos desde el dashboard. Puedes revisar tus procesos activos para subirlos.
              </div>
            </section>
          </div>
        )}
      </main>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        ariaLabel="Editar información"
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <TenantCompleteForm embedded onClose={() => setIsEditOpen(false)} />
      </Modal>

      <Footer />
    </div>
  )
}
