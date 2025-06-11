import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

interface VoiceCommand {
  command: string;
  patterns: string[];
  action: () => Promise<void> | void;
  description: string;
  category: 'health' | 'navigation' | 'emergency' | 'social' | 'general';
}

interface VoiceCommandResult {
  command: string;
  confidence: number;
  action?: () => Promise<void> | void;
}

export class VoiceCommandService {
  private static instance: VoiceCommandService;
  private commandHistory: string[] = [];
  private recording: Audio.Recording | null = null;
  private isListening = false;

  static getInstance(): VoiceCommandService {
    if (!VoiceCommandService.instance) {
      VoiceCommandService.instance = new VoiceCommandService();
    }
    return VoiceCommandService.instance;
  }

  private commands: VoiceCommand[] = [
    {
      command: 'Health Check',
      patterns: ['health check', 'check my health', 'health status', 'how am i'],
      action: this.executeHealthCheck,
      description: 'Check your current health status and vital signs',
      category: 'health'
    },
    {
      command: 'Share Story',
      patterns: ['tell story', 'share story', 'story time', 'tell me something'],
      action: this.executeShareStory,
      description: 'Share or listen to an inspiring story',
      category: 'social'
    },
    {
      command: 'Emergency Help',
      patterns: ['emergency', 'help me', 'call for help', 'sos', 'urgent'],
      action: this.executeEmergency,
      description: 'Activate emergency assistance protocols',
      category: 'emergency'
    },
    {
      command: 'Open Chat',
      patterns: ['open chat', 'talk to sarah', 'chat with ai', 'open assistant'],
      action: () => router.push('/chat'),
      description: 'Open AI chat assistant',
      category: 'navigation'
    },
    {
      command: 'Check Medications',
      patterns: ['check medications', 'my pills', 'medication reminder', 'med check'],
      action: () => router.push('/medications'),
      description: 'View your medication schedule',
      category: 'health'
    },
    {
      command: 'Social Activities',
      patterns: ['social activities', 'activities', 'events', 'what\'s happening'],
      action: () => router.push('/social'),
      description: 'View upcoming social activities',
      category: 'social'
    },
    {
      command: 'My Profile',
      patterns: ['my profile', 'profile settings', 'account settings', 'edit profile'],
      action: () => router.push('/profile'),
      description: 'View and edit your profile',
      category: 'navigation'
    },
    {
      command: 'Fall Detection',
      patterns: ['fall detection', 'safety monitoring', 'monitoring status'],
      action: () => router.push('/monitoring'),
      description: 'Check fall detection status',
      category: 'health'
    }
  ];

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  async startListening(): Promise<void> {
    if (this.isListening) return;

    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      Alert.alert('Permission Required', 'Microphone access is required for voice commands.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isListening = true;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await this.speak('Listening for your command...');

    } catch (error) {
      console.error('Error starting voice recording:', error);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListening || !this.recording) return;

    try {
      this.isListening = false;
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // For now, we'll simulate speech-to-text
      // In a real app, you'd send the audio to a speech-to-text service
      const simulatedTranscript = await this.simulateSpeechToText();
      
      if (simulatedTranscript) {
        await this.processCommand(simulatedTranscript);
      }

    } catch (error) {
      console.error('Error stopping voice recording:', error);
    }
  }

  private async simulateSpeechToText(): Promise<string> {
    // Simulate different possible voice commands for demo
    const possibleCommands = [
      'health check',
      'tell me a story',
      'open chat',
      'check my medications',
      'what activities are available',
      'emergency help'
    ];
    
    const randomCommand = possibleCommands[Math.floor(Math.random() * possibleCommands.length)];
    
    // Show a dialog to simulate the voice recognition
    return new Promise((resolve) => {
      Alert.alert(
        'Voice Command Recognized',
        `Did you say: "${randomCommand}"?\n\n(In a real app, this would be processed automatically)`,
        [
          { text: 'No, try different command', onPress: () => resolve('') },
          { text: 'Yes, execute', onPress: () => resolve(randomCommand) },
          { text: 'Custom Command', onPress: () => this.showCustomCommandInput(resolve) }
        ]
      );
    });
  }

  private showCustomCommandInput(resolve: (value: string) => void): void {
    // This would ideally be a proper input modal, but for demo we'll use predefined options
    Alert.alert(
      'Choose a Command',
      'Select a voice command to execute:',
      [
        { text: 'Health Check', onPress: () => resolve('health check') },
        { text: 'Share Story', onPress: () => resolve('tell me a story') },
        { text: 'Emergency', onPress: () => resolve('emergency help') },
        { text: 'Open Chat', onPress: () => resolve('open chat') },
        { text: 'Cancel', onPress: () => resolve('') }
      ]
    );
  }

  async processCommand(transcript: string): Promise<void> {
    if (!transcript.trim()) {
      await this.speak("I didn't catch that. Please try again.");
      return;
    }

    const result = this.matchCommand(transcript.toLowerCase());
    
    if (result && result.confidence > 0.6) {
      this.addToHistory(result.command);
      await this.speak(`Executing: ${result.command}`);
      
      try {
        if (result.action) {
          await result.action();
        }
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error executing command:', error);
        await this.speak('Sorry, I encountered an error executing that command.');
      }
    } else {
      await this.speak(`I didn't understand "${transcript}". Try saying "help" to hear available commands.`);
    }
  }

  private matchCommand(transcript: string): VoiceCommandResult | null {
    let bestMatch: VoiceCommandResult | null = null;
    let bestConfidence = 0;

    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        const confidence = this.calculateSimilarity(transcript, pattern);
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = {
            command: command.command,
            confidence,
            action: command.action
          };
        }
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple keyword matching - in production, use more sophisticated NLP
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    
    let matchedWords = 0;
    for (const word1 of words1) {
      if (words2.includes(word1)) {
        matchedWords++;
      }
    }
    
    return matchedWords / Math.max(words1.length, words2.length);
  }

  private async executeHealthCheck(): Promise<void> {
    await this.speak('Checking your health status...');
    
    // Simulate health check
    setTimeout(async () => {
      await this.speak('Your vital signs look good. Heart rate is normal, and you have taken 2 of 3 medications today. Remember to take your evening medication.');
      
      // Navigate to health dashboard
      router.push('/(tabs)');
    }, 2000);
  }

  private async executeShareStory(): Promise<void> {
    const stories = [
      "Here's an inspiring story: A woman named Sarah, at age 75, decided to learn painting for the first time. Despite her family's doubts, she persevered and eventually had her first art exhibition at 80. Her determination shows it's never too late to pursue your dreams.",
      "Let me share something uplifting: An elderly man started volunteering at the local library after retirement. He began reading to children every Tuesday. Over 10 years, he read to over 1,000 children and became known as 'Grandpa Story.' His kindness created a lasting impact on his community.",
      "Here's a heartwarming tale: Two neighbors who had lived next to each other for 20 years finally talked during the pandemic. They discovered they both loved gardening and started sharing vegetables. Their friendship blossomed, and they now maintain a beautiful community garden together."
    ];

    const randomStory = stories[Math.floor(Math.random() * stories.length)];
    await this.speak(randomStory);
  }

  private async executeEmergency(): Promise<void> {
    await this.speak('Emergency assistance activated. Checking your status...');
    
    Alert.alert(
      'Emergency Assistance',
      'This would normally contact emergency services and your emergency contacts. For demo purposes, this is simulated.',
      [
        { text: "I'm OK", onPress: () => this.speak('Emergency cancelled. Glad you are safe.') },
        { text: 'Get Help', onPress: () => this.speak('Contacting emergency services and your emergency contacts now.') }
      ]
    );
  }

  async getAvailableCommands(): Promise<VoiceCommand[]> {
    return this.commands;
  }

  async speakAvailableCommands(): Promise<void> {
    const commandList = this.commands.map(cmd => cmd.command).join(', ');
    await this.speak(`Available voice commands are: ${commandList}. Say "help" followed by a command name for more details.`);
  }

  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  private addToHistory(command: string): void {
    this.commandHistory.unshift(command);
    if (this.commandHistory.length > 10) {
      this.commandHistory.pop();
    }
  }

  async executeHistoryCommand(command: string): Promise<void> {
    const matchedCommand = this.commands.find(cmd => cmd.command === command);
    if (matchedCommand && matchedCommand.action) {
      await this.speak(`Executing: ${command}`);
      await matchedCommand.action();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  private async speak(text: string): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        await Speech.speak(text, {
          rate: 0.8,
          pitch: 1.0,
        });
      } catch (error) {
        console.error('Error speaking:', error);
      }
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const voiceCommandService = VoiceCommandService.getInstance(); 