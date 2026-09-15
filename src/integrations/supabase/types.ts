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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      integration_settings: {
        Row: {
          created_at: string
          enabled: boolean
          integration: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          integration: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          integration?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_entitlements: {
        Row: {
          active: boolean
          created_at: string
          entitlement: string
          id: string
          purchase_id: string
          revoked_at: string | null
          revoked_reason: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          entitlement: string
          id?: string
          purchase_id: string
          revoked_at?: string | null
          revoked_reason?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          entitlement?: string
          id?: string
          purchase_id?: string
          revoked_at?: string | null
          revoked_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_entitlements_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "vega_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          created_at: string
          display_name: string
          email_confirmed: boolean
          normalized_email: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email_confirmed?: boolean
          normalized_email: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email_confirmed?: boolean
          normalized_email?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vega_customers: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          normalized_email: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name?: string
          id?: string
          normalized_email: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          normalized_email?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vega_purchase_items: {
        Row: {
          created_at: string
          id: string
          product_code: string
          purchase_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_code: string
          purchase_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_code?: string
          purchase_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vega_purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "vega_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      vega_purchases: {
        Row: {
          created_at: string
          customer_id: string
          event_occurred_at: string
          id: string
          source_version: string
          status: string
          test_mode: boolean
          transaction_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          event_occurred_at: string
          id?: string
          source_version: string
          status: string
          test_mode?: boolean
          transaction_token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          event_occurred_at?: string
          id?: string
          source_version?: string
          status?: string
          test_mode?: boolean
          transaction_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vega_purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vega_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      vega_test_events: {
        Row: {
          id: string
          payload: Json
          received_at: string
        }
        Insert: {
          id?: string
          payload: Json
          received_at?: string
        }
        Update: {
          id?: string
          payload?: Json
          received_at?: string
        }
        Relationships: []
      }
      vega_webhook_events: {
        Row: {
          created_at: string
          event_occurred_at: string
          id: string
          outcome: string
          payload_hash: string
          source_version: string
          status: string
          transaction_token: string
        }
        Insert: {
          created_at?: string
          event_occurred_at: string
          id?: string
          outcome: string
          payload_hash: string
          source_version: string
          status: string
          transaction_token: string
        }
        Update: {
          created_at?: string
          event_occurred_at?: string
          id?: string
          outcome?: string
          payload_hash?: string
          source_version?: string
          status?: string
          transaction_token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      link_verified_student: {
        Args: { p_display_name: string; p_email: string; p_user_id: string }
        Returns: undefined
      }
      process_vega_purchase: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_event_occurred_at: string
          p_payload_hash: string
          p_product_codes: string[]
          p_source_version: string
          p_status: string
          p_transaction_token: string
        }
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
