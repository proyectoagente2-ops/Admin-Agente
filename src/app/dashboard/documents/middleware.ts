import { createServerClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function middleware() {
  const supabase = await createServerClient() as import('@supabase/supabase-js').SupabaseClient
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar si es admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .single()

  if (!adminUser) {
    redirect('/login')
  }

  return NextResponse.next()
}
