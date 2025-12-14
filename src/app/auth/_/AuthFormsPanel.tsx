'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import LoginForm from '+/app/auth/_/LoginForm'
import RegisterForm from '+/app/auth/_/RegisterForm'

export default function AuthFormsPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const shouldSync = pathname?.startsWith('/auth')

  const activeTab = useMemo(
    () => (shouldSync && searchParams.get('tab') === 'register' ? 'register' : undefined),
    [searchParams, shouldSync]
  )

  const [localTab, setLocalTab] = useState<'login' | 'register'>('login')

  const currentTab = activeTab || localTab

  const updateTab = (tab: 'login' | 'register') => {
    if (shouldSync) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      const query = params.toString()
      router.replace(`${pathname}${query ? `?${query}` : ''}`)
      return
    }
    setLocalTab(tab)
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
