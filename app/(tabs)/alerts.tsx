import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Mic, Brain, Heart, CircleAlert as AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

const voiceActions = [
  {
    id: 'health',
    title: 'Health Check',
    icon: Heart,
    color: ['#FF2D55', '#FF0066'],
    prompt: "Let's check your health status",
  },
  {
    id: 'story',
    title: 'Share Story',
    icon: Brain,
    color: ['#34C759', '#32D74B'],
    prompt: 'Would you like to share a story?',
  },
  {
    id: 'emergency',
    title: 'Emergency',
    icon: AlertCircle,
    color: ['#FF3B30', '#FF2D55'],
    prompt: 'Do you need emergency assistance?',
  },
];

export default function AlertsScreen() {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceAction = (prompt: string) => {
    Speech.speak(prompt, {
      rate: 0.8,
      pitch: 1.0,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topBar}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
            style={styles.avatar}
          />
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#E3F2FF', '#C7E5FF']}
                style={styles.actionGradient}>
                <Text style={styles.actionText}>Voice Help</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.title}>Voice Assistant</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.mainVoiceButton}
          onPress={() => setIsListening(!isListening)}>
          <LinearGradient
            colors={isListening ? ['#FF3B30', '#FF2D55'] : ['#007AFF', '#0055FF']}
            style={styles.mainVoiceGradient}>
            <Mic color="#FFF" size={48} />
            <Text style={styles.mainVoiceText}>
              {isListening ? 'Listening...' : 'Tap to Speak'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quick Voice Actions</Text>
        
        <View style={styles.voiceActions}>
          {voiceActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.voiceAction}
              onPress={() => handleVoiceAction(action.prompt)}>
              <LinearGradient
                colors={action.color}
                style={styles.voiceActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <action.icon color="#FFF" size={32} />
                <Text style={styles.voiceActionText}>{action.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.recentCommands}>
          <Text style={styles.recentTitle}>Recent Commands</Text>
          <View style={styles.commandCard}>
            <Mic color="#007AFF" size={24} />
            <Text style={styles.commandText}>"Check my health status"</Text>
          </View>
          <View style={styles.commandCard}>
            <Mic color="#007AFF" size={24} />
            <Text style={styles.commandText}>"Tell me a story"</Text>
          </View>
          <View style={styles.commandCard}>
            <Mic color="#007AFF" size={24} />
            <Text style={styles.commandText}>"What's my schedule today?"</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF8FF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E3A8A',
    marginBottom: 20,
  },
  content: {
    padding: 20,
  },
  mainVoiceButton: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainVoiceGradient: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainVoiceText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  voiceActions: {
    gap: 12,
    marginBottom: 30,
  },
  voiceAction: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  voiceActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  voiceActionText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 16,
  },
  recentCommands: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  recentTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  commandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  commandText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E3A8A',
    marginLeft: 12,
  },
});