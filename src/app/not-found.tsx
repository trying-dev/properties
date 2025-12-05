'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // router.push("/");
  }, [router])

  return <div className="h-[80vh] flex items-center justify-center text-2xl">Not found</div>
}
