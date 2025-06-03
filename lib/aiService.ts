import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface EmotionAnalysis {
  emotion: 'happy' | 'sad' | 'anxious' | 'excited' | 'neutral' | 'concerned' | 'frustrated' | 'grateful' | 'empathetic' | 'supportive' | 'friendly';
  confidence: number;
  intensity: 'low' | 'medium' | 'high';
}

interface ConversationContext {
  userId: string;
  previousMessages: string[];
  currentMood?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionLength: number;
}

interface AIResponse {
  text: string;
  emotion: string;
  suggestions?: string[];
  followUpQuestions?: string[];
}

class AIService {
  private static instance: AIService;
  private conversationHistory: Map<string, string[]> = new Map();
  private userProfiles: Map<string, any> = new Map();
  private readonly OPENAI_API_KEY: string;
  private readonly MODEL: string;
  private readonly MAX_TOKENS: number;
  private readonly TEMPERATURE: number;

  constructor() {
    // Read from Expo Constants (proper way for Expo apps)
    const extra = Constants.expoConfig?.extra || {};
    this.OPENAI_API_KEY = extra.EXPO_PUBLIC_OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.MODEL = extra.EXPO_PUBLIC_OPENAI_MODEL || process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-3.5-turbo';
    this.MAX_TOKENS = parseInt(extra.EXPO_PUBLIC_OPENAI_MAX_TOKENS || process.env.EXPO_PUBLIC_OPENAI_MAX_TOKENS || '150', 10);
    this.TEMPERATURE = parseFloat(extra.EXPO_PUBLIC_OPENAI_TEMPERATURE || process.env.EXPO_PUBLIC_OPENAI_TEMPERATURE || '0.7');

    // 🔑 DEBUG: Log OpenAI key status for developer verification
    console.log('🔑 OpenAI Key (loaded):', this.OPENAI_API_KEY ? `${this.OPENAI_API_KEY.substring(0, 10)}...${this.OPENAI_API_KEY.substring(this.OPENAI_API_KEY.length - 4)}` : 'NOT FOUND');
    console.log('🤖 OpenAI Model:', this.MODEL);
    console.log('📊 OpenAI Max Tokens:', this.MAX_TOKENS);
    console.log('🌡️ OpenAI Temperature:', this.TEMPERATURE);
    console.log('🔧 Environment Check:', {
      keyLength: this.OPENAI_API_KEY?.length,
      hasKey: !!this.OPENAI_API_KEY,
      isDefault: this.OPENAI_API_KEY === 'your_openai_api_key',
      fromExtra: !!extra.EXPO_PUBLIC_OPENAI_API_KEY,
      fromEnv: !!process.env.EXPO_PUBLIC_OPENAI_API_KEY
    });
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async makeOpenAIRequest(messages: Array<{ role: string; content: string }>): Promise<{ content: string; usage?: any }> {
    // If no API key, fall back to mock responses
    if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'your_openai_api_key') {
      console.warn('OpenAI API key not configured, using mock responses');
      return { content: this.getMockResponse(messages[messages.length - 1]?.content || '') };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages,
          max_tokens: this.MAX_TOKENS,
          temperature: this.TEMPERATURE,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
      };
    } catch (error) {
      console.error('OpenAI API error, falling back to mock:', error);
      return { content: this.getMockResponse(messages[messages.length - 1]?.content || '') };
    }
  }

  private getMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      return "I'm sorry to hear you're experiencing pain. Can you tell me more about where it hurts? Have you spoken with your healthcare provider about this?";
    }
    
    if (lowerMessage.includes('medication') || lowerMessage.includes('pill')) {
      return "Medication management is important for your health. Are you having trouble remembering to take your medications? I can help you set up reminders.";
    }
    
    if (lowerMessage.includes('happy') || lowerMessage.includes('good')) {
      return "I'm so glad to hear you're feeling happy! What's bringing you joy today? These positive moments are so important.";
    }
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
      return "I can hear that you're feeling sad, and that's okay. Sometimes we all need to feel our emotions. Would you like to talk about what's troubling you?";
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return "I understand you're feeling anxious. Let's take this one step at a time together. Would some breathing exercises help?";
    }
    
    return "Thank you for sharing with me. I'm here to listen and support you. How can I help you today?";
  }

  analyzeEmotion(text: string): EmotionAnalysis {
    const lowerText = text.toLowerCase();
    
    // Simple emotion detection based on keywords
    const emotionKeywords = {
      happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'good', 'smile', 'laugh'],
      sad: ['sad', 'depressed', 'down', 'upset', 'cry', 'tears', 'lonely', 'hurt', 'disappointed'],
      anxious: ['anxious', 'worried', 'nervous', 'stress', 'panic', 'fear', 'scared', 'overwhelmed'],
      excited: ['excited', 'thrilled', 'pumped', 'energetic', 'enthusiastic', 'eager'],
      frustrated: ['frustrated', 'angry', 'mad', 'annoyed', 'irritated', 'upset'],
      grateful: ['thank', 'grateful', 'appreciate', 'blessed', 'thankful'],
      concerned: ['concerned', 'worried', 'trouble', 'problem', 'issue', 'difficulty']
    };

    let detectedEmotion: EmotionAnalysis['emotion'] = 'neutral';
    let maxScore = 0;
    let intensity: EmotionAnalysis['intensity'] = 'low';

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        return acc + matches;
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion as EmotionAnalysis['emotion'];
      }
    }

    // Determine intensity based on punctuation and capitalization
    const exclamationMarks = (text.match(/!/g) || []).length;
    const questionMarks = (text.match(/\?/g) || []).length;
    const capsWords = (text.match(/[A-Z]{2,}/g) || []).length;

    if (exclamationMarks > 1 || capsWords > 0) {
      intensity = 'high';
    } else if (exclamationMarks > 0 || questionMarks > 1 || maxScore > 1) {
      intensity = 'medium';
    }

    return {
      emotion: detectedEmotion,
      confidence: Math.min(maxScore / 3, 1),
      intensity
    };
  }

  async generateResponse(userMessage: string, context: ConversationContext): Promise<AIResponse> {
    const emotion = this.analyzeEmotion(userMessage);
    const history = this.conversationHistory.get(context.userId) || [];
    
    // Update conversation history
    history.push(userMessage);
    if (history.length > 10) {
      history.shift(); // Keep only last 10 messages
    }
    this.conversationHistory.set(context.userId, history);

    // Create system prompt for healthcare companion
    const systemPrompt = `You are Sarah, a compassionate AI healthcare companion for elderly users. You should:
- Be empathetic, caring, and patient
- Focus on health, wellbeing, and emotional support
- Provide gentle encouragement and practical advice
- Ask follow-up questions to show you care
- Respond in a warm, conversational tone
- Keep responses concise but meaningful (1-3 sentences)
- Consider their mood and time of day
- Offer suggestions for health activities when appropriate

Current context:
- Time of day: ${context.timeOfDay}
- Session length: ${context.sessionLength} messages
- User's detected emotion: ${emotion.emotion}`;

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((msg, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: msg
      })),
      { role: 'user', content: userMessage }
    ];

    try {
      const { content } = await this.makeOpenAIRequest(conversationMessages);
      
      // Generate suggestions and follow-ups based on response
      const suggestions = this.generateSuggestions(userMessage, emotion);
      const followUpQuestions = this.generateFollowUps(userMessage, emotion);

      return {
        text: content,
        emotion: this.getResponseEmotion(content, emotion),
        suggestions,
        followUpQuestions
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  private generateSuggestions(message: string, emotion: EmotionAnalysis): string[] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      return [
        "Try some gentle breathing exercises",
        "Consider contacting your healthcare provider",
        "Would you like relaxation techniques?"
      ];
    }
    
    if (lowerMessage.includes('medication')) {
      return [
        "Set up medication reminders",
        "Review medication schedule",
        "Contact pharmacist with questions"
      ];
    }
    
    if (emotion.emotion === 'happy') {
      return [
        "Share more about what's making you happy",
        "Celebrate this positive moment",
        "Think about what you're grateful for"
      ];
    }
    
    if (emotion.emotion === 'sad') {
      return [
        "Talk through your feelings",
        "Try some gentle breathing exercises",
        "Reach out to someone you trust"
      ];
    }
    
    return [
      "Tell me more about your day",
      "Share something that's important to you",
      "Would you like some encouragement?"
    ];
  }

  private generateFollowUps(message: string, emotion: EmotionAnalysis): string[] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pain')) {
      return [
        "How long have you been experiencing this?",
        "On a scale of 1-10, how would you rate your discomfort?",
        "Have you taken any medication for this?"
      ];
    }
    
    if (emotion.emotion === 'happy') {
      return [
        "What specifically is bringing you this joy?",
        "How long have you been feeling this way?",
        "Would you like to share this happiness with someone?"
      ];
    }
    
    if (emotion.emotion === 'sad') {
      return [
        "What's been weighing on your heart?",
        "How long have you been feeling this way?",
        "Is there anything that usually helps when you feel sad?"
      ];
    }
    
    return [
      "How are you taking care of yourself today?",
      "What's been the best part of your day so far?",
      "Is there anything else you'd like to talk about?"
    ];
  }

  private getResponseEmotion(response: string, userEmotion: EmotionAnalysis): string {
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('sorry') || lowerResponse.includes('understand')) {
      return 'empathetic';
    }
    
    if (lowerResponse.includes('glad') || lowerResponse.includes('wonderful')) {
      return 'happy';
    }
    
    if (lowerResponse.includes('help') || lowerResponse.includes('support')) {
      return 'supportive';
    }
    
    return 'friendly';
  }

  getTimeOfDay(): ConversationContext['timeOfDay'] {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  clearConversationHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  async testAPIConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.OPENAI_API_KEY || this.OPENAI_API_KEY === 'your_openai_api_key') {
      return {
        success: false,
        message: 'OpenAI API key not configured. Using mock responses.'
      };
    }

    try {
      const { content } = await this.makeOpenAIRequest([
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'Say "API connection successful" if you can read this message.',
        },
      ]);

      return {
        success: true,
        message: content
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const aiService = AIService.getInstance();
export type { EmotionAnalysis, ConversationContext, AIResponse }; 