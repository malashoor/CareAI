declare module 'react-native' {
  import { ComponentType } from 'react';
  
  export const View: ComponentType<any>;
  export const Text: ComponentType<any>;
  export const TextInput: ComponentType<any>;
  export const TouchableOpacity: ComponentType<any>;
  export const ActivityIndicator: ComponentType<any>;
  export const ScrollView: ComponentType<any>;
  
  export interface PlatformStatic {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select: (obj: { [key: string]: any }) => any;
  }
  
  export const Platform: PlatformStatic;
  
  export interface StyleSheetStatic {
    create: <T>(styles: T) => T;
  }
  
  export const StyleSheet: StyleSheetStatic;
  
  export interface Animated {
    timing: (value: any, config: any) => {
      start: (callback?: () => void) => void;
    };
  }
  
  export const Animated: Animated;
} 