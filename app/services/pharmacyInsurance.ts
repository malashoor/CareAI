import { supabase } from '@/lib/supabase';

export type InsuranceClaimType = 'medical' | 'pharmacy' | 'dental' | 'vision';
export type InsuranceClaimStatus = 'pending' | 'approved' | 'rejected';
export type PharmacyRefillStatus = 'pending' | 'approved' | 'rejected' | 'filled';

export interface PharmacyRefill {
  id: string;
  userId: string;
  prescriptionId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: Date;
  completionDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceClaim {
  id: string;
  userId: string;
  claimNumber: string;
  claimType: InsuranceClaimType;
  serviceDate: Date;
  amount: number;
  status: InsuranceClaimStatus;
  processedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  countryCode: string;
  providerCode: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function getInsuranceClaim(claimId: string): Promise<InsuranceClaim> {
  const { data, error } = await supabase
    .from('insurance_claims')
    .select('*')
    .eq('id', claimId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateInsuranceClaim(
  claimId: string,
  updates: Partial<InsuranceClaim>
): Promise<InsuranceClaim> {
  const { data, error } = await supabase
    .from('insurance_claims')
    .update(updates)
    .eq('id', claimId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserClaims(userId: string): Promise<InsuranceClaim[]> {
  const { data, error } = await supabase
    .from('insurance_claims')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPharmacyRefills(userId: string): Promise<PharmacyRefill[]> {
  const { data, error } = await supabase
    .from('pharmacy_refills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPharmacyRefill(
  userId: string,
  refill: Omit<PharmacyRefill, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<PharmacyRefill | null> {
  const { data, error } = await supabase
    .from('pharmacy_refills')
    .insert({
      ...refill,
      user_id: userId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pharmacy refill:', error);
    return null;
  }

  return data;
}

export async function getInsuranceProviders(countryCode: string): Promise<InsuranceProvider[]> {
  const { data, error } = await supabase
    .from('insurance_providers')
    .select('*')
    .eq('country_code', countryCode)
    .order('name');

  if (error) throw error;
  return data;
}

export async function createInsuranceClaim(
  userId: string,
  claim: Omit<InsuranceClaim, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<InsuranceClaim | null> {
  const { data, error } = await supabase
    .from('insurance_claims')
    .insert([
      {
        ...claim,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInsuranceClaim(claimId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('insurance_claims')
    .delete()
    .eq('id', claimId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateClaimStatus(
  claimId: string,
  status: InsuranceClaimStatus,
  processedDate?: Date
): Promise<boolean> {
  const { error } = await supabase
    .from('insurance_claims')
    .update({
      status,
      processed_date: processedDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', claimId);

  if (error) throw error;
  return true;
}

export async function updateRefillStatus(
  refillId: string,
  status: PharmacyRefill['status']
): Promise<boolean> {
  const { error } = await supabase
    .from('pharmacy_refills')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', refillId);

  if (error) {
    console.error('Error updating refill status:', error);
    return false;
  }

  return true;
}

export async function deletePharmacyRefill(refillId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('pharmacy_refills')
    .delete()
    .eq('id', refillId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getPharmacyRefill(userId: string, refillId: string): Promise<PharmacyRefill | null> {
  const { data, error } = await supabase
    .from('pharmacy_refills')
    .select('*')
    .eq('id', refillId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching pharmacy refill:', error);
    return null;
  }

  return data;
} 