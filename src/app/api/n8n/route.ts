import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Manejar preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json()

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    // Obtener el documento
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'No se pudo encontrar el documento' },
        { status: 404 }
      )
    }

    // Obtener URL firmada para el documento
    const { data: signedUrlData, error: signedURLError } = await supabase
      .storage
      .from('documents')
      .createSignedUrl(document.file_path, 3600) // URL válida por 1 hora

    if (signedURLError) {
      return NextResponse.json(
        { error: 'Error al generar la URL del documento' },
        { status: 500 }
      )
    }

    // Enviar al webhook de n8n
    if (!process.env.N8N_WEBHOOK_URL) {
      throw new Error('N8N_WEBHOOK_URL no está configurada en las variables de entorno')
    }

    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Admin-Agente-Server',
        'Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        id: document.id,
        title: document.title,
        description: document.description,
        flow: document.flow,
        file_path: document.file_path,
        document_url: signedUrlData.signedUrl,
        created_at: document.created_at,
        created_by: document.created_by,
        version: document.version,
        metadata: {
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          source: 'Admin-Agente'
        }
      }),
      // Añadir estas opciones para mejorar la gestión de la petición
      cache: 'no-cache',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      mode: 'cors',
      credentials: 'include'
    })

    if (!response.ok) {
      let errorMessage = 'Error al enviar al flujo de n8n'
      try {
        const errorData = await response.json()
        console.error('Error from n8n:', errorData)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        const errorText = await response.text()
        console.error('Error from n8n (text):', errorText)
      }
      
      // Log detallado para debugging
      console.error('n8n request details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      })
      
      return NextResponse.json(
        { 
          error: errorMessage,
          status: response.status,
          timestamp: new Date().toISOString()
        },
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
    }

    // Actualizar el estado del documento para marcar que fue enviado a n8n
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        processed_by_n8n: true
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating document:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar el estado del documento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Documento enviado exitosamente a n8n',
      n8n_status: true,
      n8n_sent_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in n8n route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
