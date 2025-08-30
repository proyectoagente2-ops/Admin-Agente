'use server'

import { createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createDocument(formData: FormData) {
  const supabase = await createServerClient() as import('@supabase/supabase-js').SupabaseClient

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Obtener datos del formulario
  const flow = formData.get('flow') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const code = formData.get('code') as string
  const version = formData.get('version') as string
  const tags = (formData.get('tags') as string || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
  const file = formData.get('file') as File

  try {
    // Validaciones
    if (!flow || !title || !description || !code || !version || !file) {
      throw new Error('Todos los campos son requeridos')
    }

    // Subir archivo a Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${code}-v${version}.${fileExt}`
    const filePath = `${flow}/${fileName}`

    // Convertir el archivo a un Buffer para subirlo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError, data: fileData } = await supabase
      .storage
      .from('documents')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Error al subir archivo:', uploadError)
      throw new Error('Error al subir el archivo')
    }

    // Crear registro en la base de datos
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        code,
        version,
        flow,
        file_path: filePath,
        file_name: fileName,
        tags,
        created_by: user.id,
        updated_by: user.id,
        user_id: user.id, // Campo necesario para RLS
      })

    if (dbError) {
      // Si hay error, intentar eliminar el archivo subido
      await supabase.storage.from('documents').remove([filePath])
      throw new Error('Error al guardar el documento')
    }

    // Revalidar el cache de la página del dashboard
    revalidatePath('/dashboard')
    
    // Redireccionar al dashboard
    redirect('/dashboard')
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
