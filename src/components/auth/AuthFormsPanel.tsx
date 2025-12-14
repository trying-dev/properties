'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import LoginForm from '+/components/auth/LoginForm'
import RegisterForm from '+/components/auth/RegisterForm'
import { useDispatch, useSelector } from '+/redux'
import { setAuthModalOpen } from '+/redux/slices/auth'

export default function AuthFormsPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const shouldSync = pathname?.startsWith('/auth')
  const dispatch = useDispatch()
  const modalTab = useSelector((state) => state.auth.authModalTab)

  const queryTab = useMemo(
    () => (searchParams.get('tab') === 'register' ? 'register' : undefined),
    [searchParams]
  )

  const activeTab = shouldSync ? queryTab : undefined

  const currentTab = activeTab || modalTab || 'login'

  const updateTab = (tab: 'login' | 'register') => {
    if (shouldSync) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      const query = params.toString()
      router.replace(`${pathname}${query ? `?${query}` : ''}`)
      return
    }
    dispatch(setAuthModalOpen({ open: true, tab }))
  }

  return (
    <div className="p-12 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="flex mb-8 bg-gray-100 rounded-2xl p-1">
          <button
            onClick={() => updateTab('login')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              currentTab === 'login'
                ? 'bg-white text-teal-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => updateTab('register')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              currentTab === 'register'
                ? 'bg-white text-teal-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
        </div>

        {currentTab === 'login' && <LoginForm />}

        {currentTab === 'register' && <RegisterForm />}
      </div>
    </div>
  )
}
