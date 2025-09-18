import { createServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SearchBar } from '@/components/ui/SearchBar'
import { DocumentList } from '@/components/ui/DocumentList'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { FocusCards } from '@/components/ui/focus-cards'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { q?: string; flow?: 'aprendiz' | 'instructor' | 'administrativo' }
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Verificar si es admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .single()

  if (!adminUser) {
    redirect('/login')
  }

  // Obtener conteo de documentos por flujo
  const documentCounts = {
    aprendiz: 0,
    instructor: 0,
    administrativo: 0
  }

  const promises = Object.keys(documentCounts).map(async (flow) => {
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('flow', flow)
    
    return { flow, count: count || 0 }
  })

  const counts = await Promise.all(promises)
  
  counts.forEach(({ flow, count }) => {
    documentCounts[flow as keyof typeof documentCounts] = count
  })

  // Buscar documentos
  let queryBuilder = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  // Manejar los parámetros de búsqueda
  type FlowType = 'aprendiz' | 'instructor' | 'administrativo'
  const params = await Promise.resolve(searchParams)
  const flowParam = params.flow as FlowType | undefined
  const searchQuery = params.q

  if (flowParam && ['aprendiz', 'instructor', 'administrativo'].includes(flowParam)) {
    queryBuilder = queryBuilder.eq('flow', flowParam)
  }

  if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
    // Buscar en título y descripción
    const searchTerm = searchQuery.trim().toLowerCase()
    queryBuilder = queryBuilder
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  }

  // Siempre limitar los resultados para mejor rendimiento
  queryBuilder = queryBuilder.limit(20)

  const { data: documents = [], error } = await queryBuilder

  if (error) {
    console.error('Error al buscar documentos:', error)
  }

  // Configuración de las tarjetas de resumen
  const cardItems = [
    {
      title: "Aprendices",
      description: "Documentos para aprendices",
      value: documentCounts.aprendiz,
      icon: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7" />
        </svg>
      ),
      href: "/dashboard?flow=aprendiz"
    },
    {
      title: "Instructores",
      description: "Documentos para instructores",
      value: documentCounts.instructor,
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      href: "/dashboard?flow=instructor"
    },
    {
      title: "Administrativos",
      description: "Documentos administrativos",
      value: documentCounts.administrativo,
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: "/dashboard?flow=administrativo"
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_#2563eb10_0%,_#0000_50%)] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_#2563eb20_0%,_#0000_50%)] opacity-40" />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
          <div className="text-center md:text-left animate-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 via-blue-600 to-blue-700">
              Panel de Control
            </h1>
            <p className="mt-3 text-lg text-blue-600 font-medium tracking-wide">
              Bienvenido, {adminUser.email}
            </p>
            <div className="mt-4 h-1 w-32 mx-auto md:mx-0 bg-gradient-to-r from-[#2563eb] to-blue-400 rounded-full"></div>
          </div>
          <form action="/auth/signout" method="post" className="animate-in slide-in-from-right duration-700">
            <button
              type="submit"
              className="rounded-xl bg-white px-6 py-3 text-blue-600 font-medium
                border border-blue-100 shadow-lg shadow-blue-100/50
                hover:shadow-blue-500/20 hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white
                focus:outline-none focus:ring-2 focus:ring-blue-500/40
                transition-all duration-300 ease-out transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </span>
            </button>
          </form>
        </div>

        <div className="space-y-12">
          {/* Tarjetas de Resumen */}
          <div className="animate-in slide-in-from-bottom-5 duration-1000">
            <FocusCards 
              items={cardItems} 
              className="gap-6 md:gap-8"
            />
          </div>

          {/* Botón de Nuevo Documento */}
          <div className="flex justify-center md:justify-end animate-in fade-in duration-700 delay-300">
            <Link
              href="/dashboard/documents/new"
              className="group relative inline-flex items-center px-6 py-3 rounded-xl font-medium text-white
                bg-gradient-to-br from-[#2563eb] via-blue-600 to-blue-700
                hover:from-blue-600 hover:via-blue-700 hover:to-blue-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40
                transform hover:scale-105 transition-all duration-300 ease-out"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 
                group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
              <svg className="w-5 h-5 mr-2 transform group-hover:rotate-180 transition-transform duration-500" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="relative">Nuevo Documento</span>
            </Link>
          </div>

          {/* Lista de Documentos con Efecto de Fondo */}
          <div className="animate-in slide-in-from-bottom duration-1000 delay-500">
            <div className="relative p-8 rounded-2xl overflow-hidden
              bg-gradient-to-br from-[#2563eb] via-blue-500 to-blue-600">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.3))]" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10" />
              
              <div className="relative z-10 space-y-8 flex flex-col items-center justify-center w-full">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-4xl font-bold font-inter tracking-tight
                    bg-clip-text text-transparent bg-gradient-to-r 
                    from-white via-white to-blue-50
                    px-4 py-2">
                    Documentos
                  </h2>
                  <div className="mt-3 h-1 w-32 mx-auto bg-gradient-to-r 
                    from-[#2563eb] via-[#2563eb]/70 to-[#52606d] rounded-full"></div>
                </div>
                
                <div className="bg-white/90 p-6 rounded-xl backdrop-blur-sm 
                  shadow-lg ring-1 ring-blue-100
                  hover:shadow-blue-500/20 transition-all duration-300
                  w-full max-w-4xl mx-auto">
                  <SearchBar />
                </div>
                
                <div className="bg-white/95 rounded-xl backdrop-blur-sm 
                  shadow-xl ring-1 ring-blue-100
                  hover:shadow-blue-500/20 transition-all duration-300
                  w-full">
                  <DocumentList documents={documents || []} />
                </div>
              </div>
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#52606d]/30 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9fb3c8]/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
