export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'medication' | 'appointment' | 'refill' | 'claim' | 'healthAlert';
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
} 