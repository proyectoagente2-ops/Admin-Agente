import { createServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { SearchBar } from '@/components/ui/SearchBar'
import { DocumentList } from '@/components/ui/DocumentList'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { q?: string; flow?: 'aprendiz' | 'instructor' | 'administrativo' }
}) {
  const supabase = await createServerClient() as import('@supabase/supabase-js').SupabaseClient

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

  // Buscar documentos para la lista
  // Iniciar la consulta base
  let queryBuilder = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  // Manejar los parámetros de búsqueda de forma segura
  type FlowType = 'aprendiz' | 'instructor' | 'administrativo'
  const params = await Promise.resolve(searchParams)
  const flowParam = params.flow as FlowType | undefined
  const searchQuery = params.q

  // Aplicar filtro por flujo si existe y es válido
  if (flowParam && ['aprendiz', 'instructor', 'administrativo'].includes(flowParam)) {
    queryBuilder = queryBuilder.eq('flow', flowParam)
  }

  // Aplicar búsqueda de texto si existe
  if (searchQuery && typeof searchQuery === 'string') {
    queryBuilder = queryBuilder.textSearch('search_vector', searchQuery)
  } else if (!flowParam) {
    // Limitar resultados solo si no hay filtros
    queryBuilder = queryBuilder.limit(10)
  }

  // Ejecutar la consulta
  const { data: documents = [] } = await queryBuilder

  // La variable documents ya está definida y asignada

  return (
    <div className="flex min-h-screen flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 focus:outline-none"
          >
            Sign out
          </button>
        </form>
      </header>
      <main className="flex-1">
        <div className="mb-8">
          <p className="text-xl">Bienvenido, {adminUser.email}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Aprendices */}
          <a href={`/dashboard?flow=aprendiz`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">👥</div>
                  <div className="text-2xl font-bold text-blue-600">{documentCounts.aprendiz}</div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Aprendices</h2>
                <p className="text-gray-600">Documentos para aprendices</p>
              </div>
            </Card>
          </a>

          {/* Instructores */}
          <a href={`/dashboard?flow=instructor`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">👨‍🏫</div>
                  <div className="text-2xl font-bold text-green-600">{documentCounts.instructor}</div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Instructores</h2>
                <p className="text-gray-600">Documentos para instructores</p>
              </div>
            </Card>
          </a>

          {/* Administrativos */}
          <a href={`/dashboard?flow=administrativo`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">👔</div>
                  <div className="text-2xl font-bold text-purple-600">{documentCounts.administrativo}</div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Administrativos</h2>
                <p className="text-gray-600">Documentos administrativos</p>
              </div>
            </Card>
          </a>
        </div>

        {/* Sección de Documentos */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Documentos</h2>
            <form action="/dashboard/documents/new">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Nuevo Documento
              </button>
            </form>
          </div>
          
          <SearchBar />
          
          <DocumentList documents={documents || []} />
        </div>
      </main>
    </div>
  )
}
