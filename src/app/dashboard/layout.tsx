import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-gray-900 text-white p-4">
        <div className="text-xl font-bold mb-8">Agente SENA</div>
        <ul className="space-y-2">
          <li>
            <Link 
              href="/dashboard" 
              className="block py-2 px-4 rounded hover:bg-gray-800"
            >
              Documentos
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/vectorized" 
              className="block py-2 px-4 rounded hover:bg-gray-800"
            >
              Documentos Vectorizados
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 overflow-auto">
        {children}
      </main>
    </div>
  );
}
