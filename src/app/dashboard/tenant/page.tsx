'use client'
import { useState, useEffect, type ComponentType, type ReactNode, type SVGProps } from 'react'
import {
  Home,
  User,
  Calendar,
  DollarSign,
  FileText,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  Receipt,
  Building2,
  Bell,
  Wifi,
  Tv,
  Car,
  Droplets,
  Zap,
  Info,
} from 'lucide-react'
import { getUserTenant } from '+/actions/user'
import { UserTenant } from '+/actions/user/manager'

export default function TenantDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [user, setUser] = useState<UserTenant>()
  const [loading, setLoading] = useState(true)

  const contract = user?.tenant?.contracts?.[0]
  const unit = contract?.unit
  const payments = contract?.payments
  const overduePayment = payments?.find((p) => p.status === 'OVERDUE')

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserTenant()
      if (userData) {
        setUser(userData)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {children}
    </div>
  )

  const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>
  )

  const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`px-6 py-4 ${className}`}>{children}</div>
  )

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-CO')}`
  }

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  const getPaymentStatusBadge = (status: 'PAID' | 'PENDING' | 'OVERDUE') => {
    const badges = {
      PAID: { color: 'bg-green-100 text-green-800', text: 'Pagado', icon: CheckCircle },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente', icon: Clock },
      OVERDUE: { color: 'bg-red-100 text-red-800', text: 'Vencido', icon: AlertCircle },
    }
    const badge = badges[status] || badges.PENDING
    const IconComponent = badge.icon
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    iconColor = 'text-gray-400',
    valueColor = 'text-gray-900',
  }: {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    label: string
    value?: ReactNode
    iconColor?: string
    valueColor?: string
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center text-sm text-gray-600">
        <Icon className={`h-4 w-4 mr-2 ${iconColor}`} />
        <span>{label}:</span>
      </div>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  )

  const FeatureItem = ({
    icon: Icon,
    label,
    enabled,
    iconColor = 'text-gray-400',
  }: {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    label: string
    enabled?: boolean
    iconColor?: string
  }) => (
    <div className="flex items-center space-x-2">
      <Icon className={`h-4 w-4 ${enabled ? iconColor : 'text-gray-400'}`} />
      <span className={`text-sm ${enabled ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
      {enabled ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <span className="text-gray-300">-</span>
      )}
    </div>
  )

  if (loading || !user || !contract || !unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal del Inquilino</h1>
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>
                  {user.name} {user.lastName}
                </span>
                <span className="mx-2">•</span>
                <Building2 className="h-4 w-4 mr-1" />
                <span>Unidad {unit.unitNumber}</span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>{formatDate(currentDate)}</p>
              <p>{currentDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {/* Alert for overdue payment */}
        {overduePayment && (
          <div className="mb-6 p-4 rounded-lg border-l-4 bg-red-50 border-red-400">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="font-medium text-red-800">Pago vencido</p>
                <p className="text-sm text-red-700">
                  {formatDate(overduePayment.dueDate)} - {formatCurrency(overduePayment.amount)} -{' '}
                  {overduePayment.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1 - Unit Info & Contract */}
          <div className="space-y-6">
            {/* Contract Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Información del Contrato</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Inquilino:</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-blue-700">
                        <User className="h-3 w-3 mr-2" />
                        <span>
                          {user.name} {user.lastName}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-blue-700">
                        <Mail className="h-3 w-3 mr-2" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-blue-700">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detalles del Contrato:</h4>
                    <div className="space-y-1">
                      <InfoRow
                        icon={DollarSign}
                        label="Renta mensual"
                        value={formatCurrency(contract.rent)}
                        iconColor="text-green-600"
                        valueColor="text-green-600"
                      />
                      <InfoRow
                        icon={Calendar}
                        label="Inicio"
                        value={formatDate(contract.startDate)}
                        iconColor="text-blue-600"
                      />
                      <InfoRow
                        icon={Calendar}
                        label="Vencimiento"
                        value={formatDate(contract.endDate)}
                        iconColor="text-red-600"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unit Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Información de la Unidad</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <div className="flex items-center mb-3">
                      <FileText className="h-4 w-4 text-blue-600 mr-2" />
                      <h4 className="text-md font-semibold text-gray-800">Descripción</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{unit.description}</p>
                  </div>

                  {/* Unit Details */}
                  <div className="border-t pt-4">
                    <div className="flex items-center mb-3">
                      <Building2 className="h-4 w-4 text-orange-600 mr-2" />
                      <h4 className="text-md font-semibold text-gray-800">Detalles de la Unidad</h4>
                    </div>
                    <div className="space-y-1">
                      <InfoRow
                        icon={Building2}
                        label="Número de unidad"
                        value={unit.unitNumber}
                        iconColor="text-orange-600"
                      />
                      <InfoRow icon={Building2} label="Piso" value={unit.floor} iconColor="text-purple-600" />
                      <InfoRow
                        icon={Home}
                        label="Área total"
                        value={`${unit.area} m²`}
                        iconColor="text-green-600"
                      />
                      <InfoRow
                        icon={Home}
                        label="Habitaciones"
                        value={unit.bedrooms || 'N/A'}
                        iconColor="text-purple-600"
                      />
                      <InfoRow icon={Home} label="Baños" value={unit.bathrooms} iconColor="text-blue-600" />
                      <InfoRow
                        icon={DollarSign}
                        label="Renta base"
                        value={formatCurrency(contract.rent)}
                        iconColor="text-green-600"
                        valueColor="text-green-600"
                      />
                      <InfoRow
                        icon={DollarSign}
                        label="Depósito"
                        value={formatCurrency(contract.deposit)}
                        iconColor="text-blue-600"
                      />
                      {/* <InfoRow
                        icon={Eye}
                        label="Última inspección"
                        value={formatDate(unit.lastInspection)}
                        iconColor="text-gray-600"
                      /> */}
                    </div>
                  </div>

                  {/* Characteristics and Services */}
                  <div className="border-t pt-4">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <h4 className="text-md font-semibold text-gray-800">Características y Servicios</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Características:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <FeatureItem
                            icon={Home}
                            label="Amoblado"
                            enabled={unit.furnished}
                            iconColor="text-blue-600"
                          />
                          <FeatureItem
                            icon={Building2}
                            label="Balcón"
                            enabled={unit.balcony}
                            iconColor="text-green-600"
                          />
                          <FeatureItem
                            icon={Car}
                            label="Parqueadero"
                            enabled={unit.parking}
                            iconColor="text-purple-600"
                          />
                          <FeatureItem
                            icon={Building2}
                            label="Depósito"
                            enabled={unit.storage}
                            iconColor="text-orange-600"
                          />
                          <FeatureItem
                            icon={User}
                            label="Acepta mascotas"
                            enabled={unit.petFriendly}
                            iconColor="text-pink-600"
                          />
                          <FeatureItem
                            icon={User}
                            label="Permite fumar"
                            enabled={unit.smokingAllowed}
                            iconColor="text-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Servicios incluidos:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <FeatureItem
                            icon={Wifi}
                            label="Internet"
                            enabled={unit.internet}
                            iconColor="text-blue-600"
                          />
                          <FeatureItem
                            icon={Tv}
                            label="Cable TV"
                            enabled={unit.cableTV}
                            iconColor="text-purple-600"
                          />
                          <FeatureItem
                            icon={Droplets}
                            label="Agua"
                            enabled={unit.waterIncluded}
                            iconColor="text-blue-500"
                          />
                          <FeatureItem
                            icon={Zap}
                            label="Gas"
                            enabled={unit.gasIncluded}
                            iconColor="text-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2 - Notifications & Payment History */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overduePayment && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <p className="text-sm font-medium text-red-800">Pago Vencido</p>
                      </div>
                      <p className="text-sm text-red-700">
                        {formatDate(overduePayment.dueDate)} - {formatCurrency(overduePayment.amount)}
                      </p>
                      <p className="text-xs text-red-600 mt-1">{overduePayment.notes}</p>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Info className="h-4 w-4 text-blue-600 mr-2" />
                      <p className="text-sm font-medium text-blue-800">Información</p>
                    </div>
                    <p className="text-sm text-blue-700">
                      Su contrato vence el {formatDate(contract.endDate)}
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <p className="text-sm font-medium text-green-800">Recordatorio</p>
                    </div>
                    <p className="text-sm text-green-700">
                      Próximo pago programado para el 1 de agosto de 2025
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Historial de Pagos</h3>
                  </div>
                  <span className="text-sm text-gray-500">{payments?.length || 0} pagos</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overduePayment && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm font-medium text-orange-800 mb-2">Notas:</p>
                      <div className="flex items-center text-sm text-orange-700">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>
                          {overduePayment.reference}: {overduePayment.notes}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600 font-medium text-xs">REFERENCIA</th>
                          <th className="text-left py-2 text-gray-600 font-medium text-xs">ESTADO</th>
                          <th className="text-left py-2 text-gray-600 font-medium text-xs">MONTO</th>
                          <th className="text-left py-2 text-gray-600 font-medium text-xs">MÉTODO</th>
                          <th className="text-left py-2 text-gray-600 font-medium text-xs">PAGADO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments?.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-100">
                            <td className="py-3">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                <span className="text-xs">{payment.reference || 'Sin referencia'}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              {getPaymentStatusBadge(payment.status as 'PAID' | 'PENDING' | 'OVERDUE')}
                            </td>
                            <td className="py-3 font-medium text-xs">{formatCurrency(payment.amount)}</td>
                            <td className="py-3 text-gray-600 text-xs">
                              {payment.paymentMethod === 'BANK_TRANSFER'
                                ? 'Transferencia'
                                : payment.paymentMethod || 'N/A'}
                            </td>
                            <td className="py-3">
                              {payment.paidDate ? (
                                <div>
                                  <span className="text-xs">{formatDate(payment.paidDate)}</span>
                                  {payment.receiptNumber && (
                                    <p className="text-xs text-gray-500">Recibo: {payment.receiptNumber}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        )) || []}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors">
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
