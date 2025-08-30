'use client'

import { login } from './actions'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(searchParams.get('error') || null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await login(formData)
  console.log('login result:', result)
      // Si hay error, lo mostramos
      if (result && !result.success && result.error) {
        setError(result.error)
      }
      // Si el login es exitoso, navegamos al dashboard desde el cliente
      if (result && result.success) {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form 
      action={handleSubmit}
      className="flex w-full max-w-md flex-col gap-6 rounded-xl p-8 
        bg-white/80 backdrop-blur-sm shadow-xl ring-1 ring-slate-200/50
        hover:shadow-[#2563eb]/10 transition-all duration-300"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-[#2563eb] to-slate-800">
          Panel Administrativo
        </h1>
        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[#2563eb] to-blue-400 rounded-full"></div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50/50 p-4 text-sm text-red-600 ring-1 ring-red-100
          backdrop-blur-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isLoading}
            className="block w-full rounded-xl border-slate-200 shadow-sm
              focus:border-[#2563eb] focus:ring-[#2563eb]/50
              hover:border-[#2563eb]/50 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            className="block w-full rounded-xl border-slate-200 shadow-sm
              focus:border-[#2563eb] focus:ring-[#2563eb]/50
              hover:border-[#2563eb]/50 transition-all duration-200"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full px-6 py-3 rounded-xl font-medium text-white
          bg-gradient-to-br from-[#2563eb] via-blue-600 to-blue-700
          hover:from-blue-600 hover:via-blue-700 hover:to-blue-800
          focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2
          shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40
          transform hover:scale-[1.02] transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 py-2
      bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 via-blue-500/5 to-slate-500/5" />
      
      <div className="relative z-10">
        <Suspense fallback={
          <div className="text-slate-600 animate-pulse">
            Cargando...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
