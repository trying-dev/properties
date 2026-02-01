import type { NextConfig } from 'next'
import path from 'path'

const sassGlobalsPath = path.resolve(process.cwd(), 'src/styles/variables.scss').replace(/\\/g, '/')

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.resolve(process.cwd(), 'src/styles')],
    additionalData: `@use "${sassGlobalsPath}" as *;`,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

export default nextConfig
