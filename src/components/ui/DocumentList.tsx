'use client'

import type { Database } from '@/utils/types/database.types'
import { createClient } from '@/utils/supabase/client'
import { useState, useRef } from 'react'
import clsx from 'clsx'
import { deleteDocument } from '@/app/dashboard/documents/actions'
import { uploadToN8N } from '@/app/dashboard/documents/actions/uploadToN8N'

type Document = Database['public']['Tables']['documents']['Row']

export function DocumentList({ documents }: { documents: Document[] }) {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({})
  const [deleting, setDeleting] = useState<{[key: string]: boolean}>({})
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({})
  const [error, setError] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleDeleteClick = (docId: string) => {
    setSelectedDocId(docId)
    setShowPasswordModal(true)
    setError(null)
    setPassword('')
    // Focus el input de contraseña cuando se muestre el modal
    setTimeout(() => {
      passwordInputRef.current?.focus()
    }, 100)
  }

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const handleDelete = async () => {
    if (!selectedDocId) return
    
    try {
      setDeleting({...deleting, [selectedDocId]: true})
      
      // Verificar la contraseña del usuario
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: password,
      })

      if (signInError) {
        setError('La contraseña es incorrecta')
        setDeleting({...deleting, [selectedDocId]: false})
        return
      }

      // Obtener los datos del documento antes de eliminarlo
      const docToDelete = documents.find(d => d.id === selectedDocId)
      const result = await deleteDocument(selectedDocId)
      
      if (!result.error && docToDelete) {
        setSuccessMessage(`Documento eliminado con éxito:
          Título: ${docToDelete.title}
          Descripción: ${docToDelete.description}
          Flujo: ${docToDelete.flow}
          Código: ${docToDelete.code}
          Versión: ${docToDelete.version}`)
        setTimeout(() => setSuccessMessage(null), 5000)
      }
      
      if (result.error) {
        setError(result.error)
        setTimeout(() => setError(null), 3000)
      } else {
        setShowPasswordModal(false)
        setPassword('')
      }
    } catch (error) {
      setError('Error al eliminar el documento')
      setTimeout(() => setError(null), 3000)
    } finally {
      if (selectedDocId) {
        setDeleting({...deleting, [selectedDocId]: false})
      }
      setSelectedDocId(null)
    }
  }

  const handleView = async (docId: string) => {
    try {
      setLoading({...loading, [docId]: true})
      const { data, error } = await supabase
        .storage
        .from('documents')
        .download(documents.find(d => d.id === docId)?.file_path || '')
      
      if (error) {
        console.error('Error downloading file:', error)
        return
      }

      const url = URL.createObjectURL(data)
      window.open(url, '_blank')
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading({...loading, [docId]: false})
    }
  }

  const handleProcessN8N = async (docId: string) => {
    try {
      setProcessing({...processing, [docId]: true})
      const doc = documents.find(d => d.id === docId)
      if (!doc) return

      const result = await uploadToN8N(doc)
      
      if (result.error) {
        setError(result.error)
        setTimeout(() => setError(null), 3000)
      } else {
        setSuccessMessage(`Documento enviado exitosamente a n8n:
          Título: ${doc.title}
          Código: ${doc.code}
          Versión: ${doc.version}`)
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (error) {
      setError('Error al procesar el documento en n8n')
      setTimeout(() => setError(null), 3000)
    } finally {
      setProcessing({...processing, [docId]: false})
    }
  }

  const handleDownload = async (docId: string) => {
    try {
      setLoading({...loading, [`${docId}-download`]: true})
      const doc = documents.find(d => d.id === docId)
      if (!doc) return

      const { data, error } = await supabase
        .storage
        .from('documents')
        .download(doc.file_path)
      
      if (error) {
        console.error('Error downloading file:', error)
        return
      }

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading({...loading, [`${docId}-download`]: false})
    }
  }

  return (
    <div className="mt-6 animate-in fade-in duration-1000">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 whitespace-pre-line animate-in fade-in slide-in-from-top duration-300">
          {successMessage}
        </div>
      )}
      
      {/* Modal de contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-50 duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor, introduce tu contraseña para confirmar la eliminación del documento.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault()
              await handleDelete()
              setShowPasswordModal(false)
            }}>
              <input
                ref={passwordInputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Contraseña"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setSelectedDocId(null)
                    setPassword('')
                    setError(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!password || deleting[selectedDocId || '']}
                  className={clsx(
                    "px-4 py-2 text-sm font-medium text-white",
                    "bg-red-600 hover:bg-red-700 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-red-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {deleting[selectedDocId || ''] ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl border border-white/20">
            <thead className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90">
              <tr>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Documento
                  </span>
                </th>
                <th className="hidden md:table-cell px-6 py-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Código
                  </span>
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Versión
                  </span>
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Flujo
                  </span>
                </th>
                <th className="hidden md:table-cell px-6 py-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Fecha
                  </span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Acciones
                  </span>
                </th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-200/50 bg-white/50">
            {documents.map((doc) => (
              <tr 
                key={doc.id}
                className="group hover:bg-blue-50/80 transition-colors duration-300"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 flex-shrink-0">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-white 
                        shadow-lg ring-1 ring-blue-200/50 flex items-center justify-center text-blue-500
                        group-hover:shadow-blue-500/20 transition-all duration-300">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold text-blue-700 group-hover:text-blue-900 transition-colors duration-300 truncate">
                        {doc.title}
                      </div>
                      <div className="text-sm text-blue-500/70 mt-0.5 line-clamp-2">{doc.description}</div>
                      <div className="md:hidden mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <span>{doc.code}</span>
                        <span>•</span>
                        <span>v{doc.version}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {doc.code}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-6 py-4 text-center">
                  <span className="text-sm text-slate-600">v{doc.version}</span>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset shadow-sm",
                      {
                        "bg-emerald-50 text-emerald-700 ring-emerald-600/20": doc.flow === "aprendiz",
                        "bg-blue-50 text-blue-700 ring-blue-600/20": doc.flow === "instructor",
                        "bg-purple-50 text-purple-700 ring-purple-600/20": doc.flow === "administrativo",
                      }
                    )}
                  >
                    <svg 
                      viewBox="0 0 8 8" 
                      className={clsx(
                        "h-2 w-2",
                        {
                          "fill-emerald-500": doc.flow === "aprendiz",
                          "fill-blue-500": doc.flow === "instructor",
                          "fill-purple-500": doc.flow === "administrativo",
                        }
                      )}
                    >
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    {doc.flow}
                  </span>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-medium text-slate-600">
                    {new Date(doc.created_at!).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-end">
                    {/* Vista móvil - Menú desplegable */}
                    <div className="sm:hidden w-full">
                      <select
                        onChange={(e) => {
                          const action = e.target.value;
                          if (action === 'view') handleView(doc.id);
                          else if (action === 'download') handleDownload(doc.id);
                          else if (action === 'process') handleProcessN8N(doc.id);
                          else if (action === 'delete') handleDeleteClick(doc.id);
                          e.target.value = ''; // Reset después de la acción
                        }}
                        className="w-full rounded-lg border-gray-300 text-sm"
                        disabled={loading[doc.id] || loading[`${doc.id}-download`] || processing[doc.id] || deleting[doc.id]}
                      >
                        <option value="">Seleccionar acción</option>
                        <option value="view">Ver documento</option>
                        <option value="download">Descargar</option>
                        {!doc.processed_by_n8n && (
                          <option value="process">Procesar en n8n</option>
                        )}
                        <option value="delete">Eliminar</option>
                      </select>
                    </div>

                    {/* Vista desktop - Botones */}
                    <div className="hidden sm:flex items-center gap-2">
                      <button
                        onClick={() => handleView(doc.id)}
                        disabled={loading[doc.id]}
                        className={clsx(
                          "inline-flex items-center rounded-xl p-2",
                          "text-sm font-medium transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-offset-2",
                          "bg-gradient-to-br from-slate-50 to-white shadow-lg",
                          "text-slate-700 hover:text-slate-900",
                          "ring-1 ring-slate-200/50 hover:ring-slate-300/50",
                        "hover:shadow-emerald-500/20",
                        "focus:ring-emerald-500",
                        {
                          "opacity-50 cursor-not-allowed": loading[doc.id],
                        }
                      )}
                    >
                      <svg className="h-4 w-4 mr-2 text-blue-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {loading[doc.id] ? 'Cargando...' : 'Ver'}
                    </button>

                    <button
                      onClick={() => handleDownload(doc.id)}
                      disabled={loading[`${doc.id}-download`]}
                      className={clsx(
                        "inline-flex items-center rounded-xl px-3.5 py-2",
                        "text-sm font-medium transition-all duration-300",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2",
                        "bg-gradient-to-br from-emerald-50 to-white shadow-lg",
                        "text-emerald-700 hover:text-emerald-800",
                        "ring-1 ring-emerald-200/50 hover:ring-emerald-300/50",
                        "hover:shadow-emerald-500/20",
                        "focus:ring-emerald-500",
                        {
                          "opacity-50 cursor-not-allowed": loading[`${doc.id}-download`],
                        }
                      )}
                    >
                      <svg className="h-4 w-4 mr-2 text-emerald-500 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {loading[`${doc.id}-download`] ? 'Descargando...' : 'Descargar'}
                    </button>

                    {!doc.processed_by_n8n ? (
                      <button
                        onClick={() => handleProcessN8N(doc.id)}
                        disabled={processing[doc.id]}
                        className={clsx(
                          "inline-flex items-center rounded-xl px-3.5 py-2",
                          "text-sm font-medium transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-offset-2",
                          "bg-gradient-to-br from-purple-50 to-white shadow-lg",
                          "text-purple-700 hover:text-purple-800",
                          "ring-1 ring-purple-200/50 hover:ring-purple-300/50",
                          "hover:shadow-purple-500/20",
                          "focus:ring-purple-500",
                          {
                            "opacity-50 cursor-not-allowed": processing[doc.id],
                          }
                        )}
                        title="Procesar documento en n8n"
                      >
                        <svg className="h-4 w-4 mr-2 text-purple-500 group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8" />
                        </svg>
                        {processing[doc.id] ? 'Procesando...' : 'Procesar en n8n'}
                      </button>
                    ) : (
                      <span 
                        className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium bg-green-50 text-green-700 ring-1 ring-green-200/50"
                        title="Este documento ya ha sido procesado en n8n"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Procesado
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteClick(doc.id)}
                      disabled={deleting[doc.id]}
                      className={clsx(
                        "inline-flex items-center rounded-xl px-3.5 py-2",
                        "text-sm font-medium transition-all duration-300",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2",
                        "bg-gradient-to-br from-red-50 to-white shadow-lg",
                        "text-red-700 hover:text-red-800",
                        "ring-1 ring-red-200/50 hover:ring-red-300/50",
                        "hover:shadow-red-500/20",
                        "focus:ring-red-500",
                        {
                          "opacity-50 cursor-not-allowed": deleting[doc.id],
                        }
                      )}
                    >
                      <svg className="h-4 w-4 mr-2 text-red-500 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {deleting[doc.id] ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  )
}
