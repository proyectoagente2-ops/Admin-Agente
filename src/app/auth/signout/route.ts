import { createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient() as import('@supabase/supabase-js').SupabaseClient

    // Check if we have a session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }

    revalidatePath('/', 'layout')
    return NextResponse.redirect(new URL('/login', req.url), {
      status: 302,
    })
  } catch (error) {
    console.error('Error signing out:', error)
    return new NextResponse('Error signing out', { status: 500 })
  }
}
