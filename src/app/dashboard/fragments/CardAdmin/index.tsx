import Image from 'next/image'
import { useState } from 'react'
import { Plus, Mail, Phone, MoreVertical, UserCheck, Shield } from 'lucide-react'

interface AdminData {
  id: string
  name: string
  email: string
  phone?: string
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STANDARD' | 'LIMITED'
  lastActive: string
  isOnline: boolean
}

// Datos simulados - en producción vendrían como props
const mockAdmin: AdminData = {
  id: 'admin-' + Math.random().toString(36).substr(2, 9),
  name: 'María González',
  email: 'maria.gonzalez@empresa.com',
  phone: '+52 55 1234 5678',
  role: 'MANAGER',
  lastActive: 'Hace 2 horas',
  isOnline: Math.random() > 0.3,
}

const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  MANAGER: 'Gerente',
  STANDARD: 'Estándar',
  LIMITED: 'Limitado',
}

const roleColors = {
  SUPER_ADMIN: 'bg-red-100 text-red-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  STANDARD: 'bg-green-100 text-green-800',
  LIMITED: 'bg-gray-100 text-gray-800',
}

export default function CardAdmin({ admin = mockAdmin }: { admin?: AdminData }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleContact = (type: 'email' | 'phone') => {
    if (type === 'email') {
      window.open(`mailto:${admin.email}`)
    } else if (type === 'phone' && admin.phone) {
      window.open(`tel:${admin.phone}`)
    }
  }

  const handleManage = () => {
    console.log('Manage admin:', admin.id)
    // Aquí iría la lógica para gestionar el admin
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
        flex items-center gap-4 p-4 rounded-lg border transition-all duration-200
        ${isHovered ? 'border-green-300 shadow-md bg-green-50/50' : 'border-gray-200 hover:border-gray-300'}
      `}
      >
        {/* Admin Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
            <Image
              src="/images/img2.png"
              alt={`Avatar de ${admin.name}`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Online Status */}
          <div className="absolute -bottom-1 -right-1">
            <div
              className={`
              w-5 h-5 rounded-full border-2 border-white flex items-center justify-center
              ${admin.isOnline ? 'bg-green-500' : 'bg-gray-400'}
            `}
            >
              {admin.isOnline && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                  {admin.name}
                </h3>
                <Shield className="h-4 w-4 text-gray-400" />
              </div>

              <p className="text-sm text-gray-600 truncate mt-1">{admin.email}</p>

              {/* Role and Status */}
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${roleColors[admin.role]}
                `}
                >
                  {roleLabels[admin.role]}
                </span>

                <span className="text-xs text-gray-500">
                  {admin.isOnline ? 'En línea' : admin.lastActive}
                </span>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className={`
                  p-2 rounded-full transition-all duration-200
                  ${
                    isHovered
                      ? 'bg-white shadow-sm border border-gray-200 opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }
                  hover:bg-gray-50
                `}
              >
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => handleContact('email')}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar email
                  </button>
                  {admin.phone && (
                    <button
                      onClick={() => handleContact('phone')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </button>
                  )}
                  <button
                    onClick={handleManage}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Gestionar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`
          flex items-center space-x-2 transition-all duration-200
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        `}
        >
          <button
            onClick={() => handleContact('email')}
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            title="Enviar email"
          >
            <Mail className="h-4 w-4" />
          </button>

          <button
            onClick={handleManage}
            className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
            title="Gestionar administrador"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(false)
          }}
        />
      )}
    </div>
  )
}
