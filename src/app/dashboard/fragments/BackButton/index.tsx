'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function BackButton() {
  return (
    <Link className="text-[0px]" href={`/dashboard`}>
      <Image src="/icons/arrow-left.svg" alt="plus" width={30} height={30} className="bg-[#D9D9D9] p-1 rounded-full fill-white" />
      Volver Atrás
    </Link>
  )
}
