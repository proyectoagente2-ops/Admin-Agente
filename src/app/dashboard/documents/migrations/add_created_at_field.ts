export const addCreatedAtFieldSQL = `
ALTER TABLE documents1 
ADD COLUMN created_at timestamptz DEFAULT now() NOT NULL;
UPDATE documents1 SET created_at = COALESCE(processed_at, now());
`;
