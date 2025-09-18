import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/utils/types/database.types';

type DocumentStats = {
  totalVectorized: number;
  totalChunks: number;
  pendingCount: number;
  lastProcessed: {
    title: string;
    processed_at: string;
  } | null;
};

async function fetchStats(): Promise<DocumentStats> {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get total vectorized documents
  const { count: totalVectorized } = await supabase
    .from('documents1')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  // Get total chunks and calculate sum
  const { data: fragments } = await supabase
    .from('documents1')
    .select('chunks_count')
    .not('chunks_count', 'is', null);

  // Get pending documents count
  const { count: pendingCount } = await supabase
    .from('documents1')
    .select('*', { count: 'exact', head: true })
    .is('processed_by_n8n', false);

  // Get last processed document with title
  const { data: lastDoc } = await supabase
    .from('documents1')
    .select('processed_at, documents(title)')
    .not('processed_at', 'is', null)
    .order('processed_at', { ascending: false })
    .limit(1)
    .single();

  // Calculate total chunks
  const totalChunks = fragments?.reduce(
    (sum: number, doc: { chunks_count: number | null }) => 
      sum + (doc.chunks_count ?? 0),
    0
  ) ?? 0;

  return {
    totalVectorized: totalVectorized ?? 0,
    totalChunks,
    pendingCount: pendingCount ?? 0,
    lastProcessed: lastDoc?.processed_at ? {
      title: lastDoc.documents?.title ?? 'N/A',
      processed_at: lastDoc.processed_at,
    } : null,
  };
}

export async function VectorizedStats() {
  const stats = await fetchStats();

  return (
    <div className="grid grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-sm">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.totalVectorized}</div>
        <div className="text-sm text-gray-500">Vectorizados</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.totalChunks}</div>
        <div className="text-sm text-gray-500">Fragmentos</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.pendingCount}</div>
        <div className="text-sm text-gray-500">Pendientes</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-medium truncate">
          {stats.lastProcessed?.title && (
            <span title={stats.lastProcessed.title}>
              {stats.lastProcessed.title.length > 20
                ? `${stats.lastProcessed.title.substring(0, 20)}...`
                : stats.lastProcessed.title}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {stats.lastProcessed?.processed_at
            ? new Date(stats.lastProcessed.processed_at).toLocaleDateString()
            : 'N/A'}
        </div>
      </div>
    </div>
  );
}

