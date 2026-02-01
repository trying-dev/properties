import { useState, type ComponentType, type ReactNode, type SVGProps } from 'react'
import { Building2, Plus, Minus, MapPin, Calendar, Home, Car, Ruler, Users, FileText } from 'lucide-react'
import { PropertyWithRelations } from '+/actions/property'
import { PropertyType } from '@prisma/client'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>{children}</div>
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
  value?: string | number | null
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

export const ExpandablePropertyInfo = ({ property }: { property: NonNullable<PropertyWithRelations> }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatPropertyType = (type: PropertyType) => {
    const types = {
      APARTMENT: 'Apartamento',
      HOUSE: 'Casa',
      COMMERCIAL_SPACE: 'Espacio Comercial',
      BUILDING: 'Edificio',
      OFFICE: 'Oficina',
      LAND: 'Terreno',
    }
    return types[type]
  }

  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'lg:col-span-3' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{isExpanded ? 'Información Completa' : 'Información'}</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            title={isExpanded ? 'Contraer información' : 'Ver información completa'}
          >
            {isExpanded ? <Minus className="h-4 w-4 text-blue-600" /> : <Plus className="h-4 w-4 text-blue-600" />}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {!isExpanded ? (
          // Vista compacta (original)
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium">{formatPropertyType(property.propertyType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pisos:</span>
              <span className="font-medium">{property.floors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Área construida:</span>
              <span className="font-medium">{property.builtArea} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Antigüedad:</span>
              <span className="font-medium">{property.age} años</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Parqueaderos:</span>
              <span className="font-medium">{property.parking}</span>
            </div>
          </div>
        ) : (
          // Vista expandida con toda la información
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información Básica */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <Home className="h-4 w-4 text-blue-600 mr-2" />
                Información Básica
              </h4>
              <div className="space-y-1">
                <InfoRow icon={FileText} label="Descripción" value={property.description} iconColor="text-amber-600" />
                <InfoRow icon={Building2} label="Tipo de propiedad" value={formatPropertyType(property.propertyType)} iconColor="text-blue-600" />
                <InfoRow icon={Ruler} label="Área construida" value={`${property.builtArea} m²`} iconColor="text-green-600" />
                <InfoRow
                  icon={Ruler}
                  label="Área total del lote"
                  value={property.totalLandArea ? `${property.totalLandArea} m²` : 'N/A'}
                  iconColor="text-green-600"
                />
                <InfoRow icon={Building2} label="Número de pisos" value={property.floors} iconColor="text-purple-600" />
                <InfoRow icon={Calendar} label="Antigüedad" value={`${property.age} años`} iconColor="text-orange-600" />
                <InfoRow icon={Car} label="Parqueaderos" value={property.parking} iconColor="text-indigo-600" />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="h-4 w-4 text-red-600 mr-2" />
                Ubicación
              </h4>
              <div className="space-y-1">
                <InfoRow icon={MapPin} label="Dirección" value={`${property.street} #${property.number}`} iconColor="text-red-600" />
                <InfoRow icon={MapPin} label="Barrio" value={property.neighborhood} iconColor="text-red-500" />
                <InfoRow icon={MapPin} label="Ciudad" value={property.city} iconColor="text-red-500" />
                <InfoRow icon={MapPin} label="Departamento" value={property.state} iconColor="text-red-500" />
                <InfoRow icon={MapPin} label="País" value={property.country} iconColor="text-red-500" />
                <InfoRow icon={MapPin} label="Código postal" value={property.postalCode} iconColor="text-red-500" />
              </div>
            </div>

            {/* Características Adicionales */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="h-4 w-4 text-green-600 mr-2" />
                Características Adicionales
              </h4>
              <div className="space-y-1">
                <InfoRow icon={Car} label="Ubicación parqueadero" value={property.parkingLocation} iconColor="text-indigo-600" />
                <InfoRow icon={Home} label="Jardín/Patio" value={property.yardOrGarden} iconColor="text-green-600" />
                <InfoRow icon={Building2} label="Balcones/Terrazas" value={property.balconiesAndTerraces} iconColor="text-blue-600" />
                <InfoRow icon={Users} label="Áreas recreativas" value={property.recreationalAreas} iconColor="text-purple-600" />
              </div>
            </div>

            {/* Información del Sistema */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                Información del Sistema
              </h4>
              <div className="space-y-1">
                <InfoRow icon={MapPin} label="Coordenadas GPS" value={property.gpsCoordinates} iconColor="text-red-600" />
                <InfoRow
                  icon={Calendar}
                  label="Fecha de registro"
                  value={new Date(property.createdAt).toLocaleDateString('es-CO')}
                  iconColor="text-gray-600"
                />
                <InfoRow
                  icon={Calendar}
                  label="Última actualización"
                  value={new Date(property.updatedAt).toLocaleDateString('es-CO')}
                  iconColor="text-gray-600"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
