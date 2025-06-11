import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { UserHealthData } from '@/types/health';
import { AuditService } from './audit';

export interface HealthNudge {
  id: string;
  userId: string;
  type: 'medication' | 'exercise' | 'nutrition' | 'sleep' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  expiresAt: Date;
}

export interface NotificationSummary {
  id: string;
  userId: string;
  summary: string;
  notifications: string[];
  createdAt: Date;
}

export interface AIResponse {
  text: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export class AIService {
  private static instance: AIService;
  private readonly OPENAI_API_KEY: string;
  private readonly MODEL: string;
  private readonly MAX_TOKENS: number;
  private readonly TEMPERATURE: number;
  private readonly auditService: AuditService;
  private apiKey: string | null = null;

  private constructor() {
    this.OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-3.5-turbo';
    this.MAX_TOKENS = parseInt(process.env.EXPO_PUBLIC_OPENAI_MAX_TOKENS || '150', 10);
    this.TEMPERATURE = parseFloat(process.env.EXPO_PUBLIC_OPENAI_TEMPERATURE || '0.7');
    this.auditService = AuditService.getInstance();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async setApiKey(key: string): Promise<void> {
    this.apiKey = key;
    // Store the API key securely
    await supabase.auth.updateUser({
      data: { openai_api_key: key }
    });
  }

  private async makeOpenAIRequest(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number
  ): Promise<{ content: string; usage: { total_tokens: number } }> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: this.TEMPERATURE,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  async generateNotificationSummary(
    userId: string,
    notifications: Notification[]
  ): Promise<NotificationSummary | null> {
    try {
      const maxTokens = parseInt(process.env.EXPO_PUBLIC_AI_SUMMARY_MAX_TOKENS || '150', 10);
      const input = JSON.stringify(notifications);

      const { content: summary, usage } = await this.makeOpenAIRequest([
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes notifications in a clear and concise way.',
        },
        {
          role: 'user',
          content: `Please summarize these notifications: ${input}`,
        },
      ], maxTokens);

      const notificationSummary: NotificationSummary = {
        id: crypto.randomUUID(),
        userId,
        summary,
        notifications: notifications.map(n => n.id),
        createdAt: new Date(),
      };

      // Store the summary in Supabase
      const { error } = await supabase
        .from('notification_summaries')
        .insert(notificationSummary);

      if (error) throw error;

      // Log the AI operation
      await this.auditService.logAIOperation({
        userId,
        operation: 'summary',
        model: this.MODEL,
        tokensUsed: usage.total_tokens,
        inputLength: input.length,
        outputLength: summary.length,
        metadata: {
          notificationCount: notifications.length,
        },
      });

      return notificationSummary;
    } catch (error) {
      console.error('Error generating notification summary:', error);
      return null;
    }
  }

  async generateHealthNudge(
    userId: string,
    healthData: UserHealthData
  ): Promise<HealthNudge | null> {
    try {
      const maxTokens = parseInt(process.env.EXPO_PUBLIC_AI_NUDGE_MAX_TOKENS || '100', 10);
      const input = JSON.stringify(healthData);

      const { content: message, usage } = await this.makeOpenAIRequest([
        {
          role: 'system',
          content: 'You are a healthcare AI assistant that provides personalized health nudges based on user data.',
        },
        {
          role: 'user',
          content: `Generate a health nudge based on this user data: ${input}`,
        },
      ], maxTokens);

      const healthNudge: HealthNudge = {
        id: crypto.randomUUID(),
        userId,
        type: this.determineNudgeType(healthData),
        message,
        priority: this.determinePriority(healthData),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      // Store the nudge in Supabase
      const { error } = await supabase
        .from('health_nudges')
        .insert(healthNudge);

      if (error) throw error;

      // Log the AI operation
      await this.auditService.logAIOperation({
        userId,
        operation: 'nudge',
        model: this.MODEL,
        tokensUsed: usage.total_tokens,
        inputLength: input.length,
        outputLength: message.length,
        metadata: {
          nudgeType: healthNudge.type,
          priority: healthNudge.priority,
        },
      });

      return healthNudge;
    } catch (error) {
      console.error('Error generating health nudge:', error);
      return null;
    }
  }

  private determineNudgeType(healthData: UserHealthData): HealthNudge['type'] {
    // Implement logic to determine the most relevant nudge type
    // based on the user's health data
    return 'general';
  }

  private determinePriority(healthData: UserHealthData): HealthNudge['priority'] {
    // Implement logic to determine the priority of the nudge
    // based on the user's health data
    return 'medium';
  }

  async getRecentSummaries(userId: string): Promise<NotificationSummary[]> {
    try {
      const { data, error } = await supabase
        .from('notification_summaries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recent summaries:', error);
      return [];
    }
  }

  async getActiveNudges(userId: string): Promise<HealthNudge[]> {
    try {
      const { data, error } = await supabase
        .from('health_nudges')
        .select('*')
        .eq('user_id', userId)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching active nudges:', error);
      return [];
    }
  }

  async testAPIConnection(): Promise<{ success: boolean; message: string; usage?: { total_tokens: number } }> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.',
            },
            {
              role: 'user',
              content: 'Say "API connection successful" if you can read this message.',
            },
          ],
          max_tokens: 10,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: `API Error: ${errorData.error?.message || response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.choices[0].message.content,
        usage: data.usage,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async analyzeText(text: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      // TODO: Implement actual OpenAI API call
      return {
        text: 'Sample analysis',
        confidence: 0.95,
        metadata: {
          model: 'gpt-4',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }
}

export const aiService = AIService.getInstance(); 