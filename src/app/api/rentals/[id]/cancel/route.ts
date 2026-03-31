import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))

  await supabase
    .from('rentals')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('renter_id', user.id)

  return NextResponse.redirect(new URL(`/rentals/${id}`, request.url))
}