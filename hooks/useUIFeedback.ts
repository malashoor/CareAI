import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';

interface UIFeedback {
  id: string;
  type: 'button' | 'text' | 'navigation' | 'general';
  screen: string;
  feedback: string;
  timestamp: number;
  deviceInfo: {
    platform: string;
    screenSize: {
      width: number;
      height: number;
    };
  };
}

interface UIMetrics {
  buttonSize: number;
  fontSize: number;
  spacing: number;
  contrast: number;
}

export function useUIFeedback() {
  const [feedback, setFeedback] = useState<UIFeedback[]>([]);
  const [metrics, setMetrics] = useState<UIMetrics>({
    buttonSize: 48,
    fontSize: 16,
    spacing: 16,
    contrast: 4.5
  });

  // Load saved UI preferences
  useEffect(() => {
    loadUIPreferences();
  }, []);

  const loadUIPreferences = async () => {
    try {
      const savedMetrics = await AsyncStorage.getItem('uiMetrics');
      if (savedMetrics) {
        setMetrics(JSON.parse(savedMetrics));
      }
    } catch (error) {
      console.error('Error loading UI preferences:', error);
    }
  };

  const recordFeedback = async (newFeedback: Omit<UIFeedback, 'timestamp' | 'deviceInfo'>) => {
    try {
      const feedbackItem: UIFeedback = {
        ...newFeedback,
        timestamp: Date.now(),
        deviceInfo: {
          platform: Platform.OS,
          screenSize: Dimensions.get('window')
        }
      };

      const updatedFeedback = [...feedback, feedbackItem];
      setFeedback(updatedFeedback);

      // Store feedback
      await AsyncStorage.setItem('uiFeedback', JSON.stringify(updatedFeedback));

      // Analyze and adjust UI metrics based on feedback
      adjustUIMetrics(feedbackItem);
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  const adjustUIMetrics = async (feedbackItem: UIFeedback) => {
    let updatedMetrics = { ...metrics };

    // Adjust metrics based on feedback type
    switch (feedbackItem.type) {
      case 'button':
        if (feedbackItem.feedback.includes('small')) {
          updatedMetrics.buttonSize = Math.min(metrics.buttonSize + 4, 64);
        }
        break;
      case 'text':
        if (feedbackItem.feedback.includes('hard to read')) {
          updatedMetrics.fontSize = Math.min(metrics.fontSize + 2, 24);
          updatedMetrics.contrast = Math.min(metrics.contrast + 0.5, 7);
        }
        break;
      case 'navigation':
        if (feedbackItem.feedback.includes('crowded')) {
          updatedMetrics.spacing = Math.min(metrics.spacing + 4, 32);
        }
        break;
    }

    setMetrics(updatedMetrics);
    await AsyncStorage.setItem('uiMetrics', JSON.stringify(updatedMetrics));
  };

  const getFeedbackSummary = () => {
    return {
      totalFeedback: feedback.length,
      commonIssues: feedback.reduce((acc, item) => {
        acc[item.feedback] = (acc[item.feedback] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      deviceBreakdown: feedback.reduce((acc, item) => {
        acc[item.deviceInfo.platform] = (acc[item.deviceInfo.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  return {
    metrics,
    recordFeedback,
    getFeedbackSummary,
    feedback
  };
}