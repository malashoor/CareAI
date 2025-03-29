import { useState, useRef, useCallback } from 'react';
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
} from 'react-native';
import {
  Mic,
  Send,
  Volume2 as VolumeUp,
  Brain,
  MessageSquare,
  Heart,
  SmilePlus,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotion?: 'happy' | 'neutral' | 'concerned' | 'excited';
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

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Sarah, your AI companion. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
      emotion: 'happy',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const speakMessage = (text: string) => {
    Speech.speak(text, {
      rate: 0.8,
      pitch: 1.0,
    });
  };

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand. I'm here to listen and help. Would you like to tell me more?",
        sender: 'ai',
        timestamp: new Date(),
        emotion: 'empathetic',
      };
      setMessages(prev => [...prev, aiMessage]);
      speakMessage(aiMessage.text);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  }, [inputText]);

  const handleQuickResponse = (response: string) => {
    setInputText(response);
    handleSend();
  };

  const readAllMessages = () => {
    const allText = messages.map(msg => msg.text).join('. ');
    speakMessage(allText);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={92}>
      <View style={styles.header}>
        <View style={styles.aiInfo}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
            style={styles.aiAvatar}
          />
          <View style={styles.aiDetails}>
            <Text style={styles.aiName}>Sarah</Text>
            <Text style={styles.aiRole}>AI Companion</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.readAllButton}
          onPress={readAllMessages}>
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
            ]}
            onPress={() => speakMessage(message.text)}>
            {message.sender === 'ai' && (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                style={styles.messageAvatar}
              />
            )}
            <View
              style={[
                styles.message,
                message.sender === 'user' ? styles.userMessage : styles.aiMessage,
              ]}>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
              ]}>
                {message.text}
              </Text>
            </View>
            {message.sender === 'ai' && (
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => speakMessage(message.text)}>
                <VolumeUp color="#007AFF" size={32} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.quickResponses}>
        {quickResponses.map((response, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickResponse}
            onPress={() => handleQuickResponse(response.text)}>
            <LinearGradient
              colors={response.color}
              style={styles.quickResponseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <response.icon color="#FFF" size={24} />
              <Text style={styles.quickResponseText}>{response.text}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setIsRecording(!isRecording)}>
          <LinearGradient
            colors={isRecording ? ['#FF3B30', '#FF2D55'] : ['#007AFF', '#0055FF']}
            style={styles.voiceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Mic color="#FFF" size={24} />
          </LinearGradient>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#8E8E93"
          multiline
          maxLength={500}
          fontSize={18}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!inputText.trim()}>
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
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  speakButton: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
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