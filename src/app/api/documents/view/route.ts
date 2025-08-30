import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createServerClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const formData = await request.formData()
    const path = formData.get('path') as string

    if (!path) {
      return new NextResponse('Bad Request - Missing path', { status: 400 })
    }

    const { data, error } = await supabase
      .storage
      .from('documents')
      .createSignedUrl(path, 3600) // URL válida por 1 hora

    if (error) {
      console.error('Error generando URL firmada:', error)
      return new NextResponse('Error al acceder al documento', { status: 500 })
    }

    // Redirigir al usuario a la URL firmada
    return NextResponse.redirect(data.signedUrl)
  } catch (error) {
    console.error('Error en la ruta de visualización:', error)
    return new NextResponse('Error interno del servidor', { status: 500 })
  }
}
