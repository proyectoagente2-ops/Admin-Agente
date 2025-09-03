'use server'

import { createServerClient } from '@/utils/supabase/server'

export async function addProcessedByN8NField() {
  const supabase = await createServerClient()

  const { error } = await supabase.rpc('add_processed_by_n8n_field')
  
  if (error) {
    console.error('Error al añadir el campo processed_by_n8n:', error)
    throw error
  }
}

// SQL a ejecutar:
/*
create or replace function add_processed_by_n8n_field()
returns void
language plpgsql
security definer
as $$
begin
  -- Añadir la columna processed_by_n8n si no existe
  if not exists (
    select 1
    from information_schema.columns
    where table_name = 'documents'
    and column_name = 'processed_by_n8n'
  ) then
    alter table documents
    add column processed_by_n8n boolean default false;
  end if;
end;
$$;
*/
