import { Database } from './supabase';

export type UserRole = 'senior' | 'child' | 'medical';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar_url?: string;
  language: string;
  timezone: string;
  emergency_contacts: EmergencyContact[];
  connected_users: ConnectedUser[];
  medical_info?: MedicalInfo;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

export interface ConnectedUser {
  id: string;
  user_id: string;
  connected_user_id: string;
  relationship: 'child' | 'medical' | 'senior';
  permissions: Permission[];
}

export interface Permission {
  type: 'read' | 'write' | 'monitor' | 'emergency';
  resource: 'health' | 'medications' | 'messages' | 'alerts';
}

export interface MedicalInfo {
  conditions: string[];
  allergies: string[];
  blood_type: string;
  primary_physician: {
    name: string;
    phone: string;
    facility: string;
  };
  insurance: {
    provider: string;
    policy_number: string;
  };
}

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];