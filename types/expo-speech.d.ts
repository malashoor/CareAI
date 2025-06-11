declare module 'expo-speech' {
  export interface SpeakOptions {
    language?: string;
    pitch?: number;
    rate?: number;
  }

  export function speak(text: string, options?: SpeakOptions): Promise<void>;
  export function stop(): Promise<void>;
  export function isSpeakingAsync(): Promise<boolean>;
} 