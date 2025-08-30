'use server'

import { createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteDocument(docId: string) {
  const supabase = await createServerClient() as import('@supabase/supabase-js').SupabaseClient

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Primero obtener el documento para tener su file_path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', docId)
      .single()

    if (fetchError) {
      return { error: 'Error al obtener el documento' }
    }

    if (!document) {
      return { error: 'Documento no encontrado' }
    }

    // Eliminar el archivo del storage
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([document.file_path])

    if (storageError) {
      return { error: 'Error al eliminar el archivo' }
    }

    // Eliminar el registro de la base de datos
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .select()

    if (deleteError) {
      return { error: 'Error al eliminar el documento' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { error: 'Error al eliminar el documento' }
  }
}

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
  const tags = (formData.get('tags') as string)
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
  const file = formData.get('file') as File

  // Validaciones
  if (!flow || !title || !description || !code || !version || !file) {
    return { error: 'Todos los campos son requeridos' }
  }

  // Validar extensión de archivo permitida
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = ['pdf', 'doc', 'docx']
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    return { error: 'Tipo de archivo no permitido. Use PDF o DOC/DOCX' }
  }

  // Subir archivo a Storage
  const fileName = `${code}-v${version}.${fileExt}`
  const filePath = `${flow}/${fileName}`

  // Verificar si ya existe el documento
  const { data: existingDoc } = await supabase
    .from('documents')
    .select('id')
    .eq('code', code)
    .eq('version', version)
    .single()

  if (existingDoc) {
    return { error: 'Ya existe un documento con el mismo código y versión' }
  }

  // Subir archivo
  const { error: uploadError, data: uploadData } = await supabase
    .storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('Error al subir archivo:', {
      código: uploadError.message,
      detalles: uploadError.message
    })
    return { error: 'No se pudo subir el archivo. Por favor, intente nuevamente' }
  }

  // Validar que el flow sea válido
  if (!['aprendiz', 'instructor', 'administrativo'].includes(flow)) {
    return { error: 'Tipo de flujo inválido. Debe ser: aprendiz, instructor o administrativo' }
  }

  // Crear registro en la base de datos
  const { error: dbError, data: document } = await supabase
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
      file_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${filePath}`
    })
    .select()
    .single()

  if (dbError) {
    // Si hay error, eliminar el archivo subido
    const { error: removeError } = await supabase.storage
      .from('documents')
      .remove([filePath])
    
    if (removeError) {
      console.error('Error al limpiar archivo:', removeError)
    }

    if (dbError.code === '23505') {
      return { error: 'Ya existe un documento con el mismo código y versión' }
    }

    console.error('Error al guardar documento:', {
      código: dbError.code,
      mensaje: dbError.message,
      detalles: dbError.details,
      sugerencia: dbError.hint
    })
    return { error: 'No se pudo guardar el documento. Por favor, intente nuevamente' }
  }

  // Revalidar el cache y redireccionar
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
