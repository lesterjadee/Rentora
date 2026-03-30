import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-[#26619C]">Rentora</h1>
        <p className="text-xl text-gray-400">Student Item Rental Hub</p>
        <p className="text-gray-500 max-w-md mx-auto">
          Rent, lend, and manage academic items with your fellow students.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          {user ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}