import { supabase } from '@/lib/supabase';

export interface AIAuditLog {
  id: string;
  userId: string;
  operation: 'summary' | 'nudge';
  model: string;
  tokensUsed: number;
  inputLength: number;
  outputLength: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class AuditService {
  private static instance: AuditService;
  private readonly enabled: boolean;

  private constructor() {
    this.enabled = process.env.EXPO_PUBLIC_AI_AUDIT_ENABLED === 'true';
  }

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  async logAIOperation(log: Omit<AIAuditLog, 'id' | 'timestamp'>): Promise<void> {
    if (!this.enabled) return;

    try {
      const { error } = await supabase
        .from('ai_audit_logs')
        .insert({
          ...log,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging AI operation:', error);
    }
  }

  async getAIOperations(userId: string): Promise<AIAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('ai_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI operations:', error);
      return [];
    }
  }
} 