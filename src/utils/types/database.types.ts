export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_sign_in: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          last_sign_in?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_sign_in?: string | null
        }
        Relationships: []
      }
      documents1: {
        Row: {
          id: number
          content: string | null
          metadata: Json | null
          embedding: string | null
          document_id: string | null
          processed_by_n8n: boolean
          processed_at: string | null
          chunks_count: number
          source_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          content?: string | null
          metadata?: Json | null
          embedding?: string | null
          document_id?: string | null
          processed_by_n8n?: boolean
          processed_at?: string | null
          chunks_count?: number
          source_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          content?: string | null
          metadata?: Json | null
          embedding?: string | null
          document_id?: string | null
          processed_by_n8n?: boolean
          processed_at?: string | null
          chunks_count?: number
          source_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents1_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          title: string
          description: string
          code: string
          version: string
          flow: string
          file_path: string
          file_name: string
          tags: string[]
          created_by: string
          updated_by: string
          created_at: string
          updated_at: string
          processed_by_n8n: boolean | null
          processed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          code: string
          version: string
          flow: string
          file_path: string
          file_name: string
          tags: string[]
          created_by: string
          updated_by: string
          created_at?: string
          updated_at?: string
          processed_by_n8n?: boolean
          processed_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          code?: string
          version?: string
          flow?: string
          file_path?: string
          file_name?: string
          tags?: string[]
          created_by?: string
          updated_by?: string
          created_at?: string
          updated_at?: string
          processed_by_n8n?: boolean
          processed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_processed_by_n8n_field: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
