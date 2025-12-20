'use client'

import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useDispatch, useSelector } from '+/redux'
import { setProcessState } from '+/redux/slices/process'
import { updateTenantProfile } from '+/redux/slices/user'
import type { Profile as PrismaProfile } from '@prisma/client'

import { updateTenantProfile as updateTenantProfileAction } from '+/actions/user'
import { profiles } from '+/app/aplication/_/profiles'
import { ProfileId } from '+/app/aplication/_/types'

const Profile = () => {
  const dispatch = useDispatch()
  const router = useRouter()

  const { profile, tenantId } = useSelector((state) => state.process)

  const updateProfile = ({ profile }: { profile: ProfileId }) => {
    if (!tenantId) {
      console.error('No hay tenantId')
      return
    }
    dispatch(setProcessState({ profile, step: 2 }))
    dispatch(updateTenantProfile(profile))
    void updateTenantProfileAction({ tenantId, data: { profile: profile as PrismaProfile } }).catch((error) => {
      console.error('Error actualizando el perfil del tenant:', error)
    })
    router.push('/aplication/basicInformation')
  }

  return (
    <div className="p-8 animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cuál es tu perfil?</h2>
        <p className="text-gray-600">Selecciona el perfil que mejor describe tu situación laboral actual</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(profiles).map(([key, profileObject]) => (
          <button
            key={key}
            onClick={() => updateProfile({ profile: key as ProfileId })}
            className={`p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105 ${
              profile === key
                ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{profileObject.emoji}</span>
              <div>
                <span className="font-bold text-lg text-gray-900 block">{profileObject.name}</span>
              </div>
            </div>
            {profile === key && (
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

export default Profile
