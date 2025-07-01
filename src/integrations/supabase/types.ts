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
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cattle_profiles: {
        Row: {
          added_by: string
          breed: string
          cattle_id: string
          created_at: string
          dob: string
          farmer_id: string | null
          farmer_name: string
          id: string
          lactation: boolean
          owner_phone: string
          type: string
          weight_kg: number
        }
        Insert: {
          added_by: string
          breed: string
          cattle_id: string
          created_at?: string
          dob: string
          farmer_id?: string | null
          farmer_name: string
          id?: string
          lactation?: boolean
          owner_phone: string
          type: string
          weight_kg: number
        }
        Update: {
          added_by?: string
          breed?: string
          cattle_id?: string
          created_at?: string
          dob?: string
          farmer_id?: string | null
          farmer_name?: string
          id?: string
          lactation?: boolean
          owner_phone?: string
          type?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "cattle_profiles_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cattle_profiles_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          aadhaar_number: string | null
          added_by: string
          created_at: string
          district: string
          full_name: string
          id: string
          phone_number: string
          pincode: string
          state: string
          taluk: string
          town_or_village: string
        }
        Insert: {
          aadhaar_number?: string | null
          added_by: string
          created_at?: string
          district: string
          full_name: string
          id?: string
          phone_number: string
          pincode: string
          state: string
          taluk: string
          town_or_village: string
        }
        Update: {
          aadhaar_number?: string | null
          added_by?: string
          created_at?: string
          district?: string
          full_name?: string
          id?: string
          phone_number?: string
          pincode?: string
          state?: string
          taluk?: string
          town_or_village?: string
        }
        Relationships: [
          {
            foreignKeyName: "farmers_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_requests: {
        Row: {
          cattle_id: string
          created_at: string
          date: string
          farmer_phone: string
          feed_type: string
          id: string
          quantity_kg: number
          requested_by: string
          status: string
        }
        Insert: {
          cattle_id: string
          created_at?: string
          date?: string
          farmer_phone: string
          feed_type: string
          id?: string
          quantity_kg: number
          requested_by: string
          status?: string
        }
        Update: {
          cattle_id?: string
          created_at?: string
          date?: string
          farmer_phone?: string
          feed_type?: string
          id?: string
          quantity_kg?: number
          requested_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_requests_cattle_id_fkey"
            columns: ["cattle_id"]
            isOneToOne: false
            referencedRelation: "cattle_profiles"
            referencedColumns: ["cattle_id"]
          },
          {
            foreignKeyName: "feed_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      health_checkups: {
        Row: {
          added_by: string
          cattle_id: string
          created_at: string
          date: string
          id: string
          issue: string | null
          issue_type: string | null
          recovery_status: string | null
          temperature: number
        }
        Insert: {
          added_by: string
          cattle_id: string
          created_at?: string
          date?: string
          id?: string
          issue?: string | null
          issue_type?: string | null
          recovery_status?: string | null
          temperature: number
        }
        Update: {
          added_by?: string
          cattle_id?: string
          created_at?: string
          date?: string
          id?: string
          issue?: string | null
          issue_type?: string | null
          recovery_status?: string | null
          temperature?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_checkups_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_checkups_cattle_id_fkey"
            columns: ["cattle_id"]
            isOneToOne: false
            referencedRelation: "cattle_profiles"
            referencedColumns: ["cattle_id"]
          },
        ]
      }
      milk_production: {
        Row: {
          cattle_id: string
          created_at: string
          date: string
          id: string
          quantity_litres: number
          recorded_by: string
          shift: string | null
        }
        Insert: {
          cattle_id: string
          created_at?: string
          date?: string
          id?: string
          quantity_litres: number
          recorded_by: string
          shift?: string | null
        }
        Update: {
          cattle_id?: string
          created_at?: string
          date?: string
          id?: string
          quantity_litres?: number
          recorded_by?: string
          shift?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milk_production_cattle_id_fkey"
            columns: ["cattle_id"]
            isOneToOne: false
            referencedRelation: "cattle_profiles"
            referencedColumns: ["cattle_id"]
          },
          {
            foreignKeyName: "milk_production_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          otp: string
          phone_number: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          otp: string
          phone_number: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          otp?: string
          phone_number?: string
          used?: boolean | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          active_role: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          designation: string
          full_name: string
          id: string
          password_hash: string
          phone_number: string
          profile_image_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          active_role: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          designation: string
          full_name: string
          id?: string
          password_hash: string
          phone_number: string
          profile_image_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          active_role?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          designation?: string
          full_name?: string
          id?: string
          password_hash?: string
          phone_number?: string
          profile_image_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_status: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_permission: {
        Args: { user_id: string; required_permission: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
