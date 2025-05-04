export type GiftedUserStatus = 'pending' | 'invited' | 'accepted' | 'expired';

export interface GiftedUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  region: string;
  charity_name?: string;
  note?: string;
  status: GiftedUserStatus;
  gifted_by: string;
  created_at: string;
  updated_at: string;
}

export interface GiftedUserFilters {
  region?: string;
  status?: GiftedUserStatus;
  charity_name?: string;
  search?: string;
}

export interface GiftedUserFormData {
  full_name: string;
  email: string;
  phone?: string;
  region: string;
  charity_name?: string;
  note?: string;
} 