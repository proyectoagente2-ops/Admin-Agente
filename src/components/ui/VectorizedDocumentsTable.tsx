'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/utils/types/database.types';
import { DocumentModal } from './DocumentModal';
import { LoadingSpinner } from './LoadingSpinner';

type Document = Database['public']['Tables']['documents']['Row'];
type Documents1Row = Database['public']['Tables']['documents1']['Row'];
type VectorizedDocument = Omit<Documents1Row, 'documents'> & {
  documents: Pick<Document, 'id' | 'title' | 'description' | 'flow'> | null;
  created_at: string; // Campo agregado después de la migración
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
      <div className="flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="relative px-3 py-2 text-sm font-medium text-gray-500 bg-white border rounded-l-md hover:bg-gray-50 disabled:opacity-50"
            >
              Primera
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative px-3 py-2 text-sm font-medium text-gray-500 bg-white border hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative px-3 py-2 text-sm font-medium text-gray-500 bg-white border hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="relative px-3 py-2 text-sm font-medium text-gray-500 bg-white border rounded-r-md hover:bg-gray-50 disabled:opacity-50"
            >
              Última
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function VectorizedDocumentsTable() {
  const [documents, setDocuments] = useState<VectorizedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<VectorizedDocument | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFragments, setSelectedFragments] = useState<string[]>([]);
  const [fragmentsModalOpen, setFragmentsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<{ [key: string]: boolean }>({});
  
  const ITEMS_PER_PAGE = 10;
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchDocuments = async (page: number) => {
    setLoading(true);
    setError(null);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    try {
      const { data, error, count } = await supabase
        .from('documents1')
        .select(`
          id,
          content,
          metadata,
          embedding,
          document_id,
          processed_by_n8n,
          processed_at,
          chunks_count,
          source_url,
          processed_at as created_at,
          documents:documents (
            id,
            title,
            description,
            flow
          )
        `, { count: 'exact' })
        .order('processed_at', { ascending: false })
        .range(start, end) as unknown as {
          data: VectorizedDocument[] | null;
          error: null | any;
          count: number | null;
        };

      if (error) {
        console.error('Error fetching documents:', error);
        setError('Error al cargar los documentos. Por favor, intenta de nuevo.');
        return;
      }

      if (!data || !Array.isArray(data)) {
        setError('No se pudieron cargar los documentos.');
        return;
      }

      if (data.length === 0 && page === 1) {
        setError('No hay documentos vectorizados aún.');
        setDocuments([]);
        setTotalPages(0);
        return;
      }

      const documentsWithCreatedAt = data.map(doc => ({
        ...doc,
        created_at: doc.created_at || new Date().toISOString()
      })) as VectorizedDocument[];

      setDocuments(documentsWithCreatedAt);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const setLoadingState = (docId: number, isLoading: boolean) => {
    setLoadingAction(prev => ({ ...prev, [docId]: isLoading }));
  };

  const handleViewFragments = async (docId: number) => {
    setLoadingState(docId, true);
    const { data, error } = await supabase
      .from('documents1')
      .select('content')
      .eq('id', docId)
      .single();

    setLoadingState(docId, false);

    if (error) {
      console.error('Error fetching fragments:', error);
      return;
    }

    if (data?.content) {
      try {
        const fragments = typeof data.content === 'string' 
          ? [data.content] 
          : Array.isArray(data.content) 
            ? data.content 
            : [JSON.stringify(data.content)];
            
        setSelectedFragments(fragments);
        setFragmentsModalOpen(true);
      } catch (e) {
        console.error('Error parsing fragments:', e);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar este documento vectorizado?')) {
      return;
    }

    setLoadingState(id, true);
    const { error } = await supabase
      .from('documents1')
      .delete()
      .eq('id', id);

    setLoadingState(id, false);

    if (error) {
      console.error('Error deleting document:', error);
      return;
    }

    fetchDocuments(currentPage);
  };

  const handleReprocess = async (doc: VectorizedDocument) => {
    if (!doc.documents) return;

    setLoadingState(doc.id, true);
    try {
      const response = await fetch('/api/n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: doc.documents.id,
          documentId: doc.documents.id,
          title: doc.documents.title,
          description: doc.documents.description,
          flow: doc.documents.flow,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedDoc = {
        ...doc,
        processed_by_n8n: false,
        processed_at: null,
      };
      
      setDocuments(prev => 
        prev.map(d => d.id === doc.id ? updatedDoc : d)
      );
    } catch (error) {
      console.error('Error reprocessing document:', error);
    } finally {
      setLoadingState(doc.id, false);
    }
  };

  const getStatusBadge = (doc: VectorizedDocument) => {
    if (doc.embedding) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Vectorizado
        </span>
      );
    }
    if (!doc.processed_by_n8n) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pendiente
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Error
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento Original
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Flujo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {doc.documents?.title || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate" title={doc.documents?.description}>
                    {doc.documents?.description || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {doc.documents?.flow || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(doc)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {doc.created_at
                    ? new Date(doc.created_at).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    disabled={loadingAction[doc.id]}
                  >
                    Ver Contenido
                  </button>
                  <button
                    onClick={() => handleViewFragments(doc.id)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium ml-2"
                    disabled={loadingAction[doc.id]}
                  >
                    Ver Fragmentos
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium ml-2"
                    disabled={loadingAction[doc.id]}
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => handleReprocess(doc)}
                    className="text-green-600 hover:text-green-900 text-sm font-medium ml-2"
                    disabled={loadingAction[doc.id]}
                  >
                    Reprocesar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal para ver el contenido completo del documento */}
      <DocumentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDoc(null);
        }}
        title={selectedDoc?.documents?.title || 'Contenido del Documento'}
        content={selectedDoc?.content || 'No hay contenido disponible'}
      />

      {/* Modal para ver los fragmentos */}
      <DocumentModal
        isOpen={fragmentsModalOpen}
        onClose={() => {
          setFragmentsModalOpen(false);
          setSelectedFragments([]);
        }}
        title="Fragmentos del Documento"
        content={selectedFragments.join('\n\n---\n\n')}
      />
    </>
  );
}
