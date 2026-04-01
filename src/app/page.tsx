import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: itemCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: rentalCount } = await supabase
    .from('rentals')
    .select('*', { count: 'exact', head: true })

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#26619C]/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#26619C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#26619C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-[#26619C]/10 border border-[#26619C]/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Gordon College Student Platform</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Rentora</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto">
            The smart way to rent and lend academic items
          </p>

          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Connect with fellow Gordon College students to rent calculators, books, lab equipment and more — all in one trusted platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {user ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#26619C]/25 hover:-translate-y-0.5"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#26619C]/25 hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth/login"
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 border border-gray-700 hover:border-[#26619C]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#26619C]">{itemCount || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Items Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#26619C]">{userCount || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Students</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#26619C]">{rentalCount || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Rentals Made</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-4">
          Everything you need to rent smarter
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Built specifically for Gordon College students with safety and trust in mind.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔐',
              title: 'Verified Students Only',
              desc: 'Only @gordoncollege.edu.ph emails allowed. Your community stays safe.'
            },
            {
              icon: '⭐',
              title: 'Trust Score System',
              desc: 'Rate your experience after every rental. Build your reputation on campus.'
            },
            {
              icon: '🎯',
              title: 'Smart Recommendations',
              desc: 'Get personalized item suggestions based on your rental history.'
            },
            {
              icon: '🔔',
              title: 'Real-time Notifications',
              desc: 'Get instant updates when your rental is approved, declined or completed.'
            },
            {
              icon: '📷',
              title: 'Photo Listings',
              desc: 'Upload photos of your items so renters know exactly what they\'re getting.'
            },
            {
              icon: '📅',
              title: 'Smart Booking',
              desc: 'Automatic date validation prevents double bookings and conflicts.'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-[#26619C]/50 transition-all duration-200 card-hover"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-[#26619C]/20 to-gray-900 rounded-3xl border border-[#26619C]/20 p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start renting?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Join your fellow Gordon College students on Rentora today.
          </p>
          {!user && (
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#26619C]/25 hover:-translate-y-0.5"
            >
              Create Your Account →
            </Link>
          )}
          {user && (
            <Link
              href="/items"
              className="inline-block px-8 py-4 bg-[#26619C] hover:bg-[#1e4f82] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#26619C]/25 hover:-translate-y-0.5"
            >
              Browse Items →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Rentora — Built for Gordon College Students</p>
        <p className="mt-2 text-gray-600">Made with ❤️ by Lester Jade Lobos</p>
      </footer>

    </main>
  )
}