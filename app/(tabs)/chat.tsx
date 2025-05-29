import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Mic,
  Send,
  Volume2 as VolumeUp,
  Brain,
  MessageSquare,
  Heart,
  SmilePlus,
  MicOff,
  Lightbulb,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { aiService, type AIResponse, type EmotionAnalysis } from '@/lib/aiService';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotion?: string;
  suggestions?: string[];
  followUpQuestions?: string[];
};

const quickResponses = [
  {
    text: "I'm feeling good today",
    icon: Heart,
    color: ['#FF2D55', '#FF0066'],
  },
  {
    text: "Let's chat about something fun",
    icon: SmilePlus,
    color: ['#34C759', '#32D74B'],
  },
  {
    text: "I need some help",
    icon: Brain,
    color: ['#007AFF', '#0055FF'],
  },
];

const emotionColors = {
  happy: '#34C759',
  sad: '#5856D6',
  anxious: '#FF9500',
  excited: '#FF2D55',
  neutral: '#8E8E93',
  concerned: '#FF9500',
  frustrated: '#FF3B30',
  grateful: '#34C759',
  empathetic: '#007AFF',
  supportive: '#32D74B',
  friendly: '#007AFF',
};

export default function ChatScreen() {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Sarah, your AI companion. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
      emotion: 'friendly',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Request audio permissions on mount
    requestAudioPermissions();
  }, []);

  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Audio permission not granted');
      }
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
    }
  };

  const speakMessage = async (text: string, emotion?: string) => {
    try {
      const speechOptions: Speech.SpeechOptions = {
        rate: 0.8,
        pitch: emotion === 'excited' ? 1.2 : emotion === 'sad' ? 0.8 : 1.0,
        language: isRTL ? 'ar' : 'en',
      };

      await Speech.speak(text, speechOptions);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error speaking message:', error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // For now, we'll simulate voice-to-text
      // In a real app, you'd use a speech-to-text service
      const simulatedTranscript = "I said something using voice input";
      setInputText(simulatedTranscript);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Alert.alert(
        'Voice Input',
        'Voice recording completed. In a real app, this would be transcribed to text.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<AIResponse> => {
    const context = {
      userId: user?.id || 'anonymous',
      previousMessages: messages.map(m => m.text),
      timeOfDay: aiService.getTimeOfDay(),
      sessionLength: messages.length,
    };

    return aiService.generateResponse(userMessage, context);
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage.text);
      
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        sender: 'ai',
        timestamp: new Date(),
        emotion: aiResponse.emotion,
        suggestions: aiResponse.suggestions,
        followUpQuestions: aiResponse.followUpQuestions,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Show suggestions if available
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setCurrentSuggestions(aiResponse.suggestions);
        setShowSuggestions(true);
      }

      // Speak the response
      await speakMessage(aiMessage.text, aiMessage.emotion);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsTyping(false);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble processing that right now. Could you try again?",
        sender: 'ai',
        timestamp: new Date(),
        emotion: 'concerned',
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      await speakMessage(fallbackMessage.text, fallbackMessage.emotion);
    }
  }, [inputText, messages, user]);

  const handleQuickResponse = (response: string) => {
    setInputText(response);
    setTimeout(() => handleSend(), 100);
  };

  const handleSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  };

  const readAllMessages = async () => {
    const allText = messages
      .filter(msg => msg.sender === 'ai')
      .map(msg => msg.text)
      .join('. ');
    await speakMessage(allText);
  };

  const getEmotionColor = (emotion?: string): string => {
    return emotion ? emotionColors[emotion as keyof typeof emotionColors] || emotionColors.neutral : emotionColors.neutral;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isRTL && styles.rtlContainer]}
      keyboardVerticalOffset={92}>
      
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={[styles.aiInfo, isRTL && styles.aiInfoRTL]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
            style={styles.aiAvatar}
          />
          <View style={styles.aiDetails}>
            <Text style={[styles.aiName, isRTL && styles.rtlText]}>Sarah</Text>
            <Text style={[styles.aiRole, isRTL && styles.rtlText]}>AI Companion</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.readAllButton}
          onPress={readAllMessages}
          accessibilityRole="button"
          accessibilityLabel="Read all AI messages">
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            style={styles.readAllGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <VolumeUp color="#FFF" size={24} />
            <Text style={styles.readAllText}>Read All</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}>
        {messages.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
              isRTL && styles.messageWrapperRTL,
            ]}
            onPress={() => speakMessage(message.text, message.emotion)}
            accessibilityRole="button"
            accessibilityLabel={`${message.sender === 'user' ? 'Your' : 'AI'} message: ${message.text}`}>
            
            {message.sender === 'ai' && !isRTL && (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                style={styles.messageAvatar}
              />
            )}
            
            <View
              style={[
                styles.message,
                message.sender === 'user' ? styles.userMessage : styles.aiMessage,
                message.emotion && { borderLeftWidth: 4, borderLeftColor: getEmotionColor(message.emotion) },
              ]}>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                isRTL && styles.rtlText,
              ]}>
                {message.text}
              </Text>
              
              {message.emotion && (
                <View style={styles.emotionIndicator}>
                  <View style={[styles.emotionDot, { backgroundColor: getEmotionColor(message.emotion) }]} />
                  <Text style={[styles.emotionText, isRTL && styles.rtlText]}>
                    {message.emotion}
                  </Text>
                </View>
              )}
            </View>
            
            {message.sender === 'ai' && (
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => speakMessage(message.text, message.emotion)}
                accessibilityRole="button"
                accessibilityLabel="Listen to message">
                <VolumeUp color="#007AFF" size={20} />
              </TouchableOpacity>
            )}

            {message.sender === 'ai' && isRTL && (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                style={styles.messageAvatar}
              />
            )}
          </TouchableOpacity>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
              style={styles.messageAvatar}
            />
            <View style={[styles.message, styles.aiMessage, styles.typingMessage]}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={[styles.typingText, isRTL && styles.rtlText]}>Sarah is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggestions */}
      {showSuggestions && currentSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Lightbulb color="#FF9500" size={20} />
            <Text style={[styles.suggestionsTitle, isRTL && styles.rtlText]}>Suggestions</Text>
          </View>
          {currentSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestion(suggestion)}
              accessibilityRole="button"
              accessibilityLabel={`Suggestion: ${suggestion}`}>
              <Text style={[styles.suggestionText, isRTL && styles.rtlText]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Responses */}
      <View style={styles.quickResponses}>
        {quickResponses.map((response, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickResponse}
            onPress={() => handleQuickResponse(response.text)}
            accessibilityRole="button"
            accessibilityLabel={`Quick response: ${response.text}`}>
            <LinearGradient
              colors={response.color}
              style={styles.quickResponseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <response.icon color="#FFF" size={20} />
              <Text style={[styles.quickResponseText, isRTL && styles.rtlText]}>{response.text}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Container */}
      <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={handleVoiceInput}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? 'Stop voice recording' : 'Start voice recording'}>
          <LinearGradient
            colors={isRecording ? ['#FF3B30', '#FF2D55'] : ['#007AFF', '#0055FF']}
            style={styles.voiceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            {isRecording ? <MicOff color="#FFF" size={24} /> : <Mic color="#FFF" size={24} />}
          </LinearGradient>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, isRTL && styles.inputRTL]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#8E8E93"
          multiline
          maxLength={500}
          fontSize={18}
          textAlign={isRTL ? 'right' : 'left'}
          accessibilityLabel="Message input"
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!inputText.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send message">
          <LinearGradient
            colors={inputText.trim() ? ['#34C759', '#32D74B'] : ['#C7C7CC', '#C7C7CC']}
            style={styles.sendGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Send color="#FFF" size={24} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  rtlContainer: {
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiInfoRTL: {
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  aiDetails: {
    flex: 1,
  },
  aiName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  aiRole: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  rtlText: {
    textAlign: 'right',
  },
  readAllButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  readAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  readAllText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  messagesList: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  messageWrapperRTL: {
    flexDirection: 'row-reverse',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  message: {
    maxWidth: '70%',
    padding: 16,
    borderRadius: 20,
    minHeight: 60,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#000000',
  },
  emotionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  emotionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  emotionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textTransform: 'capitalize',
  },
  speakButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF9500',
    marginLeft: 8,
  },
  suggestionItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
  },
  quickResponses: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  quickResponse: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickResponseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  quickResponseText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputContainerRTL: {
    flexDirection: 'row-reverse',
  },
  voiceButton: {
    marginRight: 12,
  },
  voiceGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    padding: 16,
    paddingTop: 16,
    marginRight: 12,
    minHeight: 48,
    maxHeight: 120,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  inputRTL: {
    textAlign: 'right',
  },
  sendButton: {
    opacity: 0.9,
  },
  sendGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});