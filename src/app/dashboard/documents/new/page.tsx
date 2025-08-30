'use client';

import { createDocument } from './actions';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewDocumentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      await createDocument(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear el documento');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClasses = `mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
    focus:border-blue-500 focus:ring-blue-500 transition-all duration-200
    hover:border-blue-400`;

  const labelClasses = `block text-sm font-medium text-blue-700 mb-1`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 max-w-4xl mx-auto"
    >
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
      >
        Nuevo Documento
      </motion.h1>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 shadow-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        action={handleSubmit} 
        className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <label htmlFor="title" className={labelClasses}>
              Título
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              disabled={isLoading}
              className={inputClasses}
              placeholder="Ingrese el título del documento"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <label htmlFor="code" className={labelClasses}>
              Código
            </label>
            <input
              type="text"
              name="code"
              id="code"
              required
              disabled={isLoading}
              className={inputClasses}
              placeholder="Ejemplo: DOC-001"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <label htmlFor="version" className={labelClasses}>
              Versión
            </label>
            <input
              type="text"
              name="version"
              id="version"
              required
              disabled={isLoading}
              placeholder="1.0.0"
              className={inputClasses}
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <label htmlFor="flow" className={labelClasses}>
              Flujo
            </label>
            <select
              name="flow"
              id="flow"
              required
              disabled={isLoading}
              className={inputClasses}
            >
              <option value="">Selecciona un flujo</option>
              <option value="aprendiz">Aprendiz</option>
              <option value="instructor">Instructor</option>
              <option value="administrador">Administrador</option>
            </select>
          </motion.div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.01 }} 
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 shadow-sm backdrop-blur-sm"
        >
          <label htmlFor="description" className={labelClasses}>
            Descripción
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            disabled={isLoading}
            className={`${inputClasses} resize-none`}
            placeholder="Describe el contenido del documento..."
          />
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.01 }} 
          transition={{ type: "spring", stiffness: 300 }}
        >
          <label htmlFor="tags" className={labelClasses}>
            Etiquetas (separadas por comas)
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            disabled={isLoading}
            placeholder="ejemplo: informe, mensual, ventas"
            className={inputClasses}
          />
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.01 }} 
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-blue-50 p-6 rounded-lg border border-blue-100"
        >
          <label htmlFor="file" className={`${labelClasses} text-blue-700`}>
            Archivo
          </label>
          <input
            type="file"
            name="file"
            id="file"
            required
            disabled={isLoading}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-100 file:text-blue-700
              hover:file:bg-blue-200
              transition-all duration-200
              cursor-pointer"
          />
        </motion.div>

        <motion.div 
          className="flex justify-end space-x-4 pt-4 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            type="button"
            onClick={() => window.history.back()}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 
              rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 
              to-indigo-600 border border-transparent rounded-lg shadow-sm 
              hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creando...</span>
              </span>
            ) : 'Crear Documento'}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
