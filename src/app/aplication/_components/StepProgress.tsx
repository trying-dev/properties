'use client'

import { CheckCircle2 } from 'lucide-react'

export const steps = [
  { number: 1, title: 'Identificación de Perfil', description: 'Selecciona tu tipo de perfil' },
  { number: 2, title: 'Información y Documentos', description: 'Completa tus datos personales' },
  { number: 3, title: 'Seguridad del Contrato', description: 'Elige tu tipo de garantía' },
] as const

const StepProgress = ({ activeStep }: { activeStep: number }) => (
  <>
    <div className="mb-12">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

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

    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Paso {activeStep} de 3</span>
        <span className="text-gray-300">•</span>
        <span className="font-semibold text-gray-900">{steps[activeStep - 1]?.title}</span>
      </div>
      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(activeStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  </>
)

export default StepProgress
