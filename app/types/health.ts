export interface UserHealthData {
  userId: string;
  medications: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    lastTaken?: Date;
    nextDose?: Date;
  }[];
  appointments: {
    id: string;
    type: string;
    date: Date;
    status: 'scheduled' | 'completed' | 'cancelled';
  }[];
  vitals: {
    type: string;
    value: number;
    unit: string;
    timestamp: Date;
  }[];
  activity: {
    type: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    timestamp: Date;
  }[];
  sleep: {
    duration: number;
    quality: 'poor' | 'fair' | 'good';
    timestamp: Date;
  }[];
  nutrition: {
    meals: {
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      timestamp: Date;
      calories?: number;
    }[];
    waterIntake: {
      amount: number;
      unit: string;
      timestamp: Date;
    }[];
  };
  lastUpdated: Date;
} 