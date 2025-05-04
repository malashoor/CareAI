export type PromoAccessStatus = 'active' | 'revoked' | 'expired';
export type PromoAccessReason = 'family' | 'beta_tester' | 'influencer' | 'campaign' | 'close_friend';

export interface PromoAccess {
  id: string;
  user_email: string;
  reason: PromoAccessReason;
  status: PromoAccessStatus;
  expires_at: string | null;
  created_at: string;
  created_by: string;
  promo_code?: string;
  notes?: string;
}

export interface PromoAccessLog {
  id: string;
  promo_access_id: string;
  action: 'created' | 'updated' | 'revoked' | 'extended';
  admin_id: string;
  changes: Record<string, any>;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  reason: PromoAccessReason;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
  created_at: string;
  created_by: string;
  campaign_id?: string;
} 