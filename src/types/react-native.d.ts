import 'react-native';
import { ComponentType } from 'react';

declare module 'react-native' {
  export namespace Animated {
    export interface AnimatedProps {
      style?: WithAnimatedValue<ViewStyle>;
    }

    export interface WithAnimatedValue<T> {
      __isAnimatedValue: true;
      value: T;
    }

    export class Value {
      constructor(value: number);
      setValue(value: number): void;
      getValue(): number;
    }

    export class AnimatedInterpolation {
      interpolate(config: {
        inputRange: number[];
        outputRange: number[];
      }): AnimatedInterpolation;
    }

    export const View: ComponentType<AnimatedProps>;
  }
} 