'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')

  // Actualizar el estado local cuando cambian los searchParams
  useEffect(() => {
    setSearchValue(searchParams.get('q') ?? '')
  }, [searchParams])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams()
      searchParams.forEach((val, key) => {
        params.set(key, val)
      })
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    
    // Solo actualizamos la URL si hay 2+ caracteres o está vacío
    if (newValue.trim().length >= 2 || newValue.trim().length === 0) {
      router.push(`/dashboard?${createQueryString('q', newValue)}`)
    }
  }

  const clearSearch = () => {
    setSearchValue('')
    router.push('/dashboard')
  }

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="h-6 w-6 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Buscar documentos..."
        className="w-full pl-12 pr-12 py-4 text-blue-900 bg-white shadow-xl backdrop-blur-sm 
          border border-white/50 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300
          shadow-lg group-hover:shadow-2xl
          transition-all duration-300 ease-out
          placeholder-blue-400/70 text-lg"
        value={searchValue}
        onChange={handleSearch}
      />
      {searchValue && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-400
            hover:text-blue-600 focus:text-blue-600 transition-colors duration-200"
        >
          <span className="sr-only">Limpiar búsqueda</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
