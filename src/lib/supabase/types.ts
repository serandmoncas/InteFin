export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      client_invitations: {
        Row: {
          id: string
          email: string
          full_name: string | null
          organization_id: string
          coach_id: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          organization_id: string
          coach_id: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          organization_id?: string
          coach_id?: string
          used?: boolean
          created_at?: string
        }
        Relationships: []
      }
      account_snapshots: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          organization_id: string
          progress_pct: number
          snapshot_month: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          progress_pct?: number
          snapshot_month: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          progress_pct?: number
          snapshot_month?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          birth_year: number | null
          coach_id: string
          coach_notes: string | null
          created_at: string
          dependents_count: number
          has_partner: boolean
          id: string
          monthly_expenses: number | null
          monthly_income: number | null
          occupation: string | null
          organization_id: string
          status: Database["public"]["Enums"]["client_status"]
          user_id: string
        }
        Insert: {
          birth_year?: number | null
          coach_id: string
          coach_notes?: string | null
          created_at?: string
          dependents_count?: number
          has_partner?: boolean
          id?: string
          monthly_expenses?: number | null
          monthly_income?: number | null
          occupation?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["client_status"]
          user_id: string
        }
        Update: {
          birth_year?: number | null
          coach_id?: string
          coach_notes?: string | null
          created_at?: string
          dependents_count?: number
          has_partner?: boolean
          id?: string
          monthly_expenses?: number | null
          monthly_income?: number | null
          occupation?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["client_status"]
          user_id?: string
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          deliverables: Json | null
          id: string
          notes: string | null
          organization_id: string
          session_date: string | null
          session_number: number
          status: Database["public"]["Enums"]["session_status"]
          summary: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          deliverables?: Json | null
          id?: string
          notes?: string | null
          organization_id: string
          session_date?: string | null
          session_number?: number
          status?: Database["public"]["Enums"]["session_status"]
          summary?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          deliverables?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string
          session_date?: string | null
          session_number?: number
          status?: Database["public"]["Enums"]["session_status"]
          summary?: string | null
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          client_id: string
          created_at: string
          current_amount: number
          id: string
          institution: string | null
          is_active: boolean
          notes: string | null
          organization_id: string
          target_amount: number
          updated_at: string
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          client_id: string
          created_at?: string
          current_amount?: number
          id?: string
          institution?: string | null
          is_active?: boolean
          notes?: string | null
          organization_id: string
          target_amount?: number
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          client_id?: string
          created_at?: string
          current_amount?: number
          id?: string
          institution?: string | null
          is_active?: boolean
          notes?: string | null
          organization_id?: string
          target_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      financial_diagnostics: {
        Row: {
          biggest_fear: string | null
          client_id: string
          has_health_insurance: boolean
          has_life_insurance: boolean
          has_pension: boolean
          id: string
          large_assets: number
          liquid_assets: number
          monthly_expenses: number
          monthly_income: number
          net_worth: number | null
          notes: string | null
          organization_id: string
          primary_goal: string | null
          recorded_at: string
          total_assets: number
          total_debts: number
        }
        Insert: {
          biggest_fear?: string | null
          client_id: string
          has_health_insurance?: boolean
          has_life_insurance?: boolean
          has_pension?: boolean
          id?: string
          large_assets?: number
          liquid_assets?: number
          monthly_expenses?: number
          monthly_income?: number
          notes?: string | null
          organization_id: string
          primary_goal?: string | null
          recorded_at?: string
          total_assets?: number
          total_debts?: number
        }
        Update: {
          biggest_fear?: string | null
          client_id?: string
          has_health_insurance?: boolean
          has_life_insurance?: boolean
          has_pension?: boolean
          id?: string
          large_assets?: number
          liquid_assets?: number
          monthly_expenses?: number
          monthly_income?: number
          notes?: string | null
          organization_id?: string
          primary_goal?: string | null
          recorded_at?: string
          total_assets?: number
          total_debts?: number
        }
        Relationships: []
      }
      goals: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["goal_status"]
          target_amount: number | null
          target_date: string | null
          title: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_amount?: number | null
          target_date?: string | null
          title: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_amount?: number | null
          target_date?: string | null
          title?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          brand_color: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          plan: Database["public"]["Enums"]["org_plan"]
          slug: string
          stripe_customer_id: string | null
        }
        Insert: {
          brand_color?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          plan?: Database["public"]["Enums"]["org_plan"]
          slug: string
          stripe_customer_id?: string | null
        }
        Update: {
          brand_color?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan?: Database["public"]["Enums"]["org_plan"]
          slug?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          locale: Database["public"]["Enums"]["user_locale"]
          onboarding_completed: boolean
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          locale?: Database["public"]["Enums"]["user_locale"]
          onboarding_completed?: boolean
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: Database["public"]["Enums"]["user_locale"]
          onboarding_completed?: boolean
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_my_org_id: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: Database["public"]["Enums"]["user_role"] }
    }
    Enums: {
      account_type: "imprevisto" | "oxigeno" | "retiro" | "inversiones"
      client_status: "lead" | "active" | "paused" | "completed"
      goal_status: "pending" | "in_progress" | "completed" | "cancelled"
      org_plan: "free" | "pro" | "enterprise"
      session_status: "scheduled" | "completed" | "cancelled"
      user_locale: "es" | "en"
      user_role: "super_admin" | "coach" | "client"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

// Convenience type aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

export type Organization = Tables<"organizations">
export type Profile = Tables<"profiles">
export type ClientProfile = Tables<"client_profiles">
export type FinancialDiagnostic = Tables<"financial_diagnostics">
export type FinancialAccount = Tables<"financial_accounts">
export type AccountSnapshot = Tables<"account_snapshots">
export type Goal = Tables<"goals">
export type CoachingSession = Tables<"coaching_sessions">

export type AccountType = Enums<"account_type">
export type UserRole = Enums<"user_role">
export type ClientStatus = Enums<"client_status">
export type OrgPlan = Enums<"org_plan">
