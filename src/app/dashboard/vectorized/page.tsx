import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { VectorizedStats } from '@/components/ui/VectorizedStats';
import { VectorizedDocumentsTable } from '@/components/ui/VectorizedDocumentsTable';

export default async function VectorizedDocuments() {
  return (
    <div className="flex w-full flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Documentos Vectorizados</h1>
      </div>

      <div className="w-full">
        <Suspense fallback={
          <Card className="w-full p-4">
            <LoadingSpinner />
          </Card>
        }>
          <VectorizedStats />
        </Suspense>
      </div>

      <div className="mt-6">
        <Suspense fallback={
          <Card className="w-full p-4">
            <LoadingSpinner />
          </Card>
        }>
          <Card className="overflow-hidden">
            <VectorizedDocumentsTable />
          </Card>
        </Suspense>
      </div>
    </div>
  );
}
