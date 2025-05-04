import { supabase } from './supabase';
import { PromoAccess, PromoAccessLog, PromoCode, PromoAccessStatus, PromoAccessReason } from '../types/promoAccess';

class PromoAccessService {
  private static instance: PromoAccessService;

  private constructor() {}

  public static getInstance(): PromoAccessService {
    if (!PromoAccessService.instance) {
      PromoAccessService.instance = new PromoAccessService();
    }
    return PromoAccessService.instance;
  }

  // Check if a user has active promo access
  async hasActivePromoAccess(userEmail: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('promo_access')
      .select('*')
      .eq('user_email', userEmail)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .single();

    if (error) {
      console.error('Error checking promo access:', error);
      return false;
    }

    return !!data;
  }

  // Grant promo access to a user
  async grantPromoAccess(
    userEmail: string,
    reason: PromoAccessReason,
    adminId: string,
    options: {
      expiresAt?: string;
      promoCode?: string;
      notes?: string;
    } = {}
  ): Promise<PromoAccess | null> {
    const { data, error } = await supabase
      .from('promo_access')
      .insert({
        user_email: userEmail,
        reason,
        status: 'active',
        expires_at: options.expiresAt,
        created_by: adminId,
        promo_code: options.promoCode,
        notes: options.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error granting promo access:', error);
      return null;
    }

    // Log the action
    await this.logPromoAccessAction(data.id, 'created', adminId, {
      user_email: userEmail,
      reason,
      expires_at: options.expiresAt,
      promo_code: options.promoCode,
      notes: options.notes,
    });

    return data;
  }

  // Revoke promo access
  async revokePromoAccess(
    promoAccessId: string,
    adminId: string,
    reason?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('promo_access')
      .update({ status: 'revoked' })
      .eq('id', promoAccessId);

    if (error) {
      console.error('Error revoking promo access:', error);
      return false;
    }

    // Log the action
    await this.logPromoAccessAction(promoAccessId, 'revoked', adminId, { reason });

    return true;
  }

  // Extend promo access expiry
  async extendPromoAccess(
    promoAccessId: string,
    newExpiryDate: string,
    adminId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('promo_access')
      .update({ expires_at: newExpiryDate })
      .eq('id', promoAccessId);

    if (error) {
      console.error('Error extending promo access:', error);
      return false;
    }

    // Log the action
    await this.logPromoAccessAction(promoAccessId, 'extended', adminId, {
      new_expiry_date: newExpiryDate,
    });

    return true;
  }

  // Get all promo access entries
  async getAllPromoAccess(): Promise<PromoAccess[]> {
    const { data, error } = await supabase
      .from('promo_access')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promo access:', error);
      return [];
    }

    return data;
  }

  // Get promo access logs
  async getPromoAccessLogs(promoAccessId: string): Promise<PromoAccessLog[]> {
    const { data, error } = await supabase
      .from('promo_access_logs')
      .select('*')
      .eq('promo_access_id', promoAccessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promo access logs:', error);
      return [];
    }

    return data;
  }

  // Create a promo code
  async createPromoCode(
    code: string,
    reason: PromoAccessReason,
    adminId: string,
    options: {
      expiresAt?: string;
      maxUses?: number;
      campaignId?: string;
    } = {}
  ): Promise<PromoCode | null> {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code,
        reason,
        expires_at: options.expiresAt,
        max_uses: options.maxUses,
        used_count: 0,
        created_by: adminId,
        campaign_id: options.campaignId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promo code:', error);
      return null;
    }

    return data;
  }

  // Validate and use a promo code
  async usePromoCode(
    code: string,
    userEmail: string,
    adminId: string
  ): Promise<boolean> {
    const { data: promoCode, error: fetchError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (fetchError || !promoCode) {
      console.error('Error fetching promo code:', fetchError);
      return false;
    }

    // Check if code is expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return false;
    }

    // Check if code has reached max uses
    if (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses) {
      return false;
    }

    // Grant access using the promo code
    const success = await this.grantPromoAccess(userEmail, promoCode.reason, adminId, {
      expiresAt: promoCode.expires_at,
      promoCode: code,
    });

    if (success) {
      // Increment used count
      await supabase
        .from('promo_codes')
        .update({ used_count: promoCode.used_count + 1 })
        .eq('id', promoCode.id);
    }

    return !!success;
  }

  // Log promo access actions
  private async logPromoAccessAction(
    promoAccessId: string,
    action: 'created' | 'updated' | 'revoked' | 'extended',
    adminId: string,
    changes: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.from('promo_access_logs').insert({
      promo_access_id: promoAccessId,
      action,
      admin_id: adminId,
      changes,
    });

    if (error) {
      console.error('Error logging promo access action:', error);
    }
  }
}

export const promoAccessService = PromoAccessService.getInstance(); 