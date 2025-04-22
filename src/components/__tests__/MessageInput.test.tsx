import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MessageInput } from '../MessageInput';
import * as Permissions from 'expo-permissions';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('expo-permissions', () => ({
  askAsync: jest.fn(),
  AUDIO_RECORDING: 'AUDIO_RECORDING',
}));

describe('MessageInput', () => {
  const mockOnSend = jest.fn();
  const mockOnRecordAudio = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    expect(getByTestId('message-input')).toBeTruthy();
    expect(getByPlaceholderText('Type a message')).toBeTruthy();
    expect(getByTestId('send-button')).toBeTruthy();
    expect(getByTestId('record-button')).toBeTruthy();
  });

  it('handles message input and sending', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    const input = getByPlaceholderText('Type a message');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'Hello, world!');
    fireEvent.press(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Hello, world!');
  });

  it('prevents sending empty messages', () => {
    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('handles audio recording permission granted', async () => {
    (Permissions.askAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });

    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    const recordButton = getByTestId('record-button');
    fireEvent.press(recordButton);

    await waitFor(() => {
      expect(mockOnRecordAudio).toHaveBeenCalled();
    });
  });

  it('handles audio recording permission denied', async () => {
    (Permissions.askAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });

    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    const recordButton = getByTestId('record-button');
    fireEvent.press(recordButton);

    await waitFor(() => {
      expect(mockOnRecordAudio).not.toHaveBeenCalled();
    });
  });

  it('respects disabled prop', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <MessageInput
        onSend={mockOnSend}
        onRecordAudio={mockOnRecordAudio}
        disabled={true}
      />
    );

    const input = getByPlaceholderText('Type a message');
    const sendButton = getByTestId('send-button');
    const recordButton = getByTestId('record-button');

    expect(input.props.editable).toBe(false);
    expect(sendButton.props.disabled).toBe(true);
    expect(recordButton.props.disabled).toBe(true);
  });

  it('respects maxLength prop', () => {
    const maxLength = 10;
    const { getByPlaceholderText } = render(
      <MessageInput
        onSend={mockOnSend}
        onRecordAudio={mockOnRecordAudio}
        maxLength={maxLength}
      />
    );

    const input = getByPlaceholderText('Type a message');
    expect(input.props.maxLength).toBe(maxLength);
  });

  it('uses custom placeholder text', () => {
    const placeholder = 'Custom placeholder';
    const { getByPlaceholderText } = render(
      <MessageInput
        onSend={mockOnSend}
        onRecordAudio={mockOnRecordAudio}
        placeholder={placeholder}
      />
    );

    expect(getByPlaceholderText(placeholder)).toBeTruthy();
  });
}); 