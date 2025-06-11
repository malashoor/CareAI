import { supabase } from '@/lib/supabase';

export interface NationalIdConfig {
  pattern: RegExp;
  placeholder: string;
  maxLength: number;
  keyboardType: 'numeric' | 'default';
}

export const COUNTRY_CONFIGS: Record<string, NationalIdConfig> = {
  SA: {
    pattern: /^[0-9]{10}$/,
    placeholder: 'Enter 10-digit ID',
    maxLength: 10,
    keyboardType: 'numeric',
  },
  // Add more countries as needed
  DEFAULT: {
    pattern: /^[a-zA-Z0-9]{5,20}$/,
    placeholder: 'Enter ID',
    maxLength: 20,
    keyboardType: 'default',
  },
};

export async function encryptNationalId(nationalId: string, country: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('encrypt_national_id', {
      p_national_id: nationalId,
      p_country: country,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error encrypting national ID:', error);
    return null;
  }
}

export async function validateNationalId(nationalId: string, country: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('validate_national_id', {
      p_national_id: nationalId,
      p_country: country,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating national ID:', error);
    return false;
  }
}

export async function updateNationalId(
  userId: string,
  nationalId: string,
  country: string
): Promise<boolean> {
  try {
    const encryptedId = await encryptNationalId(nationalId, country);
    if (!encryptedId) return false;

    const { error } = await supabase
      .from('profiles')
      .update({
        national_id_encrypted: encryptedId,
        national_id_country: country,
        national_id_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating national ID:', error);
    return false;
  }
}

export async function getNationalIdConfig(country: string): Promise<NationalIdConfig> {
  return COUNTRY_CONFIGS[country] || COUNTRY_CONFIGS.DEFAULT;
}

export function formatNationalId(nationalId: string, country: string): string {
  const config = COUNTRY_CONFIGS[country] || COUNTRY_CONFIGS.DEFAULT;
  
  // Remove any non-alphanumeric characters
  const cleaned = nationalId.replace(/[^a-zA-Z0-9]/g, '');
  
  // Apply country-specific formatting
  switch (country) {
    case 'SA':
      // Format as XXXX-XXXX-XX
      return cleaned.replace(/(\d{4})(\d{4})(\d{2})/, '$1-$2-$3');
    default:
      return cleaned;
  }
} 