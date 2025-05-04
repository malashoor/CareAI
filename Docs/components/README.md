# CareAI Component Documentation

## Core Components

### MessageInput

A versatile input component for text and audio messages with emotion tracking.

```typescript
import { MessageInput } from '@/components/MessageInput';

interface MessageInputProps {
  /** Callback when a message is sent */
  onSend: (message: string) => void;
  /** Callback when audio recording starts/stops */
  onRecordAudio: (recording: boolean) => void;
  /** Current emotional state of the senior user */
  seniorEmotionalState?: 'happy' | 'sad' | 'angry' | 'neutral' | 'anxious' | 'calm';
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<MessageInput
  onSend={handleSend}
  onRecordAudio={handleRecording}
  seniorEmotionalState="happy"
/>
```

### AccessibleContainer

A wrapper component that adds accessibility features to any content.

```typescript
import { AccessibleContainer } from '@/components/AccessibleContainer';

interface AccessibleContainerProps {
  /** Child components */
  children: React.ReactNode;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Whether the container is accessible */
  accessible?: boolean;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Additional accessibility hint */
  accessibilityHint?: string;
  /** ARIA role */
  accessibilityRole?: string;
  /** Current accessibility state */
  accessibilityState?: Record<string, boolean>;
  /** Live region behavior */
  accessibilityLiveRegion?: 'polite' | 'assertive' | 'off';
  /** Focus callback */
  onFocus?: () => void;
  /** Blur callback */
  onBlur?: () => void;
  /** Test ID for testing */
  testID?: string;
}

// Example usage:
<AccessibleContainer
  accessibilityLabel="Message input field"
  accessibilityRole="textbox"
  accessibilityLiveRegion="polite"
>
  {/* Content */}
</AccessibleContainer>
```

### HealthSyncSettings

Component for managing health data synchronization settings.

```typescript
import { HealthSyncSettings } from '@/components/HealthSyncSettings';

interface HealthSyncSettingsProps {
  /** User ID for sync settings */
  userId: string;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<HealthSyncSettings userId="user123" />
```

### SOSButton

Emergency SOS button with location tracking and contact notification.

```typescript
import { SOSButton } from '@/components/SOSButton';

interface SOSButtonProps {
  /** User ID for emergency services */
  userId: string;
  /** Callback when SOS is triggered */
  onTrigger: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<SOSButton
  userId="user123"
  onTrigger={handleEmergency}
  disabled={false}
/>
```

## Utility Components

### EmotionIndicator

Visual indicator for emotional states with accessibility support.

```typescript
import { EmotionIndicator } from '@/components/EmotionIndicator';

interface EmotionIndicatorProps {
  /** Current emotional state */
  state: 'happy' | 'sad' | 'angry' | 'neutral' | 'anxious' | 'calm';
  /** Size of the indicator */
  size?: number;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<EmotionIndicator state="happy" size={24} />
```

### AccessibleButton

Button component with enhanced accessibility features.

```typescript
import { AccessibleButton } from '@/components/AccessibleButton';

interface AccessibleButtonProps {
  /** Button label */
  label: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<AccessibleButton
  label="Send Message"
  onPress={handleSend}
  variant="primary"
  disabled={false}
/>
```

## Best Practices

1. **Accessibility**
   - Always provide meaningful `accessibilityLabel` and `accessibilityHint`
   - Use appropriate ARIA roles
   - Support screen readers
   - Maintain proper contrast ratios

2. **Performance**
   - Memoize callbacks with `useCallback`
   - Optimize re-renders with `React.memo`
   - Use `useMemo` for expensive computations
   - Implement proper cleanup in `useEffect`

3. **Error Handling**
   - Implement proper error boundaries
   - Provide meaningful error messages
   - Handle edge cases gracefully
   - Log errors appropriately

4. **Testing**
   - Write unit tests for all components
   - Test accessibility features
   - Test error scenarios
   - Test performance optimizations

## Screen Components

### RemindersListScreen

A screen component for displaying and managing medication and appointment reminders.

```typescript
import { RemindersListScreen } from '@/screens/RemindersListScreen';

interface RemindersListScreenProps {
  /** User ID for fetching reminders */
  userId: string;
  /** Callback when a reminder is tapped */
  onReminderPress: (reminder: Reminder) => void;
  /** Callback when add reminder is pressed */
  onAddReminder: () => void;
  /** Whether the screen is in offline mode */
  isOffline?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<RemindersListScreen
  userId="user123"
  onReminderPress={handleReminderPress}
  onAddReminder={handleAddReminder}
  isOffline={false}
/>

// Related hooks:
const { reminders, loading, error } = useReminders(userId);
const { markAsCompleted } = useReminderActions(userId);
```

**Accessibility Notes:**
- Implements `accessibilityRole="list"` for the reminders list
- Each reminder item has `accessibilityRole="button"`
- Supports VoiceOver and TalkBack navigation
- Provides clear feedback for reminder status changes

**Performance Considerations:**
- Uses `FlatList` with `getItemLayout` for optimized rendering
- Implements pagination for large reminder lists
- Caches reminder data using `useQuery` from React Query
- Optimizes re-renders with `React.memo`

### ChatScreen

Main chat interface with message history and real-time updates.

```typescript
import { ChatScreen } from '@/screens/ChatScreen';

interface ChatScreenProps {
  /** User ID for chat history */
  userId: string;
  /** Callback when a message is sent */
  onSendMessage: (message: string) => void;
  /** Callback when audio is recorded */
  onRecordAudio: (recording: boolean) => void;
  /** Current emotional state */
  emotionalState?: EmotionalState;
  /** Whether the screen is in offline mode */
  isOffline?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<ChatScreen
  userId="user123"
  onSendMessage={handleSendMessage}
  onRecordAudio={handleRecording}
  emotionalState="happy"
  isOffline={false}
/>

// Related hooks:
const { messages, sendMessage } = useChat(userId);
const { isRecording, startRecording, stopRecording } = useAudioRecording();
const { emotionalState } = useEmotionTracking();
```

**Accessibility Notes:**
- Implements `accessibilityRole="list"` for message history
- Each message has appropriate `accessibilityRole` based on type
- Supports keyboard navigation for message input
- Provides audio feedback for message status

**Performance Considerations:**
- Uses `FlatList` with `windowSize` optimization
- Implements message pagination
- Caches message history using `useQuery`
- Optimizes re-renders with `React.memo`

### DashboardScreen

Main dashboard displaying health metrics, reminders, and activity summary.

```typescript
import { DashboardScreen } from '@/screens/DashboardScreen';

interface DashboardScreenProps {
  /** User ID for dashboard data */
  userId: string;
  /** Callback when a metric is tapped */
  onMetricPress: (metric: HealthMetric) => void;
  /** Callback when SOS is triggered */
  onSOSPress: () => void;
  /** Whether the screen is in offline mode */
  isOffline?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<DashboardScreen
  userId="user123"
  onMetricPress={handleMetricPress}
  onSOSPress={handleSOSPress}
  isOffline={false}
/>

// Related hooks:
const { metrics, loading } = useHealthMetrics(userId);
const { activitySummary } = useActivityTracking(userId);
const { syncStatus } = useHealthSync(userId);
```

**Accessibility Notes:**
- Implements `accessibilityRole="grid"` for metrics layout
- Each metric card has `accessibilityRole="button"`
- Supports VoiceOver and TalkBack navigation
- Provides clear feedback for metric changes

**Performance Considerations:**
- Uses `SectionList` for optimized rendering
- Implements data prefetching
- Caches dashboard data using `useQuery`
- Optimizes re-renders with `React.memo`

### OfflineStatusBanner

Banner component for displaying offline status and sync progress.

```typescript
import { OfflineStatusBanner } from '@/components/OfflineStatusBanner';

interface OfflineStatusBannerProps {
  /** Whether the app is offline */
  isOffline: boolean;
  /** Number of pending sync items */
  pendingSyncCount?: number;
  /** Callback when retry is pressed */
  onRetry?: () => void;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<OfflineStatusBanner
  isOffline={true}
  pendingSyncCount={5}
  onRetry={handleRetrySync}
/>

// Related hooks:
const { isOffline, pendingSyncCount } = useOfflineStatus();
const { retrySync } = useSyncManager();
```

**Accessibility Notes:**
- Implements `accessibilityRole="alert"` for status changes
- Provides clear status announcements
- Supports VoiceOver and TalkBack
- Includes retry button with proper labeling

**Performance Considerations:**
- Minimizes re-renders with `React.memo`
- Uses `Animated` for smooth transitions
- Implements debounced status updates
- Optimizes sync status checks

### TransitionHistory

Component for displaying and analyzing emotional state transitions.

```typescript
import { TransitionHistory } from '@/components/TransitionHistory';

interface TransitionHistoryProps {
  /** User ID for transition history */
  userId: string;
  /** Time range for analysis */
  timeRange?: 'day' | 'week' | 'month';
  /** Callback when a transition is selected */
  onTransitionSelect?: (transition: EmotionTransition) => void;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<TransitionHistory
  userId="user123"
  timeRange="week"
  onTransitionSelect={handleTransitionSelect}
/>

// Related hooks:
const { transitions, loading } = useEmotionHistory(userId);
const { analyzePatterns } = useEmotionAnalysis(userId);
```

**Accessibility Notes:**
- Implements `accessibilityRole="list"` for transition list
- Each transition has appropriate labeling
- Supports keyboard navigation
- Provides clear feedback for pattern changes

**Performance Considerations:**
- Uses `FlatList` with `getItemLayout`
- Implements data pagination
- Caches transition data using `useQuery`
- Optimizes re-renders with `React.memo`

### PersonalityAnalytics

Component for displaying personality insights and behavioral patterns.

```typescript
import { PersonalityAnalytics } from '@/components/PersonalityAnalytics';

interface PersonalityAnalyticsProps {
  /** User ID for analytics */
  userId: string;
  /** Time range for analysis */
  timeRange?: 'week' | 'month' | 'year';
  /** Callback when insights are loaded */
  onInsightsLoaded?: (insights: PersonalityInsights) => void;
  /** Custom style overrides */
  style?: ViewStyle;
}

// Example usage:
<PersonalityAnalytics
  userId="user123"
  timeRange="month"
  onInsightsLoaded={handleInsightsLoaded}
/>

// Related hooks:
const { insights, loading } = usePersonalityInsights(userId);
const { analyzeBehavior } = useBehaviorAnalysis(userId);
```

**Accessibility Notes:**
- Implements `accessibilityRole="region"` for analytics sections
- Each insight has appropriate labeling
- Supports screen reader navigation
- Provides clear feedback for data changes

**Performance Considerations:**
- Uses `SectionList` for optimized rendering
- Implements data prefetching
- Caches analytics data using `useQuery`
- Optimizes re-renders with `React.memo` 