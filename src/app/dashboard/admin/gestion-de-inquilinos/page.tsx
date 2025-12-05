'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Edit,
  Eye,
  UserX,
  Download,
  X,
} from 'lucide-react'
import {
  createTenantAction,
  disableTenantAction,
  getTenantsAction,
  getTenantsStatsAction,
} from '+/actions/gestion-de-inquilinos/actions_and_mutations'

// Formulario de creación de tenant
const CreateTenantForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    // Datos básicos
    email: '',
    name: '',
    lastName: '',
    documentType: 'CC',
    documentNumber: '',
    phone: '',
    birthDate: '',
    gender: 'PREFER_NOT_TO_SAY',
    maritalStatus: 'SINGLE',

    // Dirección
    address: '',
    city: '',
    state: '',
    country: 'Colombia',

    // Información profesional
    profession: '',
    employmentStatus: '',
    monthlyIncome: '',

    // Contacto de emergencia
    emergencyContact: '',
    emergencyContactPhone: '',

    // Contraseña temporal
    password: '',
  })

  const [references, setReferences] = useState([{ name: '', phone: '', relationship: '' }])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addReference = () => {
    setReferences((prev) => [...prev, { name: '', phone: '', relationship: '' }])
  }

  const removeReference = (index) => {
    setReferences((prev) => prev.filter((_, i) => i !== index))
  }

  const updateReference = (index, field, value) => {
    setReferences((prev) => prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
      references: references.filter((ref) => ref.name.trim() !== ''),
    }

    onSubmit(submitData)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      lastName: '',
      documentType: 'CC',
      documentNumber: '',
      phone: '',
      birthDate: '',
      gender: 'PREFER_NOT_TO_SAY',
      maritalStatus: 'SINGLE',
      address: '',
      city: '',
      state: '',
      country: 'Colombia',
      profession: '',
      employmentStatus: '',
      monthlyIncome: '',
      emergencyContact: '',
      emergencyContactPhone: '',
      password: '',
    })
    setReferences([{ name: '', phone: '', relationship: '' }])
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Inquilino</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento *</label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PASSPORT">Pasaporte</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.documentNumber}
                    onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                    <option value="PREFER_NOT_TO_SAY">Prefiero no decir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.maritalStatus}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  >
                    <option value="SINGLE">Soltero</option>
                    <option value="MARRIED">Casado</option>
                    <option value="DIVORCED">Divorciado</option>
                    <option value="WIDOWED">Viudo</option>
                    <option value="SEPARATED">Separado</option>
                    <option value="COMMON_LAW">Unión Libre</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento/Estado</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Profesional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profesión</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Laboral</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.employmentStatus}
                    onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                    placeholder="Empleado, Independiente, Pensionado..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos Mensuales</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    placeholder="1000000"
                  />
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contacto de Emergencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono del Contacto
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Referencias */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Referencias</h3>
                <button
                  type="button"
                  onClick={addReference}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Agregar Referencia
                </button>
              </div>

              <div className="space-y-4">
                {references.map((reference, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Referencia {index + 1}</span>
                      {references.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeReference(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={reference.name}
                          onChange={(e) => updateReference(index, 'name', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                          type="tel"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={reference.phone}
                          onChange={(e) => updateReference(index, 'phone', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relación</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={reference.relationship}
                          onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                          placeholder="Familiar, Amigo, Jefe..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contraseña Temporal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acceso al Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Temporal (Opcional)
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Si no se especifica, no podrá acceder al sistema"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Crear Inquilino
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TenantsManagement() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    city: '',
    documentType: '',
    employmentStatus: '',
    page: 1,
    pageSize: 20,
  })

  // Para evitar condiciones de carrera
  const reqCounter = useRef(0)

  const loadTenants = async () => {
    setLoading(true)
    const currentReq = ++reqCounter.current

    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      )

      const result = await getTenantsAction(cleanFilters)

      if (currentReq === reqCounter.current) {
        if (result.success) {
          setTenants(result.data || [])
        } else {
          console.error(result.error)
          setTenants([])
        }
      }
    } catch (error) {
      if (currentReq === reqCounter.current) {
        console.error('Error al cargar inquilinos:', error)
        setTenants([])
      }
    } finally {
      if (currentReq === reqCounter.current) {
        setLoading(false)
      }
    }
  }

  const loadStats = async () => {
    try {
      const result = await getTenantsStatsAction()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  useEffect(() => {
    loadTenants()
    loadStats()
  }, [])

  // Auto-buscar con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTenants()
    }, 300)
    return () => clearTimeout(timer)
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset a primera página al filtrar
    }))
  }

  const handleCreateTenant = async (tenantData) => {
    try {
      const result = await createTenantAction(tenantData)

      if (result.success) {
        setShowCreateModal(false)
        loadTenants()
        loadStats()
        alert('Inquilino creado exitosamente')
      } else {
        alert(result.error || 'Error al crear el inquilino')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el inquilino')
    }
  }

  const handleDisableTenant = async (tenantId) => {
    if (!confirm('¿Estás seguro de que quieres deshabilitar este inquilino?')) {
      return
    }

    try {
      const result = await disableTenantAction(tenantId)

      if (result.success) {
        loadTenants()
        loadStats()
        alert('Inquilino deshabilitado exitosamente')
      } else {
        alert(result.error || 'Error al deshabilitar el inquilino')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al deshabilitar el inquilino')
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'No especificado'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return 'No especificado'
    return new Date(date).toLocaleDateString('es-CO')
  }

  const getDocumentTypeLabel = (type) => {
    const types = {
      CC: 'Cédula de Ciudadanía',
      CE: 'Cédula de Extranjería',
      TI: 'Tarjeta de Identidad',
      PASSPORT: 'Pasaporte',
      OTHER: 'Otro',
    }
    return types[type] || type
  }

  const getStatusBadge = (tenant) => {
    const hasActiveContract = tenant.contracts.some((c) => c.status === 'ACTIVE')

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Inquilinos</h1>
            <p className="text-gray-600">Administra los inquilinos y sus datos personales</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Inquilino</span>
          </button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center">
                <User className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalTenants}</p>
                  <p className="text-sm text-gray-600">Total Inquilinos</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeContracts}</p>
                  <p className="text-sm text-gray-600">Contratos Activos</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-2xl font-semibold text-gray-900">{stats.citiesDistribution.length}</p>
                  <p className="text-sm text-gray-600">Ciudades</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Búsqueda y Filtros
          </h2>

          <div className="flex items-center space-x-2">
            <button className="text-gray-600 hover:text-gray-800 flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda por texto */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar inquilino</label>
            <input
              type="text"
              placeholder="Buscar por nombre, email, documento..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Filtro por ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">Todas las ciudades</option>
              {stats?.citiesDistribution?.map((city) => (
                <option key={city.city} value={city.city}>
                  {city.city} ({city._count})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por tipo de documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.documentType}
              onChange={(e) => handleFilterChange('documentType', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PASSPORT">Pasaporte</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Inquilinos */}
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
            <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inquilino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contratos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
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

                    <td className="px-6 py-4 whitespace-nowrap">
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

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDocumentTypeLabel(tenant.user.documentType)}
                      </div>
                      <div className="text-sm text-gray-500">{tenant.user.documentNumber}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {tenant.user.city || 'No especificado'}
                      </div>
                      {tenant.user.state && <div className="text-sm text-gray-500">{tenant.user.state}</div>}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tenant)}
                      {tenant.monthlyIncome && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatCurrency(tenant.monthlyIncome)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.contracts.length} contrato(s)</div>
                      {tenant.contracts.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Último: {tenant.contracts[0]?.unit?.property?.name}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        {!tenant.user.disable && (
                          <button
                            onClick={() => handleDisableTenant(tenant.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Deshabilitar"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Creación */}
      <CreateTenantForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTenant}
      />
    </div>
  )
}
