// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#ADEBB3]/60 bg-white/70 shadow-sm shadow-[#ADEBB3]/45">
          <Image
            src="/itrack-logo.png"
            alt="iTrack"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">iTrack</h1>
        <p className="text-xl text-gray-600 mb-8">VSU Maintenance Request System</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}
