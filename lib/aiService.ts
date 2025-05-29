import { Platform } from 'react-native';

interface EmotionAnalysis {
  emotion: 'happy' | 'sad' | 'anxious' | 'excited' | 'neutral' | 'concerned' | 'frustrated' | 'grateful';
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

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
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

  generateResponse(userMessage: string, context: ConversationContext): AIResponse {
    const emotion = this.analyzeEmotion(userMessage);
    const history = this.conversationHistory.get(context.userId) || [];
    
    // Update conversation history
    history.push(userMessage);
    if (history.length > 10) {
      history.shift(); // Keep only last 10 messages
    }
    this.conversationHistory.set(context.userId, history);

    // Generate contextual response based on emotion and content
    const response = this.getContextualResponse(userMessage, emotion, context, history);
    
    return {
      text: response.text,
      emotion: response.emotion,
      suggestions: response.suggestions,
      followUpQuestions: response.followUpQuestions
    };
  }

  private getContextualResponse(
    message: string, 
    emotion: EmotionAnalysis, 
    context: ConversationContext,
    history: string[]
  ): AIResponse {
    const lowerMessage = message.toLowerCase();
    
    // Health-related responses
    if (this.isHealthRelated(lowerMessage)) {
      return this.getHealthResponse(message, emotion, context);
    }
    
    // Medication-related responses
    if (this.isMedicationRelated(lowerMessage)) {
      return this.getMedicationResponse(message, emotion, context);
    }
    
    // Emotional support responses
    if (emotion.emotion !== 'neutral') {
      return this.getEmotionalResponse(message, emotion, context);
    }
    
    // General conversation responses
    return this.getGeneralResponse(message, emotion, context, history);
  }

  private isHealthRelated(message: string): boolean {
    const healthKeywords = ['pain', 'hurt', 'sick', 'doctor', 'appointment', 'symptom', 'health', 'medical', 'hospital', 'treatment'];
    return healthKeywords.some(keyword => message.includes(keyword));
  }

  private isMedicationRelated(message: string): boolean {
    const medKeywords = ['medication', 'medicine', 'pill', 'dose', 'prescription', 'drug', 'tablet'];
    return medKeywords.some(keyword => message.includes(keyword));
  }

  private getHealthResponse(message: string, emotion: EmotionAnalysis, context: ConversationContext): AIResponse {
    const responses = {
      pain: [
        "I'm sorry to hear you're experiencing pain. Can you tell me more about where it hurts?",
        "Pain can be concerning. Have you spoken with your healthcare provider about this?",
        "I understand pain can be difficult to manage. Would you like some gentle breathing exercises?"
      ],
      doctor: [
        "Doctor appointments can feel overwhelming. Would you like help preparing questions to ask?",
        "It's great that you're staying on top of your healthcare. How are you feeling about the appointment?",
        "Medical visits are important. Is there anything specific you'd like to discuss with your doctor?"
      ],
      sick: [
        "I'm sorry you're not feeling well. Make sure to rest and stay hydrated.",
        "Being sick is never fun. Have you been able to get enough rest?",
        "Your health is important. Don't hesitate to contact your healthcare provider if you're concerned."
      ]
    };

    const category = message.includes('pain') ? 'pain' : 
                    message.includes('doctor') || message.includes('appointment') ? 'doctor' : 'sick';
    
    const responseOptions = responses[category];
    const selectedResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];

    return {
      text: selectedResponse,
      emotion: 'empathetic',
      suggestions: [
        "Tell me more about how you're feeling",
        "Would you like some relaxation techniques?",
        "Should we contact your caregiver?"
      ],
      followUpQuestions: [
        "How long have you been experiencing this?",
        "On a scale of 1-10, how would you rate your discomfort?",
        "Have you taken any medication for this?"
      ]
    };
  }

  private getMedicationResponse(message: string, emotion: EmotionAnalysis, context: ConversationContext): AIResponse {
    const responses = [
      "Medication management is important for your health. Are you having trouble remembering to take your medications?",
      "I can help you set up medication reminders. Would that be helpful?",
      "It's great that you're thinking about your medications. Do you have any questions about them?",
      "Staying consistent with medications can be challenging. How has your routine been going?"
    ];

    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      text: selectedResponse,
      emotion: 'supportive',
      suggestions: [
        "Set up medication reminders",
        "Review medication schedule",
        "Contact pharmacist with questions"
      ],
      followUpQuestions: [
        "Do you take your medications at the same time each day?",
        "Have you experienced any side effects?",
        "Would you like help organizing your medication schedule?"
      ]
    };
  }

  private getEmotionalResponse(message: string, emotion: EmotionAnalysis, context: ConversationContext): AIResponse {
    const responses = {
      happy: [
        "I'm so glad to hear you're feeling happy! What's bringing you joy today?",
        "Your happiness is wonderful to see! Would you like to share what's making you feel good?",
        "It's beautiful when you feel happy. These positive moments are so important!"
      ],
      sad: [
        "I can hear that you're feeling sad, and that's okay. Sometimes we all need to feel our emotions.",
        "I'm here with you during this difficult time. Would you like to talk about what's troubling you?",
        "Sadness is a natural part of life. You don't have to go through this alone."
      ],
      anxious: [
        "I understand you're feeling anxious. Let's take this one step at a time together.",
        "Anxiety can feel overwhelming, but you're not alone. Would some breathing exercises help?",
        "I hear your worry, and it's completely valid. What's weighing on your mind most right now?"
      ],
      excited: [
        "Your excitement is contagious! I love hearing about what makes you feel this energized.",
        "It's wonderful to see you so excited! Tell me more about what's got you feeling this way.",
        "Your enthusiasm brightens my day! What's this exciting news you'd like to share?"
      ],
      frustrated: [
        "I can sense your frustration, and that must be really difficult right now.",
        "Frustration is tough to handle. Would you like to talk through what's bothering you?",
        "It sounds like you're going through a challenging time. I'm here to listen."
      ],
      grateful: [
        "Gratitude is such a beautiful feeling. I'm touched that you're sharing this with me.",
        "It's wonderful to hear your appreciation. Gratitude can really brighten our perspective.",
        "Thank you for sharing your gratitude with me. What are you most thankful for today?"
      ]
    };

    const emotionResponses = responses[emotion.emotion] || responses.sad;
    const selectedResponse = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];

    const suggestions = this.getEmotionalSuggestions(emotion.emotion);
    const followUps = this.getEmotionalFollowUps(emotion.emotion);

    return {
      text: selectedResponse,
      emotion: 'empathetic',
      suggestions,
      followUpQuestions: followUps
    };
  }

  private getGeneralResponse(message: string, emotion: EmotionAnalysis, context: ConversationContext, history: string[]): AIResponse {
    const timeBasedGreetings = {
      morning: [
        "Good morning! How are you starting your day?",
        "I hope you're having a peaceful morning. What's on your mind?",
        "Morning is a fresh start! How are you feeling today?"
      ],
      afternoon: [
        "Good afternoon! How has your day been going so far?",
        "I hope your afternoon is treating you well. What would you like to chat about?",
        "Afternoon check-in! How are you doing today?"
      ],
      evening: [
        "Good evening! How was your day?",
        "I hope you're winding down nicely this evening. What's on your mind?",
        "Evening is a good time to reflect. How are you feeling?"
      ],
      night: [
        "It's getting late! How are you doing tonight?",
        "I hope you're having a peaceful evening. What would you like to talk about?",
        "Nighttime can be a good time for conversation. What's on your mind?"
      ]
    };

    const generalResponses = [
      "I'm here to listen and support you. What would you like to talk about?",
      "Thank you for sharing with me. How can I help you today?",
      "I appreciate you taking the time to chat with me. What's important to you right now?",
      "Every conversation with you is meaningful to me. What's on your heart today?",
      "I'm glad we can spend this time together. How are you really doing?",
      "Your thoughts and feelings matter to me. What would you like to explore together?"
    ];

    // Use time-based greeting if it's early in conversation
    const isEarlyConversation = history.length <= 2;
    let selectedResponse: string;

    if (isEarlyConversation && Math.random() > 0.5) {
      const timeResponses = timeBasedGreetings[context.timeOfDay];
      selectedResponse = timeResponses[Math.floor(Math.random() * timeResponses.length)];
    } else {
      selectedResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    return {
      text: selectedResponse,
      emotion: 'friendly',
      suggestions: [
        "Tell me about your day",
        "Share something that's important to you",
        "Ask me anything you'd like to know"
      ],
      followUpQuestions: [
        "What's been the best part of your day so far?",
        "Is there anything you'd like to talk through?",
        "How are you taking care of yourself today?"
      ]
    };
  }

  private getEmotionalSuggestions(emotion: EmotionAnalysis['emotion']): string[] {
    const suggestions = {
      happy: [
        "Share more about what's making you happy",
        "Celebrate this positive moment",
        "Think about what you're grateful for"
      ],
      sad: [
        "Talk through your feelings",
        "Try some gentle breathing exercises",
        "Reach out to someone you trust"
      ],
      anxious: [
        "Practice deep breathing",
        "Try grounding techniques",
        "Talk to your healthcare provider"
      ],
      excited: [
        "Tell me more about your excitement",
        "Share your good news",
        "Enjoy this positive energy"
      ],
      frustrated: [
        "Take a moment to breathe",
        "Talk through what's bothering you",
        "Consider taking a short break"
      ],
      grateful: [
        "Share what you're thankful for",
        "Reflect on positive moments",
        "Express gratitude to someone special"
      ]
    };

    return suggestions[emotion] || suggestions.sad;
  }

  private getEmotionalFollowUps(emotion: EmotionAnalysis['emotion']): string[] {
    const followUps = {
      happy: [
        "What specifically is bringing you this joy?",
        "How long have you been feeling this way?",
        "Would you like to share this happiness with someone?"
      ],
      sad: [
        "What's been weighing on your heart?",
        "How long have you been feeling this way?",
        "Is there anything that usually helps when you feel sad?"
      ],
      anxious: [
        "What's causing you the most worry right now?",
        "Have you experienced this anxiety before?",
        "What usually helps you feel calmer?"
      ],
      excited: [
        "What's got you feeling so energized?",
        "When did this excitement start?",
        "Who else knows about this exciting news?"
      ],
      frustrated: [
        "What's the main source of your frustration?",
        "How long have you been feeling this way?",
        "What would help you feel better right now?"
      ],
      grateful: [
        "What are you most grateful for today?",
        "Who or what has made a positive impact on you?",
        "How does expressing gratitude make you feel?"
      ]
    };

    return followUps[emotion] || followUps.sad;
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
}

export const aiService = AIService.getInstance();
export type { EmotionAnalysis, ConversationContext, AIResponse }; 