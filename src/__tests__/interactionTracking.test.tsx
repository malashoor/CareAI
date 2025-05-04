import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, TextInput, TouchableOpacity } from 'react-native';
import * as Sentry from '@sentry/react-native';
import * as Permissions from 'expo-permissions';

// Create a mock MessageInput component
const MockMessageInput = (props: any) => (
  <View testID="message-input">
    <TextInput
      testID="message-input-field"
      placeholder="Type a message..."
      onChangeText={props.onSend}
    />
    <TouchableOpacity
      testID="send-button"
      onPress={() => props.onSend('')}
    />
    <TouchableOpacity
      testID="record-button"
      onPress={props.onRecord}
    />
  </View>
);

// Mock the MessageInput component
jest.mock('@/components/MessageInput', () => MockMessageInput);

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  init: jest.fn(),
}));

// Mock Permissions
jest.mock('expo-permissions', () => ({
  askAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  AUDIO_RECORDING: 'AUDIO_RECORDING',
}));

describe('MessageInput Interaction Tracking', () => {
  const mockProps = {
    onSend: jest.fn().mockResolvedValue(undefined),
    onRecord: jest.fn().mockResolvedValue(undefined),
    onStopRecording: jest.fn().mockResolvedValue(undefined),
    seniorEmotionalState: 'neutral' as const,
    caregiver_id: 'test-caregiver-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful permission request by default
    (Permissions.askAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  });

  it('should track message send interactions', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <View>
        <MockMessageInput {...mockProps} />
      </View>
    );
    
    // Type a message
    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Test message');
    
    // Send the message
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            component: 'MessageInput',
            last_interaction: expect.stringMatching(/send_/),
          }),
        })
      );
    });
  });

  it('should track recording interactions', async () => {
    const { getByTestId } = render(
      <View>
        <MockMessageInput {...mockProps} />
      </View>
    );
    
    // Start recording
    const recordButton = getByTestId('record-button');
    fireEvent.press(recordButton);
    
    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            last_interaction: expect.stringMatching(/record_/),
          }),
        })
      );
    });
  });

  it('should track permission denied interactions', async () => {
    // Mock permission denied
    (Permissions.askAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    
    const { getByTestId } = render(
      <View>
        <MockMessageInput {...mockProps} />
      </View>
    );
    
    // Try to start recording
    const recordButton = getByTestId('record-button');
    fireEvent.press(recordButton);
    
    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            last_interaction: 'record_permission_denied',
          }),
        })
      );
    });
  });

  it('should maintain interaction sequence', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <View>
        <MockMessageInput {...mockProps} />
      </View>
    );
    
    // Perform multiple interactions
    const input = getByPlaceholderText('Type a message...');
    const recordButton = getByTestId('record-button');
    const sendButton = getByTestId('send-button');
    
    // Type and send a message
    fireEvent.changeText(input, 'Test message');
    fireEvent.press(sendButton);
    
    // Start recording
    fireEvent.press(recordButton);
    
    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          extra: expect.objectContaining({
            interaction_flow: expect.objectContaining({
              sequence: expect.arrayContaining([
                expect.stringMatching(/send_/),
                expect.stringMatching(/record_/),
              ]),
            }),
          }),
        })
      );
    });
  });
}); 