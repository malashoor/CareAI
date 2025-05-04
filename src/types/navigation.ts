import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AdminStackParamList = {
  PromotionsManagement: undefined;
  PromotionsCreate: undefined;
  PromotionsEdit: { promotionId: string };
  DiscountsManagement: undefined;
  DiscountsCreate: undefined;
  DiscountsEdit: { discountId: string };
  SystemSettings: undefined;
};

export type AdminNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

// Promotion types
export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUses: number;
  currentUses: number;
  createdAt: string;
  updatedAt: string;
}

// Discount types
export interface Discount {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'value';
  discountValue: number;
  startDate: string;
  endDate: string;
  expiresAt: string | null;
  isActive: boolean;
  maxUses: number;
  currentUses: number;
  createdAt: string;
  updatedAt: string;
  conditions?: {
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    applicableProducts?: string[];
    excludedProducts?: string[];
  };
}

// System settings types
export interface SystemSettings {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxPromotionsPerUser: number;
  maxDiscountsPerUser: number;
  defaultPromotionDuration: number;
  defaultDiscountDuration: number;
}

export type RootStackParamList = {
  Home: undefined;
  Scan: undefined;
  Profile: undefined;
  MedicationTest: undefined;
};

export type RootStackNavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
}; 