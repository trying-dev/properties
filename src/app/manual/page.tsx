import type { Metadata } from 'next'

import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { MANUAL_CODE, MANUAL_TITLE, MANUAL_VERSION, getManualGroups, type ManualBlock } from '+/lib/manual'
import ManualAcceptPanel from './ManualAcceptPanel'

export const metadata: Metadata = {
  title: `${MANUAL_TITLE} | Properties`,
}

const renderBlock = (block: ManualBlock, key: number) => {
  switch (block.type) {
    case 'titulo':
      return (
        <h3 key={key} className="mt-10 text-xl font-bold text-gray-900">
          {block.text.replace(' · ', ': ')}
        </h3>
      )
    case 'capitulo':
      return (
        <h4 key={key} className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {block.text.replace(' · ', ': ')}
        </h4>
      )
    case 'seccion':
      return (
        <h3 key={key} className="mt-10 text-xl font-bold text-gray-900">
          {block.text}
        </h3>
      )
    case 'articulo':
      return (
        <h5 key={key} className="mt-6 text-base font-semibold text-gray-900">
          {block.text}
        </h5>
      )
    case 'letra':
      return (
        <p key={key} className="mt-6 border-b border-gray-200 pb-1 text-lg font-bold text-gray-900">
          {block.text}
        </p>
      )
    case 'term':
      return (
        <p key={key} className="mt-3 font-semibold text-gray-900">
          {block.text}
        </p>
      )
    case 'li':
      return (
        <li key={key} className="ml-5 list-disc text-gray-700">
          {block.text}
        </li>
      )
    default:
      return (
        <p key={key} className="mt-2 leading-relaxed text-gray-700">
          {block.text}
        </p>
      )
  }
}

export default function ManualPage() {
  const groups = getManualGroups()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          {MANUAL_CODE} · Versión {MANUAL_VERSION}
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900">{MANUAL_TITLE}</h1>

        <div className="mt-8">
          <ManualAcceptPanel version={MANUAL_VERSION} />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[16rem_1fr]">
          <nav className="lg:sticky lg:top-6 lg:self-start">
            <p className="mb-3 text-sm font-semibold text-gray-900">Contenido</p>
            <ul className="space-y-2 text-sm">
              {groups.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="text-gray-600 hover:text-gray-900">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <article>
            {groups.map((g) => (
              <section key={g.id} id={g.id} className="scroll-mt-6 border-t border-gray-200 pt-8 first:border-t-0 first:pt-0 mb-12">
                <h2 className="text-2xl font-bold text-gray-900">{g.title}</h2>
                {g.blocks.map((b, i) => renderBlock(b, i))}
              </section>
            ))}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
