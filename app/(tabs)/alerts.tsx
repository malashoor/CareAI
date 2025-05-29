import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Mic, 
  Brain, 
  Heart, 
  CircleAlert as AlertCircle, 
  Volume2 as VolumeUp,
  HelpCircle,
  Clock,
  X,
  MicOff
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { voiceCommandService } from '@/lib/voiceCommandService';

export default function AlertsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  
  const [isListening, setIsListening] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [availableCommands, setAvailableCommands] = useState<any[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCommands();
    loadHistory();
  }, []);

  const loadCommands = async () => {
    const commands = await voiceCommandService.getAvailableCommands();
    setAvailableCommands(commands);
  };

  const loadHistory = () => {
    const history = voiceCommandService.getCommandHistory();
    setCommandHistory(history);
  };

  const speakText = async (text: string) => {
    if (Platform.OS !== 'web') {
      try {
        await Speech.speak(text, {
          rate: 0.8,
          pitch: 1.0,
          language: isRTL ? 'ar' : 'en'
        });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error speaking text:', error);
      }
    }
  };

  const handleMainVoiceButton = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const startListening = async () => {
    try {
      setLoading(true);
      setIsListening(true);
      await voiceCommandService.startListening();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
      Alert.alert('Error', 'Failed to start voice recognition');
    } finally {
      setLoading(false);
    }
  };

  const stopListening = async () => {
    try {
      setLoading(true);
      await voiceCommandService.stopListening();
      setIsListening(false);
      loadHistory(); // Refresh history after command execution
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      setIsListening(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceAction = async (actionId: string) => {
    let command = '';
    switch (actionId) {
      case 'health':
        command = 'health check';
        break;
      case 'story':
        command = 'tell me a story';
        break;
      case 'emergency':
        command = 'emergency help';
        break;
    }

    if (command) {
      await speakText(`Executing ${actionId} command`);
      await voiceCommandService.processCommand(command);
      loadHistory();
    }
  };

  const handleVoiceHelp = async () => {
    setShowHelpModal(true);
    await speakText('Voice help opened. Here you can see all available commands and how to use them.');
  };

  const handleHistoryCommand = async (command: string) => {
    await voiceCommandService.executeHistoryCommand(command);
    await speakText(`Re-executing: ${command}`);
    loadHistory();
  };

  const speakAllCommands = async () => {
    await voiceCommandService.speakAvailableCommands();
  };

  const voiceActions = [
    {
      id: 'health',
      title: 'Health Check',
      icon: Heart,
      color: ['#FF2D55', '#FF0066'],
      description: 'Check your health status and vital signs',
    },
    {
      id: 'story',
      title: 'Share Story',
      icon: Brain,
      color: ['#34C759', '#32D74B'],
      description: 'Listen to an inspiring story',
    },
    {
      id: 'emergency',
      title: 'Emergency',
      icon: AlertCircle,
      color: ['#FF3B30', '#FF2D55'],
      description: 'Activate emergency assistance',
    },
  ];

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtlContainer]}>
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={[styles.topBar, isRTL && styles.topBarRTL]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
            style={styles.avatar}
          />
          <View style={styles.topActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleVoiceHelp}
              accessibilityRole="button"
              accessibilityLabel="Open voice help">
              <LinearGradient
                colors={['#E3F2FF', '#C7E5FF']}
                style={styles.actionGradient}>
                <HelpCircle color="#1E3A8A" size={20} />
                <Text style={styles.actionText}>Voice Help</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.title, isRTL && styles.rtlText]}>Voice Assistant</Text>
      </View>

      <View style={styles.content}>
        {/* Main Voice Button */}
        <TouchableOpacity 
          style={styles.mainVoiceButton}
          onPress={handleMainVoiceButton}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={isListening ? 'Stop listening' : 'Start voice recognition'}>
          <LinearGradient
            colors={isListening ? ['#FF3B30', '#FF2D55'] : ['#007AFF', '#0055FF']}
            style={styles.mainVoiceGradient}>
            {loading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : isListening ? (
              <MicOff color="#FFF" size={48} />
            ) : (
              <Mic color="#FFF" size={48} />
            )}
            <Text style={styles.mainVoiceText}>
              {loading ? 'Processing...' : isListening ? 'Listening...' : 'Tap to Speak'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Voice Status */}
        {isListening && (
          <View style={styles.statusCard}>
            <Text style={[styles.statusText, isRTL && styles.rtlText]}>
              🎤 Listening for your command... Speak now!
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>Quick Voice Actions</Text>
        
        {/* Voice Action Buttons */}
        <View style={styles.voiceActions}>
          {voiceActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.voiceAction}
              onPress={() => handleVoiceAction(action.id)}
              onFocus={() => speakText(action.description)}
              accessibilityRole="button"
              accessibilityLabel={`${action.title}: ${action.description}`}>
              <LinearGradient
                colors={action.color}
                style={styles.voiceActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <action.icon color="#FFF" size={32} />
                <View style={styles.actionContent}>
                  <Text style={styles.voiceActionText}>{action.title}</Text>
                  <Text style={styles.voiceActionDescription}>{action.description}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => speakText(action.description)}
                  style={styles.speakActionButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Listen to ${action.title} description`}>
                  <VolumeUp color="#FFF" size={20} />
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Commands */}
        <View style={styles.recentCommands}>
          <View style={[styles.recentHeader, isRTL && styles.recentHeaderRTL]}>
            <Text style={[styles.recentTitle, isRTL && styles.rtlText]}>Recent Commands</Text>
            <TouchableOpacity 
              onPress={speakAllCommands}
              style={styles.speakAllButton}
              accessibilityRole="button"
              accessibilityLabel="Listen to all available commands">
              <VolumeUp color="#007AFF" size={20} />
            </TouchableOpacity>
          </View>
          
          {commandHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Clock color="#CCCCCC" size={32} />
              <Text style={[styles.emptyHistoryText, isRTL && styles.rtlText]}>
                No commands used yet. Try saying "Health Check" or "Tell me a story"
              </Text>
            </View>
          ) : (
            commandHistory.slice(0, 5).map((command, index) => (
              <TouchableOpacity
                key={index}
                style={styles.commandCard}
                onPress={() => handleHistoryCommand(command)}
                accessibilityRole="button"
                accessibilityLabel={`Re-execute command: ${command}`}>
                <Mic color="#007AFF" size={24} />
                <Text style={[styles.commandText, isRTL && styles.rtlText]}>"{command}"</Text>
                <TouchableOpacity
                  onPress={() => speakText(`Previous command: ${command}`)}
                  style={styles.speakCommandButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Listen to command: ${command}`}>
                  <VolumeUp color="#666666" size={16} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Voice Help Modal */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
            <TouchableOpacity
              onPress={() => setShowHelpModal(false)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close help modal">
              <X color="#666666" size={24} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, isRTL && styles.rtlText]}>Voice Commands Help</Text>
            <TouchableOpacity
              onPress={speakAllCommands}
              style={styles.speakAllModalButton}
              accessibilityRole="button"
              accessibilityLabel="Listen to all commands">
              <VolumeUp color="#007AFF" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.helpDescription, isRTL && styles.rtlText]}>
              Use your voice to control CareAI. Here are the available commands:
            </Text>

            {availableCommands.map((command, index) => (
              <View key={index} style={styles.commandHelpCard}>
                <View style={[styles.commandHelpHeader, isRTL && styles.commandHelpHeaderRTL]}>
                  <Text style={[styles.commandName, isRTL && styles.rtlText]}>{command.command}</Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: 
                      command.category === 'health' ? '#FFE5E5' :
                      command.category === 'emergency' ? '#FFE5E5' :
                      command.category === 'social' ? '#E5F7E5' :
                      command.category === 'navigation' ? '#E5F2FF' : '#F0F0F0'
                    }
                  ]}>
                    <Text style={[
                      styles.categoryText,
                      { color:
                        command.category === 'health' ? '#FF3B30' :
                        command.category === 'emergency' ? '#FF3B30' :
                        command.category === 'social' ? '#34C759' :
                        command.category === 'navigation' ? '#007AFF' : '#666666'
                      }
                    ]}>
                      {command.category}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.commandDescription, isRTL && styles.rtlText]}>
                  {command.description}
                </Text>
                <View style={styles.patternsContainer}>
                  <Text style={[styles.patternsTitle, isRTL && styles.rtlText]}>Say any of these:</Text>
                  {command.patterns.map((pattern: string, patternIndex: number) => (
                    <TouchableOpacity
                      key={patternIndex}
                      style={styles.patternChip}
                      onPress={() => speakText(pattern)}
                      accessibilityRole="button"
                      accessibilityLabel={`Example command: ${pattern}`}>
                      <Text style={[styles.patternText, isRTL && styles.rtlText]}>"{pattern}"</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.helpTips}>
              <Text style={[styles.tipsTitle, isRTL && styles.rtlText]}>💡 Tips for Better Recognition</Text>
              <Text style={[styles.tipText, isRTL && styles.rtlText]}>• Speak clearly and at normal pace</Text>
              <Text style={[styles.tipText, isRTL && styles.rtlText]}>• Use quiet environment when possible</Text>
              <Text style={[styles.tipText, isRTL && styles.rtlText]}>• Hold device close to your mouth</Text>
              <Text style={[styles.tipText, isRTL && styles.rtlText]}>• Wait for "Listening..." before speaking</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF8FF',
  },
  rtlContainer: {
    direction: 'rtl',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerRTL: {
    flexDirection: 'column',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topBarRTL: {
    flexDirection: 'row-reverse',
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  rtlText: {
    textAlign: 'right',
  },
  content: {
    padding: 20,
  },
  mainVoiceButton: {
    marginBottom: 20,
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#34C759',
    textAlign: 'center',
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
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  voiceActionText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  voiceActionDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
    marginTop: 4,
  },
  speakActionButton: {
    padding: 8,
  },
  recentCommands: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  recentTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E3A8A',
  },
  speakAllButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 20,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    textAlign: 'center',
    marginTop: 12,
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
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E3A8A',
    marginLeft: 12,
  },
  speakCommandButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  speakAllModalButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  helpDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 24,
    lineHeight: 24,
  },
  commandHelpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  commandHelpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commandHelpHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  commandName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  commandDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  patternsContainer: {
    marginTop: 8,
  },
  patternsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginBottom: 8,
  },
  patternChip: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  patternText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
  },
  helpTips: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
});