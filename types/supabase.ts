export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: string
          name: string
          email: string
          avatar_url: string | null
          language: string | null
          timezone: string
          emergency_contacts: Json[] | null
          medical_info: Json | null
          created_at: string | null
          updated_at: string | null
          health_sync_config: Json | null
          subscription_id: string | null
          features_enabled: Json | null
          cognitive_preferences: Json | null
          device_notifications: Json | null
        }
        Insert: {
          id: string
          role: string
          name: string
          email: string
          avatar_url?: string | null
          language?: string | null
          timezone: string
          emergency_contacts?: Json[] | null
          medical_info?: Json | null
          created_at?: string | null
          updated_at?: string | null
          health_sync_config?: Json | null
          subscription_id?: string | null
          features_enabled?: Json | null
          cognitive_preferences?: Json | null
          device_notifications?: Json | null
        }
        Update: {
          id?: string
          role?: string
          name?: string
          email?: string
          avatar_url?: string | null
          language?: string | null
          timezone?: string
          emergency_contacts?: Json[] | null
          medical_info?: Json | null
          created_at?: string | null
          updated_at?: string | null
          health_sync_config?: Json | null
          subscription_id?: string | null
          features_enabled?: Json | null
          cognitive_preferences?: Json | null
          device_notifications?: Json | null
        }
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
  }
}