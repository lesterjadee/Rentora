'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!email.endsWith('@gordoncollege.edu.ph')) {
      setError('Only Gordon College students can register. Please use your @gordoncollege.edu.ph email.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, student_id: studentId }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Account created! Please check your email to confirm your registration.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[#26619C]/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gradient">
            Rentora
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Create account</h1>
          <p className="text-gray-400 mt-2">Join Rentora — Gordon College students only!</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
          {/* Domain Notice */}
          <div className="mb-5 p-3 bg-[#26619C]/10 border border-[#26619C]/30 rounded-xl flex items-center gap-2">
            <span>🎓</span>
            <p className="text-[#26619C] text-sm">
              Only <strong>@gordoncollege.edu.ph</strong> emails accepted
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
              ❌ {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
              ✅ {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Lester Jade Lobos"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-[#26619C] focus:ring-1 focus:ring-[#26619C]/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                placeholder="202411738"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-[#26619C] focus:ring-1 focus:ring-[#26619C]/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Institutional Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="202411738@gordoncollege.edu.ph"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-[#26619C] focus:ring-1 focus:ring-[#26619C]/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-[#26619C] focus:ring-1 focus:ring-[#26619C]/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#26619C]/25 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#26619C] hover:text-[#4a9edd] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}