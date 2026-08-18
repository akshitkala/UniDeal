export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          approval_mode: string
          id: number
        }
        Insert: {
          approval_mode?: string
          id?: number
        }
        Update: {
          approval_mode?: string
          id?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contact_reveals: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_reveals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_reveals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_reveals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category_id: number
          condition: Database["public"]["Enums"]["listing_condition"]
          created_at: string
          description: string
          id: string
          images: string[]
          negotiable: boolean
          price: number
          rejection_reason: string | null
          seller_id: string
          slug: string
          sold_at: string | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          category_id: number
          condition: Database["public"]["Enums"]["listing_condition"]
          created_at?: string
          description: string
          id?: string
          images: string[]
          negotiable?: boolean
          price: number
          rejection_reason?: string | null
          seller_id: string
          slug: string
          sold_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          category_id?: number
          condition?: Database["public"]["Enums"]["listing_condition"]
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          negotiable?: boolean
          price?: number
          rejection_reason?: string | null
          seller_id?: string
          slug?: string
          sold_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch: string | null
          created_at: string
          full_name: string
          id: string
          is_admin: boolean
          is_banned: boolean
          promoted_at: string | null
          promoted_by: string | null
          updated_at: string
          whatsapp_number: string | null
          year: string | null
        }
        Insert: {
          branch?: string | null
          created_at?: string
          full_name: string
          id: string
          is_admin?: boolean
          is_banned?: boolean
          promoted_at?: string | null
          promoted_by?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          year?: string | null
        }
        Update: {
          branch?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          is_banned?: boolean
          promoted_at?: string | null
          promoted_by?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_promoted_by_fkey"
            columns: ["promoted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_promoted_by_fkey"
            columns: ["promoted_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_listings: {
        Row: {
          category_id: number | null
          condition: Database["public"]["Enums"]["listing_condition"] | null
          created_at: string | null
          description: string | null
          id: string | null
          images: string[] | null
          negotiable: boolean | null
          price: number | null
          rejection_reason: string | null
          seller_branch: string | null
          seller_full_name: string | null
          seller_has_whatsapp_number: boolean | null
          seller_id: string | null
          seller_is_banned: boolean | null
          seller_year: string | null
          slug: string | null
          sold_at: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          category_id?: number | null
          condition?: Database["public"]["Enums"]["listing_condition"] | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          negotiable?: boolean | null
          price?: number | null
          rejection_reason?: string | null
          seller_branch?: string | null
          seller_full_name?: string | null
          seller_has_whatsapp_number?: boolean | null
          seller_id?: string | null
          seller_is_banned?: boolean | null
          seller_year?: string | null
          slug?: string | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          category_id?: number | null
          condition?: Database["public"]["Enums"]["listing_condition"] | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          negotiable?: boolean | null
          price?: number | null
          rejection_reason?: string | null
          seller_branch?: string | null
          seller_full_name?: string | null
          seller_has_whatsapp_number?: boolean | null
          seller_id?: string | null
          seller_is_banned?: boolean | null
          seller_year?: string | null
          slug?: string | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          branch: string | null
          created_at: string | null
          full_name: string | null
          has_whatsapp_number: boolean | null
          id: string | null
          is_admin: boolean | null
          is_banned: boolean | null
          promoted_at: string | null
          promoted_by: string | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          branch?: string | null
          created_at?: string | null
          full_name?: string | null
          has_whatsapp_number?: boolean | null
          id?: string | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          promoted_at?: string | null
          promoted_by?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          branch?: string | null
          created_at?: string | null
          full_name?: string | null
          has_whatsapp_number?: boolean | null
          id?: string | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          promoted_at?: string | null
          promoted_by?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_promoted_by_fkey"
            columns: ["promoted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_promoted_by_fkey"
            columns: ["promoted_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      increment_listing_views: {
        Args: { listing_id: string }
        Returns: undefined
      }
    }
    Enums: {
      listing_condition: "New" | "Like New" | "Good" | "Used" | "Damaged"
      listing_status: "approved" | "pending" | "rejected" | "sold" | "expired"
      report_status: "pending" | "resolved_removed" | "resolved_dismissed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      listing_condition: ["New", "Like New", "Good", "Used", "Damaged"],
      listing_status: ["approved", "pending", "rejected", "sold", "expired"],
      report_status: ["pending", "resolved_removed", "resolved_dismissed"],
    },
  },
} as const
