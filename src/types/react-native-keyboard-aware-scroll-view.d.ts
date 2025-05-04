declare module 'react-native-keyboard-aware-scroll-view' {
  import { Component } from 'react';
  import { ScrollViewProps, ViewStyle } from 'react-native';

  export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
    enableOnAndroid?: boolean;
    enableAutomaticScroll?: boolean;
    keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
    contentContainerStyle?: ViewStyle;
  }

  export class KeyboardAwareScrollView extends Component<KeyboardAwareScrollViewProps> {}
} 