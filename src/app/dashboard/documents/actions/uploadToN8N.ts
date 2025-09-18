'use server'

import { createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const N8N_WEBHOOK_URL = 'https://agenteia.app.n8n.cloud/webhook-test/d902c645-3446-4690-9ef7-40b861595a7e'

export async function uploadToN8N(documentData: {
  id: string
  title: string
  description: string
  code: string
  version: string
  flow: string
  file_path: string
  file_name: string
  created_at?: string
  created_by?: string
}) {
  const supabase = await createServerClient()

  try {
    // Obtener el archivo de Supabase Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download(documentData.file_path)

    if (downloadError) {
      console.error('Error al descargar el archivo:', downloadError)
      throw new Error('Error al obtener el archivo de Storage')
    }

    // Crear FormData para enviar al webhook
    const formData = new FormData()
    
    // Agregar el archivo
    formData.append('file', fileData, documentData.file_name)
    
    // Agregar los metadatos del documento
    formData.append('title', documentData.title)
    formData.append('description', documentData.description)
    formData.append('code', documentData.code)
    formData.append('version', documentData.version)
    formData.append('flow', documentData.flow)
    formData.append('documentId', documentData.id)
    if (documentData.created_at) {
      formData.append('created_at', documentData.created_at)
    }
    if (documentData.created_by) {
      formData.append('created_by', documentData.created_by)
    }

    // Enviar al webhook de n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    })

    // Verificar el tipo de contenido de la respuesta
    const contentType = response.headers.get('content-type')
    if (!response.ok) {
      let errorMessage = `Error al enviar a n8n: ${response.statusText}`
      try {
        // Intentar obtener más detalles del error
        if (contentType?.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } else {
          const textError = await response.text()
          errorMessage = `Error al enviar a n8n: ${response.status} ${response.statusText}`
          console.error('Respuesta no JSON:', textError)
        }
      } catch (parseError) {
        console.error('Error al parsear la respuesta:', parseError)
      }
      throw new Error(errorMessage)
    }

    // Verificar y procesar la respuesta
    let responseData
    try {
      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else {
        // Si no es JSON, convertimos la respuesta en un objeto
        const text = await response.text()
        responseData = { message: text }
      }
    } catch (parseError) {
      console.error('Error al parsear la respuesta:', parseError)
      throw new Error('Error al procesar la respuesta del servidor')
    }

    // Actualizar el estado del documento en Supabase
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        processed_by_n8n: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', documentData.id)

    if (updateError) {
      console.error('Error al actualizar estado del documento:', updateError)
      throw new Error('Error al actualizar el estado del documento')
    }

    revalidatePath('/dashboard')
    return { success: true }

  } catch (error) {
    console.error('Error en uploadToN8N:', error)
    return { 
      error: error instanceof Error ? error.message : 'Error al procesar el documento en n8n'
    }
  }
}
