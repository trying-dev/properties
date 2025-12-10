'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Upload, FileText, Zap } from 'lucide-react'

const ApplicationForm = () => {
  const [selectedProfile, setSelectedProfile] = useState('')
  const [selectedSecurity, setSelectedSecurity] = useState('')
  const [acceptedDeposit, setAcceptedDeposit] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [applicantInfo, setApplicantInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    monthlyIncome: '',
    rentBudget: '',
  })
  const [uploadedDocs, setUploadedDocs] = useState({})

  // Mock Data por perfil
  const mockDataByProfile = {
    formal: {
      fullName: 'Carlos Andrés Rodríguez',
      email: 'carlos.rodriguez@empresa.com',
      phone: '+57 310 555 1234',
      monthlyIncome: '5500000',
      rentBudget: '1800000',
    },
    independent: {
      fullName: 'María Fernanda López',
      email: 'mf.lopez@freelance.com',
      phone: '+57 315 555 5678',
      monthlyIncome: '6200000',
      rentBudget: '2000000',
    },
    retired: {
      fullName: 'Jorge Alberto Martínez',
      email: 'jorge.martinez@gmail.com',
      phone: '+57 320 555 9012',
      monthlyIncome: '4800000',
      rentBudget: '1500000',
    },
    entrepreneur: {
      fullName: 'Ana Patricia Gómez',
      email: 'ana.gomez@miempresa.com',
      phone: '+57 312 555 3456',
      monthlyIncome: '8500000',
      rentBudget: '2800000',
    },
    investor: {
      fullName: 'Roberto Carlos Sánchez',
      email: 'roberto.sanchez@inversiones.com',
      phone: '+57 318 555 7890',
      monthlyIncome: '12000000',
      rentBudget: '3500000',
    },
    student: {
      fullName: 'Laura Valentina Moreno',
      email: 'laura.moreno@universidad.edu.co',
      phone: '+57 314 555 2345',
      monthlyIncome: '2500000',
      rentBudget: '1200000',
    },
    foreignLocal: {
      fullName: 'Michael Anderson',
      email: 'michael.anderson@company.com',
      phone: '+57 316 555 6789',
      monthlyIncome: '7500000',
      rentBudget: '2500000',
    },
    nomad: {
      fullName: 'Emma Johnson',
      email: 'emma.johnson@remote.io',
      phone: '+57 319 555 0123',
      monthlyIncome: '9500000',
      rentBudget: '3000000',
    },
  }

  const profiles = {
    formal: {
      emoji: '👔',
      name: 'Empleado Formal',
      deposit: '2 meses',
      fields: [
        { id: 'cedula', label: 'Cédula', type: 'file', accept: '.pdf,.jpg,.png' },
        {
          id: 'cert_laboral',
          label: 'Certificado laboral (antigüedad, cargo, salario)',
          type: 'file',
          accept: '.pdf',
        },
        { id: 'colillas', label: '3 últimas colillas de pago', type: 'file', accept: '.pdf', multiple: true },
        {
          id: 'extractos',
          label: 'Extractos bancarios últimos 3 meses',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        { id: 'ref_personal_1', label: 'Referencia Personal 1 - Nombre', type: 'text' },
        { id: 'ref_personal_1_tel', label: 'Referencia Personal 1 - Teléfono', type: 'tel' },
        { id: 'ref_personal_2', label: 'Referencia Personal 2 - Nombre', type: 'text' },
        { id: 'ref_personal_2_tel', label: 'Referencia Personal 2 - Teléfono', type: 'tel' },
      ],
    },
    independent: {
      emoji: '💼',
      name: 'Independiente',
      deposit: '2 meses',
      fields: [
        { id: 'cedula', label: 'Cédula', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'rut', label: 'RUT actualizado', type: 'file', accept: '.pdf' },
        {
          id: 'declaracion_renta',
          label: 'Declaración de renta últimos 2 años',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'extractos',
          label: 'Extractos bancarios últimos 6 meses',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'facturas',
          label: 'Facturas o contratos vigentes',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'camara_comercio',
          label: 'Certificado Cámara de Comercio (si aplica)',
          type: 'file',
          accept: '.pdf',
          required: false,
        },
      ],
    },
    retired: {
      emoji: '😊',
      name: 'Pensionado',
      deposit: '2 meses',
      fields: [
        { id: 'cedula', label: 'Cédula', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'cert_pension', label: 'Certificado de pensión actualizado', type: 'file', accept: '.pdf' },
        { id: 'resolucion', label: 'Resolución de pensión', type: 'file', accept: '.pdf' },
        {
          id: 'colillas_mesada',
          label: '3 últimas colillas de mesada',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'extractos',
          label: 'Extractos bancarios últimos 3 meses',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
      ],
    },
    entrepreneur: {
      emoji: '🏢',
      name: 'Empresario',
      deposit: '2 meses',
      fields: [
        { id: 'cedula', label: 'Cédula', type: 'file', accept: '.pdf,.jpg,.png' },
        {
          id: 'estados_financieros',
          label: 'Estados financieros (último año)',
          type: 'file',
          accept: '.pdf',
        },
        {
          id: 'camara_comercio',
          label: 'Certificado Cámara de Comercio vigente',
          type: 'file',
          accept: '.pdf',
        },
        {
          id: 'declaracion_renta',
          label: 'Declaración de renta últimos 2 años',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'extractos_empresariales',
          label: 'Extractos bancarios empresariales (6 meses)',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'extractos_personales',
          label: 'Extractos bancarios personales (6 meses)',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
      ],
    },
    investor: {
      emoji: '📈',
      name: 'Inversionista',
      deposit: '2 meses',
      fields: [
        { id: 'cedula', label: 'Cédula', type: 'file', accept: '.pdf,.jpg,.png' },
        {
          id: 'cert_cdts',
          label: 'Certificados de CDTs o inversiones',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'contratos_arriendo',
          label: 'Contratos de arriendo de otras propiedades',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'cert_rendimientos',
          label: 'Certificados de rendimientos financieros',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'extractos',
          label: 'Extractos bancarios últimos 3 meses',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
      ],
    },
    student: {
      emoji: '🎓',
      name: 'Estudiante',
      deposit: '3 meses',
      fields: [
        { id: 'cedula', label: 'Cédula del estudiante', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'cert_matricula', label: 'Certificado de matrícula vigente', type: 'file', accept: '.pdf' },
        {
          id: 'carta_patrocinador',
          label: 'Carta del patrocinador/padre autenticada',
          type: 'file',
          accept: '.pdf',
        },
        { id: 'nombre_patrocinador', label: 'Nombre completo del patrocinador', type: 'text' },
        { id: 'cedula_patrocinador', label: 'Cédula del patrocinador', type: 'text' },
        { id: 'tel_patrocinador', label: 'Teléfono del patrocinador', type: 'tel' },
      ],
    },
    foreignLocal: {
      emoji: '🌍',
      name: 'Extranjero Local',
      deposit: '3 meses',
      fields: [
        { id: 'pasaporte', label: 'Pasaporte', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'visa', label: 'Visa vigente', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'cedula_extranjeria', label: 'Cédula de extranjería', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'contrato_laboral', label: 'Contrato laboral en Colombia', type: 'file', accept: '.pdf' },
        {
          id: 'extractos',
          label: 'Extractos cuenta bancaria colombiana (3 meses)',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        { id: 'cert_laboral', label: 'Certificado laboral empresa colombiana', type: 'file', accept: '.pdf' },
      ],
    },
    nomad: {
      emoji: '🌐',
      name: 'Nómada Digital',
      deposit: '3-6 meses',
      fields: [
        { id: 'pasaporte', label: 'Pasaporte', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'visa', label: 'Visa (si aplica)', type: 'file', accept: '.pdf,.jpg,.png', required: false },
        {
          id: 'contratos',
          label: 'Contratos laborales apostillados',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'extractos_internacionales',
          label: 'Extractos cuenta internacional (6 meses)',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'comprobantes_ingresos',
          label: 'Comprobantes de ingresos en USD/EUR',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        { id: 'tipo_cambio', label: 'Tasa de cambio aplicada (COP)', type: 'number' },
      ],
    },
  }

  const securityOptions = [
    {
      id: 'double',
      name: 'Doble Garantía Personal',
      description: 'Dos Codeudores',
      requirements: 'Ingresos combinados ≥ 3x canon',
      fields: [
        { id: 'cedula_codeudor_1', label: 'Cédula Codeudor 1', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'cedula_codeudor_2', label: 'Cédula Codeudor 2', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'cert_laboral_1', label: 'Certificado laboral Codeudor 1', type: 'file', accept: '.pdf' },
        { id: 'cert_laboral_2', label: 'Certificado laboral Codeudor 2', type: 'file', accept: '.pdf' },
        {
          id: 'declaracion_renta_1',
          label: 'Declaración de renta o extractos Codeudor 1',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'declaracion_renta_2',
          label: 'Declaración de renta o extractos Codeudor 2',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'cert_tradicion_1',
          label: 'Certificado de tradición Codeudor 1 (si aplica)',
          type: 'file',
          accept: '.pdf',
          required: false,
        },
        {
          id: 'cert_tradicion_2',
          label: 'Certificado de tradición Codeudor 2 (si aplica)',
          type: 'file',
          accept: '.pdf',
          required: false,
        },
        {
          id: 'carta_aceptacion_1',
          label: 'Carta de aceptación firmada Codeudor 1',
          type: 'file',
          accept: '.pdf',
        },
        {
          id: 'carta_aceptacion_2',
          label: 'Carta de aceptación firmada Codeudor 2',
          type: 'file',
          accept: '.pdf',
        },
      ],
    },
    {
      id: 'reinforced',
      name: 'Garantía Personal Reforzada',
      description: 'Un Codeudor con Mayor Capacidad',
      requirements: 'Ingresos del codeudor ≥ 4x canon',
      fields: [
        { id: 'cedula_codeudor', label: 'Cédula del codeudor', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'cert_laboral', label: 'Certificado laboral', type: 'file', accept: '.pdf' },
        {
          id: 'declaracion_renta',
          label: 'Declaración de renta o extractos',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'cert_tradicion',
          label: 'Certificado de tradición (preferible)',
          type: 'file',
          accept: '.pdf',
          required: false,
        },
        { id: 'carta_aceptacion', label: 'Carta de aceptación firmada', type: 'file', accept: '.pdf' },
      ],
    },
    {
      id: 'insurance',
      name: 'Garantía con Aseguradora',
      description: 'Póliza de Arrendamiento',
      requirements: 'Score crediticio + Ingresos ≥ 3x canon',
      fields: [
        {
          id: 'solicitud_poliza',
          label: 'Solicitud de póliza (formato aseguradora)',
          type: 'file',
          accept: '.pdf',
        },
        { id: 'autorizacion_credito', label: 'Autorización estudio de crédito', type: 'checkbox' },
        { id: 'cert_ingresos', label: 'Certificado de ingresos validado', type: 'file', accept: '.pdf' },
        { id: 'poliza_pagada', label: 'Comprobante de pago de póliza', type: 'file', accept: '.pdf' },
      ],
    },
    {
      id: 'mixed',
      name: 'Garantía Mixta Premium',
      description: 'Codeudor + Póliza',
      requirements: 'Codeudor con capacidad + Score crediticio',
      fields: [
        { id: 'cedula_codeudor', label: 'Cédula del codeudor', type: 'file', accept: '.pdf,.jpg,.png' },
        { id: 'cert_laboral', label: 'Certificado laboral del codeudor', type: 'file', accept: '.pdf' },
        {
          id: 'declaracion_renta',
          label: 'Declaración de renta o extractos del codeudor',
          type: 'file',
          accept: '.pdf',
          multiple: true,
        },
        {
          id: 'cert_tradicion',
          label: 'Certificado de tradición (preferible)',
          type: 'file',
          accept: '.pdf',
          required: false,
        },
        {
          id: 'carta_aceptacion',
          label: 'Carta de aceptación firmada del codeudor',
          type: 'file',
          accept: '.pdf',
        },
        {
          id: 'solicitud_poliza',
          label: 'Solicitud de póliza (formato aseguradora)',
          type: 'file',
          accept: '.pdf',
        },
        { id: 'autorizacion_credito', label: 'Autorización estudio de crédito', type: 'checkbox' },
        { id: 'cert_ingresos', label: 'Certificado de ingresos validado', type: 'file', accept: '.pdf' },
        { id: 'poliza_pagada', label: 'Comprobante de pago de póliza', type: 'file', accept: '.pdf' },
      ],
    },
  ]

  const handleFileChange = (fieldId, files) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [fieldId]: files,
    }))
  }

  // Función para crear archivos mock
  const createMockFile = (fileName) => {
    return new File([''], fileName, { type: 'application/pdf' })
  }

  // Llenar con datos mock para Paso 2
  const fillMockDataStep2 = () => {
    if (!selectedProfile) return

    // Llenar información básica
    setApplicantInfo(mockDataByProfile[selectedProfile])

    // Llenar documentos mock según el perfil
    const mockDocs = {}
    profiles[selectedProfile].fields.forEach((field) => {
      if (field.type === 'file') {
        if (field.multiple) {
          mockDocs[field.id] = [
            createMockFile(`${field.id}_1.pdf`),
            createMockFile(`${field.id}_2.pdf`),
            createMockFile(`${field.id}_3.pdf`),
          ]
        } else {
          mockDocs[field.id] = [createMockFile(`${field.id}.pdf`)]
        }
      }
    })
    setUploadedDocs(mockDocs)

    // Aceptar depósito automáticamente
    setAcceptedDeposit(true)
  }

  // Llenar con datos mock para Paso 3
  const fillMockDataStep3 = () => {
    if (!selectedSecurity) return

    const mockDocs = { ...uploadedDocs }
    const securityOption = securityOptions.find((opt) => opt.id === selectedSecurity)

    securityOption.fields.forEach((field) => {
      if (field.type === 'file') {
        if (field.multiple) {
          mockDocs[field.id] = [createMockFile(`${field.id}_1.pdf`), createMockFile(`${field.id}_2.pdf`)]
        } else {
          mockDocs[field.id] = [createMockFile(`${field.id}.pdf`)]
        }
      }
    })
    setUploadedDocs(mockDocs)
  }

  const canProceedToStep2 = selectedProfile
  const canProceedToStep3 =
    canProceedToStep2 &&
    applicantInfo.fullName.trim() &&
    applicantInfo.email.trim() &&
    applicantInfo.phone.trim() &&
    applicantInfo.monthlyIncome.trim() &&
    applicantInfo.rentBudget.trim() &&
    acceptedDeposit

  const renderField = (field) => {
    if (field.type === 'file') {
      return (
        <label
          key={field.id}
          className={`flex flex-col gap-2 text-sm text-gray-700 ${field.multiple ? 'md:col-span-2' : ''}`}
        >
          <span className="font-medium">
            {field.label} {field.required !== false && <span className="text-red-500">*</span>}
          </span>
          <div className="relative">
            <input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => handleFileChange(field.id, e.target.files)}
              className="hidden"
              id={field.id}
            />
            <label
              htmlFor={field.id}
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload size={20} className="text-gray-500" />
              <span className="text-gray-600">
                {uploadedDocs[field.id]
                  ? `${uploadedDocs[field.id].length} archivo(s) seleccionado(s)`
                  : 'Haz clic para subir archivo'}
              </span>
            </label>
            {uploadedDocs[field.id] && (
              <div className="mt-2 space-y-1">
                {Array.from(uploadedDocs[field.id]).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                    <FileText size={14} />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>
      )
    }

    if (field.type === 'checkbox') {
      return (
        <label
          key={field.id}
          className="flex items-center gap-3 text-sm text-gray-700 md:col-span-2 p-3 bg-gray-50 rounded-lg"
        >
          <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
          <span>{field.label}</span>
        </label>
      )
    }

    return (
      <label key={field.id} className="flex flex-col gap-2 text-sm text-gray-700">
        <span className="font-medium">
          {field.label} {field.required !== false && <span className="text-red-500">*</span>}
        </span>
        <input
          type={field.type}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={field.type === 'tel' ? '+57 300 000 0000' : ''}
        />
      </label>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Solicitud de Arrendamiento</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            1
          </div>
          <div className={`w-24 h-1 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            2
          </div>
          <div className={`w-24 h-1 ${activeStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              activeStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            3
          </div>
        </div>
      </div>

      {/* PASO 1: Identificación de Perfil */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <button
          onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}
          className="w-full p-6 flex items-center justify-between text-left"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-800">PASO 1: Identificación de Perfil</h2>
            <p className="text-gray-600 mt-1">Selecciona tu perfil</p>
          </div>
          {activeStep === 1 ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {activeStep === 1 && (
          <div className="px-6 pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Selecciona tu perfil:</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.entries(profiles).map(([key, profile]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedProfile(key)
                    setAcceptedDeposit(false)
                    setUploadedDocs({})
                    setActiveStep(2)
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedProfile === key
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{profile.emoji}</span>
                    <span className="font-semibold text-gray-800">{profile.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PASO 2: Información y Documentos */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <button
          onClick={() => canProceedToStep2 && setActiveStep(activeStep === 2 ? 0 : 2)}
          disabled={!canProceedToStep2}
          className={`w-full p-6 flex items-center justify-between text-left ${
            !canProceedToStep2 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-800">PASO 2: Información y Documentos</h2>
            <p className="text-gray-600 mt-1">Completa tus datos y sube los documentos requeridos</p>
          </div>
          {activeStep === 2 ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {activeStep === 2 && (
          <div className="px-6 pb-6">
            {/* Botón Mock Data */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={fillMockDataStep2}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md"
              >
                <Zap size={18} />
                <span className="font-semibold">Llenar con datos de prueba</span>
              </button>
            </div>

            {/* Perfil seleccionado */}
            {selectedProfile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <span className="text-2xl">{profiles[selectedProfile].emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800">
                    Aplicando como: {profiles[selectedProfile].name}
                  </p>
                </div>
              </div>
            )}

            {/* Información Básica */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📋</span> Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  <span className="font-medium">
                    Nombre completo <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    value={applicantInfo.fullName}
                    onChange={(e) => setApplicantInfo({ ...applicantInfo, fullName: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  <span className="font-medium">
                    Correo electrónico <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="email"
                    value={applicantInfo.email}
                    onChange={(e) => setApplicantInfo({ ...applicantInfo, email: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="correo@ejemplo.com"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  <span className="font-medium">
                    Teléfono <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="tel"
                    value={applicantInfo.phone}
                    onChange={(e) => setApplicantInfo({ ...applicantInfo, phone: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+57 300 000 0000"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                  <span className="font-medium">
                    Ingreso mensual estimado (COP) <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="number"
                    value={applicantInfo.monthlyIncome}
                    onChange={(e) => setApplicantInfo({ ...applicantInfo, monthlyIncome: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5,000,000"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-700 md:col-span-2">
                  <span className="font-medium">
                    Canon objetivo / presupuesto (COP) <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="number"
                    value={applicantInfo.rentBudget}
                    onChange={(e) => setApplicantInfo({ ...applicantInfo, rentBudget: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2,500,000"
                  />
                </label>
              </div>
            </div>

            {/* Documentos específicos del perfil */}
            {selectedProfile && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📎</span> Documentos Requeridos -{' '}
                  {profiles[selectedProfile].name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profiles[selectedProfile].fields.map((field) => renderField(field))}
                </div>
              </div>
            )}

            {/* Confirmación de depósito */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-3">⚠️ Confirmación de Depósito</h4>
              <p className="text-gray-700 mb-4">
                Para el perfil de <strong>{selectedProfile ? profiles[selectedProfile].name : ''}</strong>, el
                depósito mínimo requerido es de{' '}
                <strong className="text-lg text-yellow-800">
                  {selectedProfile ? profiles[selectedProfile].deposit : ''}
                </strong>
              </p>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedDeposit}
                  onChange={(e) => setAcceptedDeposit(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">
                  Acepto y estoy de acuerdo con el depósito mínimo requerido de{' '}
                  <strong>{selectedProfile ? profiles[selectedProfile].deposit : ''}</strong> para continuar
                  con mi solicitud.
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                ← Volver al Paso 1
              </button>
              <button
                onClick={() => setActiveStep(3)}
                disabled={!canProceedToStep3}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  canProceedToStep3
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continuar al Paso 3 →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PASO 3: Seguridad del contrato */}
      <div className="bg-white rounded-lg shadow-md">
        <button
          onClick={() => canProceedToStep3 && setActiveStep(activeStep === 3 ? 0 : 3)}
          disabled={!canProceedToStep3}
          className={`w-full p-6 flex items-center justify-between text-left ${
            !canProceedToStep3 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-800">PASO 3: Seguridad del Contrato</h2>
            <p className="text-gray-600 mt-1">Selecciona tu opción de garantía y completa la información</p>
          </div>
          {activeStep === 3 ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {activeStep === 3 && (
          <div className="px-6 pb-6">
            {/* Botón Mock Data */}
            {selectedSecurity && (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={fillMockDataStep3}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md"
                >
                  <Zap size={18} />
                  <span className="font-semibold">Llenar documentos de prueba</span>
                </button>
              </div>
            )}

            {/* Resumen del solicitante */}
            {selectedProfile && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Perfil</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <span>{profiles[selectedProfile].emoji}</span>
                      {profiles[selectedProfile].name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Solicitante</p>
                    <p className="font-semibold text-gray-800">{applicantInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Presupuesto</p>
                    <p className="font-semibold text-gray-800">
                      ${parseInt(applicantInfo.rentBudget).toLocaleString('es-CO')} COP
                    </p>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecciona tu tipo de garantía:</h3>

            <div className="space-y-4 mb-6">
              {securityOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg transition-all ${
                    selectedSecurity === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setSelectedSecurity(selectedSecurity === option.id ? '' : option.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-lg">{option.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                        <p className="text-blue-700 text-sm font-medium mt-2">📊 {option.requirements}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
                          selectedSecurity === option.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                        }`}
                      >
                        {selectedSecurity === option.id && <Check size={16} className="text-white" />}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Formulario de documentos de garantía */}
            {selectedSecurity && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📎</span> Documentos de Garantía -{' '}
                  {securityOptions.find((opt) => opt.id === selectedSecurity)?.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {securityOptions
                    .find((opt) => opt.id === selectedSecurity)
                    ?.fields.map((field) => renderField(field))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                ← Volver al Paso 2
              </button>
              <button
                disabled={!selectedSecurity}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedSecurity
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Enviar Solicitud ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationForm
