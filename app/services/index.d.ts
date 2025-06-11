declare module '@/services/pharmacyInsurance' {
  export interface InsuranceClaim {
    id: string;
    userId: string;
    claimNumber: string;
    serviceDate: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    description?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }

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

  export interface InsuranceProvider {
    id: string;
    name: string;
    country_code: string;
    provider_code: string;
    contact_info?: {
      phone?: string;
      email?: string;
      website?: string;
    };
    created_at: Date;
    updated_at: Date;
  }

  export function getInsuranceClaim(claimId: string): Promise<InsuranceClaim>;
  export function updateInsuranceClaim(claimId: string, updates: Partial<InsuranceClaim>): Promise<InsuranceClaim>;
  export function getUserClaims(userId: string): Promise<InsuranceClaim[]>;
  export function getPharmacyRefills(userId: string): Promise<PharmacyRefill[]>;
  export function createPharmacyRefill(userId: string, refill: Omit<PharmacyRefill, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>): Promise<PharmacyRefill | null>;
  export function getInsuranceProviders(countryCode: string): Promise<InsuranceProvider[]>;
  export function createInsuranceClaim(userId: string, claim: Omit<InsuranceClaim, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<InsuranceClaim | null>;
  export function deleteInsuranceClaim(claimId: string, userId: string): Promise<void>;
  export function updateClaimStatus(claimId: string, status: InsuranceClaim['status'], processedDate?: Date): Promise<boolean>;
  export function updateRefillStatus(refillId: string, status: PharmacyRefill['status']): Promise<boolean>;
  export function deletePharmacyRefill(refillId: string, userId: string): Promise<void>;
  export function getPharmacyRefill(userId: string, refillId: string): Promise<PharmacyRefill | null>;
} 