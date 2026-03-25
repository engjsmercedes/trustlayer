export type ProfileStatus = 'free' | 'verified' | 'trial' | 'paid' | 'suspended'
export type PlanType = 'free' | 'verified' | 'trial' | 'starter' | 'growth'
export type ClaimStatus = 'pending' | 'awaiting_seller' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
export type StrikeReason = 'no_response' | 'invalid_claim_handling' | 'policy_violation' | 'manual'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; user_id: string; full_name: string; email: string; phone: string | null; website_url: string | null; slug: string; status: ProfileStatus; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; full_name: string; email: string; phone?: string | null; website_url?: string | null; slug: string; status?: ProfileStatus; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      plans: {
        Row: { id: string; profile_id: string; plan_type: PlanType; coverage_amount: number; pool_limit: number; pool_used: number; deposit_amount: number; trial_started_at: string | null; trial_ends_at: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; profile_id: string; plan_type?: PlanType; coverage_amount?: number; pool_limit?: number; pool_used?: number; deposit_amount?: number; trial_started_at?: string | null; trial_ends_at?: string | null }
        Update: Partial<Database['public']['Tables']['plans']['Insert']>
      }
      claims: {
        Row: { id: string; profile_id: string; buyer_name: string; buyer_email: string; order_reference: string | null; issue_description: string; proof: string | null; status: ClaimStatus; payout_amount: number | null; admin_notes: string | null; seller_response: string | null; seller_responded_at: string | null; resolution_reason: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; profile_id: string; buyer_name: string; buyer_email: string; order_reference?: string | null; issue_description: string; proof?: string | null; status?: ClaimStatus }
        Update: Partial<Database['public']['Tables']['claims']['Insert']>
      }
      subscriptions: {
        Row: { id: string; profile_id: string; stripe_customer_id: string | null; stripe_subscription_id: string | null; stripe_price_id: string | null; status: SubscriptionStatus; current_period_start: string | null; current_period_end: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; profile_id: string; stripe_customer_id?: string | null; stripe_subscription_id?: string | null; stripe_price_id?: string | null; status?: SubscriptionStatus }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      strikes: {
        Row: { id: string; profile_id: string; claim_id: string | null; reason: StrikeReason; notes: string | null; issued_at: string }
        Insert: { id?: string; profile_id: string; claim_id?: string | null; reason: StrikeReason; notes?: string | null }
        Update: Partial<Database['public']['Tables']['strikes']['Insert']>
      }
      waitlist: {
        Row: { id: string; email: string; website_url: string | null; source: string | null; created_at: string }
        Insert: { id?: string; email: string; website_url?: string | null; source?: string | null }
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>
      }
    }
    Views: {
      badge_states: {
        Row: { profile_id: string; slug: string; full_name: string; website_url: string | null; status: ProfileStatus; plan_type: PlanType; coverage_amount: number; pool_limit: number; pool_used: number; pool_remaining: number; trial_ends_at: string | null; strike_count: number }
      }
    }
    Functions: {
      get_strike_count: { Args: { p_profile_id: string }; Returns: number }
      get_pool_remaining: { Args: { p_profile_id: string }; Returns: number }
      is_trial_active: { Args: { p_profile_id: string }; Returns: boolean }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Plan = Database['public']['Tables']['plans']['Row']
export type Claim = Database['public']['Tables']['claims']['Row']
export type BadgeState = Database['public']['Views']['badge_states']['Row']
