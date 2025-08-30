'use server'

import { createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type LoginResult = {
  success: boolean;
  error?: string;
}

export async function login(formData: FormData): Promise<LoginResult> {
  try {
    const supabase = await createServerClient()
    
    let validatedData;
    try {
      validatedData = loginSchema.parse({
        email: formData.get('email'),
        password: formData.get('password'),
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.issues)
        return {
          success: false,
          error: 'Datos inválidos. El correo debe ser válido y la contraseña debe tener al menos 6 caracteres.'
        }
      }
      throw error
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(validatedData)

    if (authError) {
      console.error('Auth error:', authError)
      return {
        success: false,
        error: 'Correo o contraseña incorrectos'
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'No se pudo iniciar sesión'
      }
    }

    // Verificar si el usuario es admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (adminError || !adminUser) {
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'No tienes permisos de administrador'
      }
    }

    // Si todo está bien, revalidamos; la navegación la maneja el cliente
    revalidatePath('/', 'layout')
    return {
      success: true
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Ocurrió un error inesperado'
    }
  }
}
