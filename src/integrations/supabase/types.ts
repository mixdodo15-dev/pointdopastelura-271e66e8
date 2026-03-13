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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          id: string
          is_default: boolean
          neighborhood: string
          number: string
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          neighborhood?: string
          number?: string
          street?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          neighborhood?: string
          number?: string
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cash_register: {
        Row: {
          closed_at: string | null
          closing_amount: number | null
          created_at: string
          difference: number | null
          id: string
          opened_at: string
          opening_amount: number
          status: string
          total_sales: number | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          closing_amount?: number | null
          created_at?: string
          difference?: number | null
          id?: string
          opened_at?: string
          opening_amount?: number
          status?: string
          total_sales?: number | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          closing_amount?: number | null
          created_at?: string
          difference?: number | null
          id?: string
          opened_at?: string
          opening_amount?: number
          status?: string
          total_sales?: number | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          icon: string
          id: string
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string
          id?: string
          label: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string
          id?: string
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      combos: {
        Row: {
          active: boolean
          combo_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          items: Json
          name: string
          original_price: number
          sort_order: number
        }
        Insert: {
          active?: boolean
          combo_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          items?: Json
          name: string
          original_price?: number
          sort_order?: number
        }
        Update: {
          active?: boolean
          combo_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          items?: Json
          name?: string
          original_price?: number
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          max_uses_per_user: number | null
          min_order_value: number | null
          starts_at: string | null
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_order_value?: number | null
          starts_at?: string | null
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_order_value?: number | null
          starts_at?: string | null
          used_count?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          cashback_balance: number | null
          cashback_percent: number | null
          city: string | null
          complement: string | null
          created_at: string | null
          email: string | null
          id: string
          is_favorite: boolean | null
          last_order_at: string | null
          loyalty_points: number | null
          loyalty_tier: string | null
          name: string
          neighborhood: string | null
          notes: string | null
          number: string | null
          phone: string
          state: string | null
          street: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cashback_balance?: number | null
          cashback_percent?: number | null
          city?: string | null
          complement?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          last_order_at?: string | null
          loyalty_points?: number | null
          loyalty_tier?: string | null
          name: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone: string
          state?: string | null
          street?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cashback_balance?: number | null
          cashback_percent?: number | null
          city?: string | null
          complement?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          last_order_at?: string | null
          loyalty_points?: number | null
          loyalty_tier?: string | null
          name?: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string
          state?: string | null
          street?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      delivery_settings: {
        Row: {
          fee_per_km: number
          id: string
          max_radius_km: number
          min_fee: number
          store_lat: number
          store_lng: number
          updated_at: string
        }
        Insert: {
          fee_per_km?: number
          id?: string
          max_radius_km?: number
          min_fee?: number
          store_lat?: number
          store_lng?: number
          updated_at?: string
        }
        Update: {
          fee_per_km?: number
          id?: string
          max_radius_km?: number
          min_fee?: number
          store_lat?: number
          store_lng?: number
          updated_at?: string
        }
        Relationships: []
      }
      flavors: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      happy_hour: {
        Row: {
          active: boolean
          categories: string[] | null
          created_at: string
          discount_percent: number
          end_time: string
          id: string
          name: string
          start_time: string
          weekdays: number[]
        }
        Insert: {
          active?: boolean
          categories?: string[] | null
          created_at?: string
          discount_percent?: number
          end_time?: string
          id?: string
          name?: string
          start_time?: string
          weekdays?: number[]
        }
        Update: {
          active?: boolean
          categories?: string[] | null
          created_at?: string
          discount_percent?: number
          end_time?: string
          id?: string
          name?: string
          start_time?: string
          weekdays?: number[]
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          id: string
          points: number
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          active: boolean
          created_at: string
          delivery_fee: number
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          delivery_fee?: number
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          delivery_fee?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_name: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_fee: number
          driver_id: string | null
          id: string
          notes: string | null
          order_number: number
          order_source: string | null
          payment_method: string
          status: Database["public"]["Enums"]["order_status"]
          table_number: string | null
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_fee?: number
          driver_id?: string | null
          id?: string
          notes?: string | null
          order_number?: number
          order_source?: string | null
          payment_method: string
          status?: Database["public"]["Enums"]["order_status"]
          table_number?: string | null
          total_price: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_fee?: number
          driver_id?: string | null
          id?: string
          notes?: string | null
          order_number?: number
          order_source?: string | null
          payment_method?: string
          status?: Database["public"]["Enums"]["order_status"]
          table_number?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          available_on: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_top_week: boolean
          max_flavors: number | null
          name: string
          prep_time: number | null
          price: number
          sort_order: number
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          available_on?: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_top_week?: boolean
          max_flavors?: number | null
          name: string
          prep_time?: number | null
          price: number
          sort_order?: number
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          available_on?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_top_week?: boolean
          max_flavors?: number | null
          name?: string
          prep_time?: number | null
          price?: number
          sort_order?: number
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      format_order_number: { Args: { num: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "driver"
      order_status:
        | "received"
        | "accepted"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "moderator", "user", "driver"],
      order_status: [
        "received",
        "accepted",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
