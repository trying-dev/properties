'use client'

import { useState } from 'react'
import { Check, Upload, FileText, Zap, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { mockDataByProfile } from './_/mockData'
import { profiles, securityOptions } from './_/profiles'
import { ApplicantInfo, Field, ProfileId, UploadedDocsState } from './_/types'

const ApplicationForm = () => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileId | ''>('')
  const [selectedSecurity, setSelectedSecurity] = useState('')
  const [acceptedDeposit, setAcceptedDeposit] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [applicantInfo, setApplicantInfo] = useState<ApplicantInfo>({
    fullName: '',
    email: '',
    phone: '',
    documentType: 'cedula',
    documentNumber: '',
    monthlyIncome: '',
  })
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocsState>({})

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (!files) return
    setUploadedDocs((prev) => ({
      ...prev,
      [fieldId]: files,
    }))
  }

  const createMockFile = (fileName: string) => {
    return new File([''], fileName, { type: 'application/pdf' })
  }

  const handleSelectProfile = (profileId: ProfileId) => {
    setSelectedProfile(profileId)
    setAcceptedDeposit(false)
    setUploadedDocs({})
    setApplicantInfo((prev) => ({
      ...prev,
      documentType: profileId === 'foreignLocal' || profileId === 'nomad' ? 'pasaporte' : 'cedula',
      documentNumber: '',
    }))
    setActiveStep(2)
  }

  const fillMockDataStep2 = () => {
    if (!selectedProfile) return
    setApplicantInfo(mockDataByProfile[selectedProfile])
    const mockDocs: UploadedDocsState = {}
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
    setAcceptedDeposit(true)
  }

  const fillMockDataStep3 = () => {
    if (!selectedSecurity) return
    const mockDocs: UploadedDocsState = { ...uploadedDocs }
    const securityOption = securityOptions.find((opt) => opt.id === selectedSecurity)
    if (!securityOption) return

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
    applicantInfo.documentNumber.trim() &&
    applicantInfo.monthlyIncome.trim() &&
    acceptedDeposit

  const renderField = (field: Field) => {
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
                  ? `${uploadedDocs[field.id]?.length ?? 0} archivo(s) seleccionado(s)`
                  : 'Haz clic para subir archivo'}
              </span>
            </label>
            {uploadedDocs[field.id] &&
              (() => {
                const files = uploadedDocs[field.id]
                if (!files) return null
                const fileArray = Array.from(files)
                return (
                  <div className="mt-2 space-y-1">
                    {fileArray.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText size={14} />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
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

  const steps = [
    { number: 1, title: 'Identificación de Perfil', description: 'Selecciona tu tipo de perfil' },
    { number: 2, title: 'Información y Documentos', description: 'Completa tus datos personales' },
    { number: 3, title: 'Seguridad del Contrato', description: 'Elige tu tipo de garantía' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitud de Arrendamiento</h1>
          <p className="text-gray-600">Completa los siguientes pasos para enviar tu solicitud</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all duration-300 ${
                    activeStep > step.number
                      ? 'bg-green-500 text-white'
                      : activeStep === step.number
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {activeStep > step.number ? <CheckCircle2 size={24} /> : step.number}
                </div>
                <div className="text-center hidden md:block">
                  <p
                    className={`text-sm font-semibold ${
                      activeStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Paso {activeStep} de 3</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-gray-900">{steps[activeStep - 1].title}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${(activeStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Summary Sidebar for completed steps */}
        {activeStep > 1 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle2 size={20} />
              Resumen de tu solicitud
            </h3>
            <div className="space-y-2 text-sm">
              {selectedProfile && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{profiles[selectedProfile].emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900">{profiles[selectedProfile].name}</p>
                  </div>
                </div>
              )}
              {activeStep > 2 && applicantInfo.fullName && (
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-gray-700">
                    <span className="font-medium">Solicitante:</span> {applicantInfo.fullName}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* PASO 1: Identificación de Perfil */}
          {activeStep === 1 && (
            <div className="p-8 animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cuál es tu perfil?</h2>
                <p className="text-gray-600">
                  Selecciona el perfil que mejor describe tu situación laboral actual
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profiles).map(([key, profile]) => (
                  <button
                    key={key}
                    onClick={() => {
                      handleSelectProfile(key as ProfileId)
                    }}
                    className={`p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105 ${
                      selectedProfile === key
                        ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{profile.emoji}</span>
                      <div>
                        <span className="font-bold text-lg text-gray-900 block">{profile.name}</span>
                      </div>
                    </div>
                    {selectedProfile === key && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                          <CheckCircle2 size={16} />
                          <span>Perfil seleccionado</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* PASO 2: Información y Documentos */}
          {activeStep === 2 && (
            <div className="p-8 animate-fadeIn">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Información y Documentos</h2>
                  <p className="text-gray-600">Completa tus datos y sube los documentos requeridos</p>
                </div>
                <button
                  onClick={fillMockDataStep2}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md text-sm"
                >
                  <Zap size={16} />
                  <span>Datos de prueba</span>
                </button>
              </div>

              {/* Información Básica */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                  <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">
                      Nombre completo <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={applicantInfo.fullName}
                      onChange={(e) => setApplicantInfo({ ...applicantInfo, fullName: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+57 300 000 0000"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">
                      {applicantInfo.documentType === 'pasaporte' ? 'Pasaporte' : 'Cédula'}{' '}
                      <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={applicantInfo.documentNumber}
                      onChange={(e) => setApplicantInfo({ ...applicantInfo, documentNumber: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={applicantInfo.documentType === 'pasaporte' ? 'AA1234567' : '1234567890'}
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">
                      Ingreso mensual (COP) <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="number"
                      value={applicantInfo.monthlyIncome}
                      onChange={(e) => setApplicantInfo({ ...applicantInfo, monthlyIncome: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5,000,000"
                    />
                  </label>
                </div>
              </div>

              {/* Documentos */}
              {selectedProfile && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    Documentos Requeridos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    {profiles[selectedProfile].fields.map((field) => renderField(field))}
                  </div>
                </div>
              )}

              {/* Confirmación de depósito */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  Confirmación de Depósito
                </h4>
                <p className="text-gray-700 mb-4">
                  El depósito mínimo requerido es de{' '}
                  <strong className="text-yellow-800 text-lg">
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
                    Acepto y estoy de acuerdo con el depósito mínimo requerido
                  </span>
                </label>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  <ArrowLeft size={20} />
                  <span>Atrás</span>
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  disabled={!canProceedToStep3}
                  className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                    canProceedToStep3
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>Continuar</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Seguridad del Contrato */}
          {activeStep === 3 && (
            <div className="p-8 animate-fadeIn">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Seguridad del Contrato</h2>
                  <p className="text-gray-600">Selecciona tu opción de garantía preferida</p>
                </div>
                {selectedSecurity && (
                  <button
                    onClick={fillMockDataStep3}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md text-sm"
                  >
                    <Zap size={16} />
                    <span>Datos de prueba</span>
                  </button>
                )}
              </div>

              {/* Opciones de garantía */}
              <div className="space-y-4 mb-8">
                {securityOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border-2 rounded-xl transition-all ${
                      selectedSecurity === option.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedSecurity(selectedSecurity === option.id ? '' : option.id)}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-xl mb-1">{option.name}</h4>
                          <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                          <p className="text-blue-700 text-sm font-medium flex items-center gap-1">
                            <span>📊</span>
                            {option.requirements}
                          </p>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-all ${
                            selectedSecurity === option.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                          }`}
                        >
                          {selectedSecurity === option.id && <Check size={18} className="text-white" />}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulario de documentos */}
              {selectedSecurity && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Documentos de {securityOptions.find((opt) => opt.id === selectedSecurity)?.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {securityOptions
                      .find((opt) => opt.id === selectedSecurity)
                      ?.fields.map((field) => renderField(field))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  <ArrowLeft size={20} />
                  <span>Atrás</span>
                </button>
                <button
                  disabled={!selectedSecurity}
                  className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                    selectedSecurity
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 size={20} />
                  <span>Enviar Solicitud</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ApplicationForm
