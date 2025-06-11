import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Send } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useForwardedMessages } from '../hooks/useForwardedMessages';

interface Props {
  visible: boolean;
  onClose: () => void;
  messageId: string;
  toUserId: string;
  toUserName: string;
  messageContext?: any;
}

export default function ForwardMessageModal({
  visible,
  onClose,
  messageId,
  toUserId,
  toUserName,
  messageContext
}: Props) {
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const { forwardMessage } = useForwardedMessages(toUserId);

  const handleForward = async () => {
    try {
      await forwardMessage(messageId, toUserId, notes, priority);
      onClose();
    } catch (error) {
      console.error('Error forwarding message:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Forward to {toUserName}</Text>

          {messageContext?.type === 'health_alert' && (
            <View style={styles.alertBox}>
              <AlertTriangle color="#FF3B30" size={24} />
              <Text style={styles.alertText}>
                This message contains health alerts that may require immediate attention
              </Text>
            </View>
          )}

          <View style={styles.prioritySelector}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityOptions}>
              <TouchableOpacity
                style={[
                  styles.priorityOption,
                  priority === 'normal' && styles.prioritySelected,
                ]}
                onPress={() => setPriority('normal')}>
                <Text style={styles.priorityText}>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priorityOption,
                  priority === 'urgent' && styles.prioritySelected,
                ]}
                onPress={() => setPriority('urgent')}>
                <Text style={styles.priorityText}>Urgent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priorityOption,
                  priority === 'emergency' && styles.prioritySelected,
                ]}
                onPress={() => setPriority('emergency')}>
                <Text style={styles.priorityText}>Emergency</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add context or notes for the recipient"
            multiline
            numberOfLines={4}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forwardButton}
              onPress={handleForward}>
              <LinearGradient
                colors={['#007AFF', '#0055FF']}
                style={styles.forwardGradient}>
                <Send color="#FFF" size={20} />
                <Text style={styles.forwardText}>Forward</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 20,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF3B30',
    marginLeft: 12,
  },
  prioritySelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  prioritySelected: {
    backgroundColor: '#007AFF',
  },
  priorityText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  forwardButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  forwardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  forwardText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});