import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MessageInput } from '../../project/src/components/MessageInput';
import * as Sentry from '@sentry/react-native';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

// Mock Audio permissions
jest.mock('expo-permissions', () => ({
  askAsync: jest.fn(),
}));

// Mock Audio recording
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
  },
}));

describe('Interaction Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProps = {
    onSend: jest.fn(),
    onRecord: jest.fn(),
    onStopRecording: jest.fn(),
    seniorEmotionalState: 'neutral',
    caregiver_id: 'test-caregiver-123',
  };

  it('should track message send interactions', async () => {
    const { getByTestId } = render(<MessageInput {...mockProps} />);
    
    // Simulate typing a message
    const input = getByTestId('message-input');
    fireEvent.changeText(input, 'Test message');
    
    // Simulate sending
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
    const { getByTestId } = render(<MessageInput {...mockProps} />);
    
    // Simulate starting recording
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
    require('expo-permissions').askAsync.mockResolvedValueOnce({ status: 'denied' });
    
    const { getByTestId } = render(<MessageInput {...mockProps} />);
    
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
}); 