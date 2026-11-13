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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      dispatch_assignments: {
        Row: {
          arrived_at: string | null
          created_at: string
          distance_km: number
          id: string
          incident_id: string
          responder_id: string
          state: string
          updated_at: string
        }
        Insert: {
          arrived_at?: string | null
          created_at?: string
          distance_km: number
          id?: string
          incident_id: string
          responder_id: string
          state?: string
          updated_at?: string
        }
        Update: {
          arrived_at?: string | null
          created_at?: string
          distance_km?: number
          id?: string
          incident_id?: string
          responder_id?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_assignments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_assignments_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_events: {
        Row: {
          actor_id: string | null
          created_at: string
          details: Json
          event: string
          id: string
          incident_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          event: string
          id?: string
          incident_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          event?: string
          id?: string
          incident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_evidence: {
        Row: {
          camera: string
          captured_at: string
          created_at: string
          id: string
          incident_id: string
          responder_id: string
          responder_name: string
          storage_path: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          camera: string
          captured_at: string
          created_at?: string
          id?: string
          incident_id: string
          responder_id: string
          responder_name: string
          storage_path: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          camera?: string
          captured_at?: string
          created_at?: string
          id?: string
          incident_id?: string
          responder_id?: string
          responder_name?: string
          storage_path?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_evidence_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_locations: {
        Row: {
          accuracy: number | null
          created_at: string
          id: string
          incident_id: string
          lat: number
          lng: number
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          id?: string
          incident_id: string
          lat: number
          lng: number
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          id?: string
          incident_id?: string
          lat?: number
          lng?: number
        }
        Relationships: [
          {
            foreignKeyName: "incident_locations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          accuracy: number | null
          area: string
          camera: string
          created_at: string
          emergency_name: string | null
          emergency_phone: string | null
          ended_at: string | null
          id: string
          lat: number | null
          lng: number | null
          location_at: string | null
          outcome: string | null
          phone: string
          sms_status: string
          status: string
          updated_at: string
          user_id: string
          victim: string
        }
        Insert: {
          accuracy?: number | null
          area?: string
          camera?: string
          created_at?: string
          emergency_name?: string | null
          emergency_phone?: string | null
          ended_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_at?: string | null
          outcome?: string | null
          phone: string
          sms_status?: string
          status?: string
          updated_at?: string
          user_id: string
          victim: string
        }
        Update: {
          accuracy?: number | null
          area?: string
          camera?: string
          created_at?: string
          emergency_name?: string | null
          emergency_phone?: string | null
          ended_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_at?: string | null
          outcome?: string | null
          phone?: string
          sms_status?: string
          status?: string
          updated_at?: string
          user_id?: string
          victim?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          birth_reg: string | null
          created_at: string
          dob: string
          documents: Json
          guardian: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_reg?: string | null
          created_at?: string
          dob: string
          documents?: Json
          guardian?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_reg?: string | null
          created_at?: string
          dob?: string
          documents?: Json
          guardian?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_records: {
        Row: {
          collection: string
          content: Json
          created_at: string
          id: string
          published: boolean
          updated_at: string
        }
        Insert: {
          collection: string
          content: Json
          created_at?: string
          id: string
          published?: boolean
          updated_at?: string
        }
        Update: {
          collection?: string
          content?: Json
          created_at?: string
          id?: string
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      phone_otps: {
        Row: {
          attempts: number
          code_hash: string
          expires_at: string
          phone: string
          sent_at: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          expires_at: string
          phone: string
          sent_at?: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          expires_at?: string
          phone?: string
          sent_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          created_at: string
          dob: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_relation: string | null
          false_count: number
          full_name: string
          id: string
          kyc_status: string
          last_lat: number | null
          last_lng: number | null
          nid_number: string | null
          phone: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          dob?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_relation?: string | null
          false_count?: number
          full_name?: string
          id: string
          kyc_status?: string
          last_lat?: number | null
          last_lng?: number | null
          nid_number?: string | null
          phone?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string
          created_at?: string
          dob?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_relation?: string | null
          false_count?: number
          full_name?: string
          id?: string
          kyc_status?: string
          last_lat?: number | null
          last_lng?: number | null
          nid_number?: string | null
          phone?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_submission_limits: {
        Row: {
          fingerprint: string
          submitted_at: string
        }
        Insert: {
          fingerprint: string
          submitted_at?: string
        }
        Update: {
          fingerprint?: string
          submitted_at?: string
        }
        Relationships: []
      }
      responders: {
        Row: {
          area: string
          code: string
          created_at: string
          details: Json
          fixed: boolean
          id: string
          kind: string
          lat: number | null
          lng: number | null
          location_at: string | null
          name: string
          online: boolean
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string
          code: string
          created_at?: string
          details?: Json
          fixed?: boolean
          id?: string
          kind: string
          lat?: number | null
          lng?: number | null
          location_at?: string | null
          name: string
          online?: boolean
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string
          code?: string
          created_at?: string
          details?: Json
          fixed?: boolean
          id?: string
          kind?: string
          lat?: number | null
          lng?: number | null
          location_at?: string | null
          name?: string
          online?: boolean
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      trip_shares: {
        Row: {
          active: boolean
          created_at: string
          dest_label: string | null
          dest_lat: number | null
          dest_lng: number | null
          ended_at: string | null
          id: string
          lat: number | null
          lng: number | null
          sharer_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dest_label?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          ended_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          sharer_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dest_label?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          ended_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          sharer_name?: string
          updated_at?: string
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
      user_security: {
        Row: {
          attempts: number
          created_at: string
          locked_until: string | null
          pin_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          locked_until?: string | null
          pin_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          locked_until?: string | null
          pin_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_security_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_incident: { Args: { _id: string }; Returns: boolean }
      complete_incident: {
        Args: { _id: string; _outcome?: string; _status: string }
        Returns: undefined
      }
      get_trip_share: {
        Args: { _id: string }
        Returns: {
          active: boolean
          dest_label: string
          dest_lat: number
          dest_lng: number
          lat: number
          lng: number
          sharer_name: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      respond_to_incident: {
        Args: { _id: string; _state: string }
        Returns: undefined
      }
      send_sms_bulksmsbd: { Args: { event: Json }; Returns: Json }
      start_incident: {
        Args: { _accuracy?: number; _lat: number; _lng: number }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "responder" | "user"
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
    Enums: {
      app_role: ["admin", "responder", "user"],
    },
  },
} as const
