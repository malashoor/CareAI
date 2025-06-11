import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import {
  MessageSquare,
  Forward,
  Volume2 as VolumeUp,
  AlertTriangle
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import ForwardMessageModal from './ForwardMessageModal';
import type { User } from '@/types/user';

interface Message {
  id: string;
  from_user: User;
  to_user: User;
  audio_url: string;
  transcript: string;
  duration: number;
  created_at: string;
  context?: any;
  priority?: 'normal' | 'urgent' | 'emergency';
}

interface Props {
  messages: Message[];
  currentUserId: string;
  onForward?: (messageId: string) => void;
}

export default function MessageThread({ messages, currentUserId, onForward }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const playMessage = async (message: Message) => {
    if (Platform.OS === 'web') {
      try {
        await Speech.speak(message.transcript, {
          onStart: () => setPlayingId(message.id),
          onDone: () => setPlayingId(null),
          onError: () => setPlayingId(null),
        });
      } catch (error) {
        console.error('Error playing message:', error);
      }
    } else {
      // Implement native audio playback
    }
  };

  const handleForward = (message: Message) => {
    setSelectedMessage(message);
    setForwardModalVisible(true);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return '#FF9500';
      case 'emergency':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  return (
    <View style={styles.container}>
      {messages.map((message) => {
        const isOwnMessage = message.from_user.id === currentUserId;
        const priorityColor = getPriorityColor(message.priority);

        return (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              isOwnMessage ? styles.ownMessage : styles.otherMessage,
            ]}>
            {!isOwnMessage && (
              <Image
                source={{ uri: message.from_user.avatar_url }}
                style={styles.avatar}
              />
            )}

            <View style={[
              styles.messageContent,
              { backgroundColor: isOwnMessage ? priorityColor : '#FFFFFF' }
            ]}>
              <View style={styles.messageHeader}>
                <Text style={[
                  styles.userName,
                  { color: isOwnMessage ? '#FFFFFF' : '#000000' }
                ]}>
                  {isOwnMessage ? 'You' : message.from_user.name}
                </Text>
                {message.priority && message.priority !== 'normal' && (
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: isOwnMessage ? '#FFFFFF' : priorityColor }
                  ]}>
                    <AlertTriangle
                      color={isOwnMessage ? priorityColor : '#FFFFFF'}
                      size={12}
                    />
                    <Text style={[
                      styles.priorityText,
                      { color: isOwnMessage ? priorityColor : '#FFFFFF' }
                    ]}>
                      {message.priority.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[
                styles.messageText,
                { color: isOwnMessage ? '#FFFFFF' : '#000000' }
              ]}>
                {message.transcript}
              </Text>

              <View style={styles.messageActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => playMessage(message)}>
                  <VolumeUp
                    color={isOwnMessage ? '#FFFFFF' : '#007AFF'}
                    size={20}
                  />
                </TouchableOpacity>

                {!isOwnMessage && onForward && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleForward(message)}>
                    <Forward
                      color={isOwnMessage ? '#FFFFFF' : '#007AFF'}
                      size={20}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        );
      })}

      {selectedMessage && (
        <ForwardMessageModal
          visible={forwardModalVisible}
          onClose={() => {
            setForwardModalVisible(false);
            setSelectedMessage(null);
          }}
          messageId={selectedMessage.id}
          toUserId={selectedMessage.to_user.id}
          toUserName={selectedMessage.to_user.name}
          messageContext={selectedMessage.context}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageContent: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});