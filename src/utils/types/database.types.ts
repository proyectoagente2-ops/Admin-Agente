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
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
