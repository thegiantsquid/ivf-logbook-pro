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
      ivf_records: {
        Row: {
          age: number | null
          complication_notes: string | null
          created_at: string | null
          created_by: string
          date: string | null
          hospital: string | null
          id: string
          mrn: string | null
          operation_notes: string | null
          procedure: string | null
          supervision: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          complication_notes?: string | null
          created_at?: string | null
          created_by: string
          date?: string | null
          hospital?: string | null
          id?: string
          mrn?: string | null
          operation_notes?: string | null
          procedure?: string | null
          supervision?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          complication_notes?: string | null
          created_at?: string | null
          created_by?: string
          date?: string | null
          hospital?: string | null
          id?: string
          mrn?: string | null
          operation_notes?: string | null
          procedure?: string | null
          supervision?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      milestone_types: {
        Row: {
          badge_name: string
          created_at: string
          description: string
          id: string
          milestone_count: number
          procedure: string
        }
        Insert: {
          badge_name: string
          created_at?: string
          description: string
          id?: string
          milestone_count: number
          procedure: string
        }
        Update: {
          badge_name?: string
          created_at?: string
          description?: string
          id?: string
          milestone_count?: number
          procedure?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string
          id: string
          is_seen: boolean
          milestone_type_id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          id?: string
          is_seen?: boolean
          milestone_type_id: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          id?: string
          is_seen?: boolean
          milestone_type_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_milestone_type_id_fkey"
            columns: ["milestone_type_id"]
            isOneToOne: false
            referencedRelation: "milestone_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_hospital_types: {
        Row: {
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_procedure_types: {
        Row: {
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          is_subscribed: boolean
          subscription_end_date: string | null
          trial_end_date: string
          trial_start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_subscribed?: boolean
          subscription_end_date?: string | null
          trial_end_date: string
          trial_start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_subscribed?: boolean
          subscription_end_date?: string | null
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          user_id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
