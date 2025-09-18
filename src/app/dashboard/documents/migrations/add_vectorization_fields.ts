export const migrationSQL = `
  -- Add new fields to documents1 table
  ALTER TABLE documents1
  ADD COLUMN IF NOT EXISTS processed_by_n8n boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS chunks_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source_url text,
  -- Add relationship to documents table
  ADD CONSTRAINT documents1_document_id_fkey
  FOREIGN KEY (document_id)
  REFERENCES documents(id)
  ON DELETE CASCADE;

  -- Add index for document_id
  CREATE INDEX IF NOT EXISTS idx_documents1_document_id ON documents1(document_id);
`;
