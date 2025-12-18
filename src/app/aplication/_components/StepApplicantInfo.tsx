'use client'

import { Dispatch, ReactNode, SetStateAction } from 'react'

import { ArrowLeft, ArrowRight, Zap } from 'lucide-react'

import { profiles } from '../_/profiles'
import { ApplicantInfo, Field, ProfileId } from '../_/types'

type StepApplicantInfoProps = {
  applicantInfo: ApplicantInfo
  selectedProfile: ProfileId | ''
  renderField: (field: Field) => ReactNode
  onApplicantInfoChange: (field: keyof ApplicantInfo, value: string) => void
  fillMockDataStep2: () => void
  acceptedDeposit: boolean
  setAcceptedDeposit: Dispatch<SetStateAction<boolean>>
  canProceedToStep3: boolean
  onBack: () => void
  onNext: () => void
}

const StepApplicantInfo = ({
  applicantInfo,
  selectedProfile,
  renderField,
  fillMockDataStep2,
  acceptedDeposit,
  setAcceptedDeposit,
  canProceedToStep3,
  onBack,
  onNext,
  onApplicantInfoChange,
}: StepApplicantInfoProps) => (
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
            onChange={(e) => onApplicantInfoChange('fullName', e.target.value)}
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
            onChange={(e) => onApplicantInfoChange('email', e.target.value)}
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
            onChange={(e) => onApplicantInfoChange('phone', e.target.value)}
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
            onChange={(e) => onApplicantInfoChange('documentNumber', e.target.value)}
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
            onChange={(e) => onApplicantInfoChange('monthlyIncome', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5,000,000"
          />
        </label>
      </div>
    </div>

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
        <span className="text-gray-700">Acepto y estoy de acuerdo con el depósito mínimo requerido</span>
      </label>
    </div>

    <div className="flex justify-between">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
      >
        <ArrowLeft size={20} />
        <span>Atrás</span>
      </button>
      <button
        onClick={onNext}
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
)

export default StepApplicantInfo
