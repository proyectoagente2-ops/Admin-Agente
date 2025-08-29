'use client'

import { login } from './actions'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(searchParams.get('error') || null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await login(formData)
      if (result && !result.success && result.error) {
        setError(result.error)
      }
    } catch (e) {
      setError('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 py-2">
      <form 
        action={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold">Admin Login</h1>
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isLoading}
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`mt-4 rounded-md px-4 py-2 text-white focus:outline-none ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          {isLoading ? 'Iniciando sesión...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
