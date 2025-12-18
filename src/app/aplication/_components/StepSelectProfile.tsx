'use client'

import { CheckCircle2 } from 'lucide-react'

import { useDispatch, useSelector } from '+/redux'
import { setProcessState } from '+/redux/slices/process'

import { profiles } from '../_/profiles'
import { ProfileId } from '../_/types'
import { updateProfileAplication } from '+/actions/user'
import { useRouter } from 'next/navigation'
import { updateTenantProfile } from '+/redux/slices/user'

const StepSelectProfile = () => {
  const dispatch = useDispatch()
  const router = useRouter()

  const { applicationProfile, tenantId } = useSelector((state) => state.process)

  const updateProfile = ({ applicationProfile }: { applicationProfile: ProfileId }) => {
    if (!tenantId) {
      console.error('No hay tenantId')
      return
    }
    dispatch(setProcessState({ applicationProfile }))
    updateProfileAplication({ tenantId, data: { applicationProfile } })
    dispatch(updateTenantProfile(applicationProfile))
    router.push('/aplication/information')
  }

  return (
    <div className="p-8 animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cuál es tu perfil?</h2>
        <p className="text-gray-600">Selecciona el perfil que mejor describe tu situación laboral actual</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(profiles).map(([key, profile]) => (
          <button
            key={key}
            onClick={() => updateProfile({ applicationProfile: key as ProfileId })}
            className={`p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105 ${
              applicationProfile === key
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
            {applicationProfile === key && (
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
  )
}

export default StepSelectProfile
