export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'caregiver';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 