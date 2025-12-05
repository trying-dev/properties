import { useState, type ComponentType, type ReactNode, type SVGProps } from 'react'
import {
  Home,
  Plus,
  Minus,
  Key,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Bed,
  Bath,
  Ruler,
  Car,
  Wifi,
  Tv,
  Heart,
  Cigarette,
  Archive,
  Shield,
  Clock,
  FileText,
  AlertCircle,
  Eye,
  Receipt,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { PropertyWithRelations } from '+/actions/property/manager'
import { PaymentMethod, PaymentStatus, UnitStatus } from '@prisma/client'
import { formatAdminLevel } from '../utils'

export const ExpandableUnits = ({ property }: { property?: NonNullable<PropertyWithRelations> }) => {
  const [expandedUnits, setExpandedUnits] = useState(new Set())

  const units = property?.units

  if (!units) return null

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

  const FeatureIcon = ({
    icon: Icon,
    label,
    enabled,
    enabledColor = 'text-green-600',
    disabledColor = 'text-gray-400',
  }: {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    label: string
    enabled?: boolean
    enabledColor?: string
    disabledColor?: string
  }) => (
    <div className="flex items-center space-x-2">
      <Icon className={`h-4 w-4 ${enabled ? enabledColor : disabledColor}`} />
      <span className={`text-sm ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
      {enabled && <CheckCircle className="h-3 w-3 text-green-500" />}
      {!enabled && <XCircle className="h-3 w-3 text-gray-400" />}
    </div>
  )

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    iconColor = 'text-gray-400',
  }: {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    label: string
    value?: ReactNode
    iconColor?: string
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
      <div className="flex items-center">
        <Icon className={`h-4 w-4 ${iconColor} mr-3`} />
        <span className="text-gray-600">{label}:</span>
      </div>
      <span className="font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
  )

  // Función para obtener el estado del último pago
  const getPaymentStatus = (
    payments: NonNullable<PropertyWithRelations>['units'][0]['contracts'][0]['payments']
  ) => {
    if (!payments || payments.length === 0) return { status: 'Sin pagos', color: 'gray' }

    const latestPayment = payments[0]

    switch (latestPayment.status) {
      case 'PAID':
        return { status: 'Al día', color: 'green' }
      case 'PENDING':
        return { status: 'Pendiente', color: 'yellow' }
      case 'OVERDUE':
        return { status: 'Vencido', color: 'red' }
      case 'PARTIAL':
        return { status: 'Parcial', color: 'orange' }
      case 'CANCELLED':
        return { status: 'Cancelado', color: 'gray' }
      default:
        return { status: 'Desconocido', color: 'gray' }
    }
  }

  const formatPaymentStatus = (status: PaymentStatus) => {
    const statuses = {
      PAID: 'Pagado',
      PENDING: 'Pendiente',
      OVERDUE: 'Vencido',
      PARTIAL: 'Parcial',
      CANCELLED: 'Cancelado',
    }
    return statuses[status]
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
      PARTIAL: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return colors[status]
  }

  const formatPaymentMethod = (method?: PaymentMethod | null) => {
    if (!method) return 'N/A'

    const methods = {
      CASH: 'Efectivo',
      BANK_TRANSFER: 'Transferencia',
      CHECK: 'Cheque',
      CREDIT_CARD: 'Tarjeta crédito',
      DEBIT_CARD: 'Tarjeta débito',
      DIGITAL_WALLET: 'Billetera digital',
      OTHER: 'Otro',
    }
    return methods[method]
  }

  const toggleUnitExpansion = (unitId: string) => {
    const newExpanded = new Set(expandedUnits)
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId)
    } else {
      newExpanded.add(unitId)
    }
    setExpandedUnits(newExpanded)
  }

  const formatUnitStatus = (status: UnitStatus) => {
    const statuses = {
      VACANT: 'Vacante',
      OCCUPIED: 'Ocupada',
      RESERVED: 'Reservada',
      MAINTENANCE: 'Mantenimiento',
      UNAVAILABLE: 'No disponible',
    }
    return statuses[status]
  }

  const getUnitStatusColor = (status: UnitStatus) => {
    const colors = {
      VACANT: 'bg-red-100 text-red-800',
      OCCUPIED: 'bg-green-100 text-green-800',
      RESERVED: 'bg-yellow-100 text-yellow-800',
      MAINTENANCE: 'bg-orange-100 text-orange-800',
      UNAVAILABLE: 'bg-gray-100 text-gray-800',
    }
    return colors[status]
  }

  const calculatePaymentStats = (
    payments: NonNullable<PropertyWithRelations>['units'][0]['contracts'][0]['payments']
  ) => {
    const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)

    const totalPending = payments
      .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0)

    const overdueCount = payments.filter((p) => p.status === 'OVERDUE').length

    const totalLateFees = payments
      .filter((p) => p.lateFeeApplied && p.lateFeeAmount)
      .reduce((sum, p) => sum + (p.lateFeeAmount || 0), 0)

    return {
      totalPaid,
      totalPending,
      overdueCount,
      totalLateFees,
      totalPayments: payments.length,
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Home className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Unidades</h3>
          </div>
          <span className="text-sm text-gray-500">{units.length} unidades</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {units.map((unit) => {
            const activeContract = unit.contracts.find((contract) => contract.status === 'ACTIVE')
            const paymentStatus = activeContract ? getPaymentStatus(activeContract.payments) : null
            const isExpanded = expandedUnits.has(unit.id)
            const paymentStats = activeContract ? calculatePaymentStats(activeContract.payments) : null

            return (
              <div
                key={unit.id}
                className={`border border-gray-100 rounded-lg transition-colors ${isExpanded ? 'col-span-2' : ''}`}
              >
                {/* Header compacto (siempre visible) */}
                <div className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Key className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{unit.unitNumber}</span>
                      <button
                        onClick={() => toggleUnitExpansion(unit.id)}
                        className="ml-3 flex items-center justify-center w-6 h-6 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors duration-200"
                        title={isExpanded ? 'Contraer detalles' : 'Ver detalles completos'}
                      >
                        {isExpanded ? (
                          <Minus className="h-3 w-3 text-orange-600" />
                        ) : (
                          <Plus className="h-3 w-3 text-orange-600" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {paymentStatus && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            paymentStatus.color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : paymentStatus.color === 'yellow'
                                ? 'bg-yellow-100 text-yellow-800'
                                : paymentStatus.color === 'red'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <CreditCard className="h-3 w-3 inline mr-1" />
                          {paymentStatus.status}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getUnitStatusColor(unit.status)}`}
                      >
                        {formatUnitStatus(unit.status)}
                      </span>
                    </div>
                  </div>

                  {activeContract && (
                    <div className="lg:grid lg:grid-cols-2 gap-3">
                      {/* admins */}
                      {activeContract.admins && activeContract.admins.length > 0 && (
                        <div className="mb-3 p-2 bg-blue-50 rounded">
                          <p className="text-sm font-medium text-blue-900">
                            Administradores ({activeContract.admins.length}):
                          </p>
                          <div className="space-y-1">
                            {activeContract.admins.map((admin) => (
                              <div key={admin.id} className="flex items-center justify-between">
                                <p className="text-xs text-blue-700">
                                  {admin.user.name} {admin.user.lastName}
                                </p>
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                                  {formatAdminLevel(admin.adminLevel)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* inquilino */}
                      <div className="mb-3 p-2 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          Inquilino: {activeContract.tenant.user.name} {activeContract.tenant.user.lastName}
                        </p>
                        <p className="text-xs text-blue-700">{activeContract.tenant.user.email}</p>
                        <p className="text-xs text-blue-700">{activeContract.tenant.user.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Renta:</span>
                      <p className="font-medium text-green-600">
                        ${(activeContract?.rent || unit.baseRent)?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Descripción */}
                      {unit.description && (
                        <div className="lg:col-span-2">
                          <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <FileText className="h-4 w-4 text-gray-600 mr-2" />
                            Descripción
                          </h5>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-gray-700 text-sm leading-relaxed">{unit.description}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-6">
                        {/* Información Detallada */}
                        <div>
                          <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <Home className="h-4 w-4 text-orange-600 mr-2" />
                            Detalles de la Unidad
                          </h5>
                          <div className="space-y-1 bg-white rounded-lg p-3">
                            <InfoRow
                              icon={Key}
                              label="Número de unidad"
                              value={unit.unitNumber}
                              iconColor="text-orange-600"
                            />
                            <InfoRow
                              icon={MapPin}
                              label="Piso"
                              value={unit.floor}
                              iconColor="text-blue-600"
                            />
                            <InfoRow
                              icon={Ruler}
                              label="Área total"
                              value={unit.area ? `${unit.area} m²` : 'N/A'}
                              iconColor="text-green-600"
                            />
                            <InfoRow
                              icon={Bed}
                              label="Habitaciones"
                              value={unit.bedrooms}
                              iconColor="text-purple-600"
                            />
                            <InfoRow
                              icon={Bath}
                              label="Baños"
                              value={unit.bathrooms}
                              iconColor="text-blue-500"
                            />
                            <InfoRow
                              icon={DollarSign}
                              label="Renta base"
                              value={unit.baseRent ? `$${unit.baseRent.toLocaleString()}` : 'N/A'}
                              iconColor="text-green-600"
                            />
                            <InfoRow
                              icon={Shield}
                              label="Depósito"
                              value={unit.deposit ? `$${unit.deposit.toLocaleString()}` : 'N/A'}
                              iconColor="text-indigo-600"
                            />
                            <InfoRow
                              icon={Eye}
                              label="Última inspección"
                              value={
                                unit.lastInspectionDate
                                  ? new Date(unit.lastInspectionDate).toLocaleDateString('es-CO')
                                  : 'N/A'
                              }
                              iconColor="text-gray-600"
                            />
                          </div>
                        </div>

                        {/* Características y Servicios */}
                        <div>
                          <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            Características y Servicios
                          </h5>
                          <div className="bg-white rounded-lg p-3 space-y-3">
                            {/* Características Estructurales */}
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Características:</h6>
                              <div className="grid grid-cols-2 gap-2">
                                <FeatureIcon icon={Home} label="Amoblado" enabled={unit.furnished} />
                                <FeatureIcon icon={MapPin} label="Balcón" enabled={unit.balcony} />
                                <FeatureIcon icon={Car} label="Parqueadero" enabled={unit.parking} />
                                <FeatureIcon icon={Archive} label="Depósito" enabled={unit.storage} />
                                <FeatureIcon
                                  icon={Heart}
                                  label="Acepta mascotas"
                                  enabled={unit.petFriendly}
                                />
                                <FeatureIcon
                                  icon={Cigarette}
                                  label="Permite fumar"
                                  enabled={unit.smokingAllowed}
                                />
                              </div>
                            </div>

                            {/* Servicios Incluidos */}
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Servicios incluidos:</h6>
                              <div className="grid grid-cols-2 gap-2">
                                <FeatureIcon icon={Wifi} label="Internet" enabled={unit.internet} />
                                <FeatureIcon icon={Tv} label="Cable TV" enabled={unit.cableTV} />
                                <FeatureIcon icon={Calendar} label="Agua" enabled={unit.waterIncluded} />
                                <FeatureIcon icon={Calendar} label="Gas" enabled={unit.gasIncluded} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-6">
                        {/* Información del Contrato Actual */}
                        {activeContract && (
                          <div>
                            <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                              <FileText className="h-4 w-4 text-blue-600 mr-2" />
                              Información del Contrato Actual
                            </h5>
                            <div className="bg-white rounded-lg p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Inquilinos */}
                                <div className="flex flex-col gap-6">
                                  <div>
                                    <h6 className="text-sm font-medium text-gray-700 mb-2">Inquilino:</h6>
                                    <div className="space-y-1">
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 text-gray-400 mr-2" />
                                        <span className="text-sm">
                                          {activeContract.tenant.user.name}{' '}
                                          {activeContract.tenant.user.lastName}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <Mail className="h-3 w-3 text-gray-400 mr-2" />
                                        <span className="text-sm">{activeContract.tenant.user.email}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Phone className="h-3 w-3 text-gray-400 mr-2" />
                                        <span className="text-sm">{activeContract.tenant.user.phone}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {activeContract.additionalResidents.length && (
                                    <div>
                                      <h6 className="text-sm font-medium text-gray-700 mb-2">
                                        Residentes adicionales:
                                      </h6>
                                      <div className="flex flex-col gap-3">
                                        {activeContract.additionalResidents.map((additionalResident) => (
                                          <div key={additionalResident.id} className="space-y-1">
                                            <div className="flex items-center">
                                              <User className="h-3 w-3 text-gray-400 mr-2" />
                                              <span className="text-sm">
                                                {additionalResident.name} {additionalResident.lastName}
                                              </span>
                                            </div>
                                            {additionalResident.email && (
                                              <div className="flex items-center">
                                                <Mail className="h-3 w-3 text-gray-400 mr-2" />
                                                <span className="text-sm">{additionalResident.email}</span>
                                              </div>
                                            )}
                                            {additionalResident.phone && (
                                              <div className="flex items-center">
                                                <Phone className="h-3 w-3 text-gray-400 mr-2" />
                                                <span className="text-sm">{additionalResident.phone}</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Detalles del Contrato */}
                                <div>
                                  <h6 className="text-sm font-medium text-gray-700 mb-2">
                                    Detalles del Contrato:
                                  </h6>
                                  <div className="space-y-1">
                                    <InfoRow
                                      icon={DollarSign}
                                      label="Renta mensual"
                                      value={`$${activeContract.rent.toLocaleString()}`}
                                      iconColor="text-green-600"
                                    />
                                    <InfoRow
                                      icon={Calendar}
                                      label="Inicio"
                                      value={new Date(activeContract.startDate).toLocaleDateString('es-CO')}
                                      iconColor="text-blue-600"
                                    />
                                    <InfoRow
                                      icon={Calendar}
                                      label="Vencimiento"
                                      value={new Date(activeContract.endDate).toLocaleDateString('es-CO')}
                                      iconColor="text-red-600"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Historial de Pagos */}
                        {activeContract && activeContract.payments.length > 0 && (
                          <div>
                            <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                              <Receipt className="h-4 w-4 text-green-600 mr-2" />
                              Historial de Pagos
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {activeContract.payments.length} pagos
                              </span>
                            </h5>

                            {/* Estadísticas de Pagos */}
                            {paymentStats && (
                              <div className="bg-white rounded-lg p-3 mb-4">
                                <h6 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                  <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                                  Resumen de Pagos
                                </h6>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">
                                      ${paymentStats.totalPaid.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">Total Pagado</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-yellow-600">
                                      ${paymentStats.totalPending.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">Pendiente</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-red-600">
                                      {paymentStats.overdueCount}
                                    </div>
                                    <div className="text-xs text-gray-500">Pagos Vencidos</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-orange-600">
                                      ${paymentStats.totalLateFees.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">Recargos por Mora</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Lista de Pagos */}
                            <div className="bg-white rounded-lg overflow-hidden">
                              {/* Notas adicionales */}
                              {activeContract.payments.some((p) => p.notes) && (
                                <div className="border-t bg-gray-50 p-3">
                                  <h6 className="text-xs font-medium text-gray-700 mb-2">Notas:</h6>
                                  <div className="space-y-1">
                                    {activeContract.payments
                                      .filter((p) => p.notes)
                                      .map((payment) => (
                                        <div
                                          key={payment.id}
                                          className="text-xs text-gray-600 flex items-start"
                                        >
                                          <AlertCircle className="h-3 w-3 text-orange-500 mr-1 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <span className="font-medium">
                                              {new Date(payment.dueDate).toLocaleDateString('es-CO')}:
                                            </span>{' '}
                                            {payment.notes}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Fecha Venc.
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Estado
                                      </th>
                                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                        Monto
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Método
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Pagado
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {[...activeContract.payments].reverse().map((payment) => (
                                      <tr
                                        key={payment.id}
                                        className={`hover:bg-gray-50 ${payment.status === 'OVERDUE' ? 'bg-red-50' : ''}`}
                                      >
                                        <td className="px-3 py-2">
                                          <div className="flex items-center">
                                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                            <span className="text-xs">
                                              {new Date(payment.dueDate).toLocaleDateString('es-CO')}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2">
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                              payment.status
                                            )}`}
                                          >
                                            {payment.status === 'OVERDUE' && (
                                              <AlertTriangle className="h-3 w-3 mr-1" />
                                            )}
                                            {payment.status === 'PAID' && (
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                            )}
                                            {payment.status === 'PENDING' && (
                                              <Clock className="h-3 w-3 mr-1" />
                                            )}
                                            {formatPaymentStatus(payment.status)}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                          <div className="text-sm font-medium text-gray-900">
                                            ${payment.amount.toLocaleString()}
                                          </div>
                                          {payment.lateFeeApplied && payment.lateFeeAmount && (
                                            <div className="text-xs text-red-600">
                                              +$
                                              {payment.lateFeeAmount.toLocaleString()} recargo
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                          {formatPaymentMethod(payment.paymentMethod)}
                                        </td>
                                        <td className="px-3 py-2">
                                          {payment.paidDate ? (
                                            <div className="text-xs">
                                              <div className="text-gray-900">
                                                {new Date(payment.paidDate).toLocaleDateString('es-CO')}
                                              </div>
                                              {payment.receiptNumber && (
                                                <div className="text-gray-500">
                                                  Recibo: {payment.receiptNumber}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mensaje cuando no hay contrato activo */}
                      {!activeContract && (
                        <div className="lg:col-span-2">
                          <div className="bg-gray-100 rounded-lg p-6 text-center">
                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 text-sm">
                              Esta unidad no tiene un contrato activo actualmente.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
