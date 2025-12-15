import { useState, type ComponentType, type ReactNode, type SVGProps } from 'react'
import {
  User,
  Plus,
  Minus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Heart,
  CreditCard,
  Shield,
  Clock,
  Users,
  Award,
} from 'lucide-react'
import { PropertyWithRelations } from '+/actions/property'
import { AdminLevel, DocumentType, Gender, MaritalStatus } from '@prisma/client'
import { formatAdminLevel } from '../utils'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

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

const InfoRow = ({
  icon: Icon,
  label,
  value,
  iconColor = 'text-gray-400',
}: {
  icon: IconType
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

export const ExpandablePropertyAdmin = ({ property }: { property: NonNullable<PropertyWithRelations> }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const admin = property?.admin

  if (!admin) return null

  const formatDocumentType = (type?: DocumentType | null) => {
    if (!type) return 'No especificado'
    const types = {
      CC: 'Cédula de Ciudadanía',
      CE: 'Cédula de Extranjería',
      TI: 'Tarjeta de Identidad',
      PASSPORT: 'Pasaporte',
      NIT: 'NIT',
      OTHER: 'Otro',
    }
    return types[type] ?? 'No especificado'
  }

  const formatGender = (gender?: Gender | null) => {
    if (!gender) return 'No especificado'
    const genders = {
      MALE: 'Masculino',
      FEMALE: 'Femenino',
      OTHER: 'Otro',
      PREFER_NOT_TO_SAY: 'Prefiere no decir',
    }
    return genders[gender] ?? 'No especificado'
  }

  const formatMaritalStatus = (status?: MaritalStatus | null) => {
    if (!status) return 'No especificado'
    const statuses = {
      SINGLE: 'Soltero(a)',
      MARRIED: 'Casado(a)',
      DIVORCED: 'Divorciado(a)',
      WIDOWED: 'Viudo(a)',
      SEPARATED: 'Separado(a)',
      COMMON_LAW: 'Unión libre',
    }
    return statuses[status] ?? 'No especificado'
  }

  const getAdminLevelColor = (level: AdminLevel) => {
    const colors = {
      SUPER_ADMIN: 'bg-red-100 text-red-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      STANDARD: 'bg-green-100 text-green-800',
      LIMITED: 'bg-yellow-100 text-yellow-800',
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  const calculateAge = (birthDate: Date | null) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getTimeSince = (date: Date | null) => {
    if (!date) return 'Nunca'

    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 30) return `Hace ${days} días`
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`
    return `Hace ${Math.floor(days / 365)} años`
  }

  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'lg:col-span-3' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {isExpanded ? 'Información Completa del Administrador' : 'Administrador'}
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors duration-200"
            title={isExpanded ? 'Contraer información' : 'Ver información completa'}
          >
            {isExpanded ? (
              <Minus className="h-4 w-4 text-purple-600" />
            ) : (
              <Plus className="h-4 w-4 text-purple-600" />
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {!isExpanded ? (
          // Vista compacta (original)
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">
                {admin.user.name} {admin.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p className="font-medium">{admin.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono:</p>
              <p className="font-medium">{admin.user.phone}</p>
            </div>
          </div>
        ) : (
          // Vista expandida con toda la información
          <div className="space-y-6">
            {/* Header con foto y nivel */}
            <div className="flex items-start space-x-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-xl font-bold text-gray-900">
                    {admin.user.name} {admin.user.lastName}
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getAdminLevelColor(admin.adminLevel)}`}
                  >
                    <Shield className="h-3 w-3 inline mr-1" />
                    {formatAdminLevel(admin.adminLevel)}
                  </span>
                </div>
                <p className="text-gray-600 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {admin.user.profession}
                </p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-2" />
                  Último acceso: {getTimeSince(admin.user.lastLoginAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información de Contacto */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Mail className="h-4 w-4 text-blue-600 mr-2" />
                  Contacto
                </h4>
                <div className="space-y-1">
                  <InfoRow
                    icon={Mail}
                    label="Email principal"
                    value={
                      <div className="flex items-center space-x-2">
                        <span>{admin.user.email}</span>
                        {admin.user.emailVerified && (
                          <Award className="h-3 w-3 text-green-500">
                            <title>Email verificado</title>
                          </Award>
                        )}
                      </div>
                    }
                    iconColor="text-blue-600"
                  />
                  <InfoRow
                    icon={Phone}
                    label="Teléfono"
                    value={
                      <div className="flex items-center space-x-2">
                        <span>{admin.user.phone}</span>
                        {admin.user.phoneVerified && (
                          <Award className="h-3 w-3 text-green-500">
                            <title>Teléfono verificado</title>
                          </Award>
                        )}
                      </div>
                    }
                    iconColor="text-green-600"
                  />
                </div>
              </div>

              {/* Información Personal */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="h-4 w-4 text-orange-600 mr-2" />
                  Información Personal
                </h4>
                <div className="space-y-1">
                  <InfoRow
                    icon={CreditCard}
                    label="Tipo de documento"
                    value={formatDocumentType(admin.user.documentType)}
                    iconColor="text-orange-600"
                  />
                  <InfoRow
                    icon={CreditCard}
                    label="Documento"
                    value={admin.user.documentNumber}
                    iconColor="text-orange-600"
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Edad"
                    value={
                      calculateAge(admin.user.birthDate)
                        ? `${calculateAge(admin.user.birthDate)} años`
                        : 'N/A'
                    }
                    iconColor="text-purple-600"
                  />
                  <InfoRow
                    icon={User}
                    label="Género"
                    value={formatGender(admin.user.gender)}
                    iconColor="text-pink-600"
                  />
                  <InfoRow
                    icon={Heart}
                    label="Estado civil"
                    value={formatMaritalStatus(admin.user.maritalStatus)}
                    iconColor="text-red-600"
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="h-4 w-4 text-red-600 mr-2" />
                  Ubicación
                </h4>
                <div className="space-y-1">
                  <InfoRow
                    icon={MapPin}
                    label="Dirección"
                    value={admin.user.address}
                    iconColor="text-red-600"
                  />
                  <InfoRow icon={MapPin} label="Ciudad" value={admin.user.city} iconColor="text-red-500" />
                  <InfoRow
                    icon={MapPin}
                    label="Departamento"
                    value={admin.user.state}
                    iconColor="text-red-500"
                  />
                  <InfoRow icon={MapPin} label="País" value={admin.user.country} iconColor="text-red-500" />
                  {admin.user.birthPlace && (
                    <InfoRow
                      icon={MapPin}
                      label="Lugar de nacimiento"
                      value={admin.user.birthPlace}
                      iconColor="text-red-400"
                    />
                  )}
                </div>
              </div>

              {/* Información del Sistema */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="h-4 w-4 text-gray-600 mr-2" />
                  Sistema
                </h4>
                <div className="space-y-1">
                  <InfoRow
                    icon={Calendar}
                    label="Fecha de registro"
                    value={new Date(admin.user.createdAt).toLocaleDateString('es-CO')}
                    iconColor="text-gray-600"
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Admin desde"
                    value={new Date(admin.createdAt).toLocaleDateString('es-CO')}
                    iconColor="text-gray-600"
                  />
                  <InfoRow
                    icon={Clock}
                    label="Último acceso"
                    value={getTimeSince(admin.user.lastLoginAt)}
                    iconColor="text-gray-600"
                  />
                  <InfoRow
                    icon={Shield}
                    label="ID de administrador"
                    value={admin.id}
                    iconColor="text-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
