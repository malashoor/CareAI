import React from 'react';
import { ViewStyle, ViewProps } from 'react-native';
import Animated, { AnimateProps } from 'react-native-reanimated';

/**
 * A wrapper component that provides a type-safe way to use animated styles with React Native Reanimated.
 * 
 * @example
 * ```tsx
 * // Basic usage with shared value
 * const opacity = useSharedValue(1);
 * const animatedStyle = useAnimatedStyle(() => ({
 *   opacity: opacity.value
 * }));
 * 
 * return <AnimatedSafeView style={animatedStyle}>Content</AnimatedSafeView>;
 * 
 * // Usage with spring animation
 * const scale = useSharedValue(1);
 * const animatedStyle = useAnimatedStyle(() => ({
 *   transform: [{ scale: withSpring(scale.value) }]
 * }));
 * 
 * return <AnimatedSafeView style={animatedStyle}>Content</AnimatedSafeView>;
 * ```
 * 
 * @remarks
 * This component is compatible with:
 * - useSharedValue
 * - useAnimatedStyle
 * - withTiming
 * - withSpring
 * - interpolated values
 * - derived values
 * 
 * @param props - Component props
 * @param props.style - Animated style object created with useAnimatedStyle
 * @param props.children - Child components to render
 * @param props.rest - Additional ViewProps to pass to the underlying Animated.View
 */
type AnimatedViewProps = {
  style?: AnimateProps<ViewStyle>['style'];
  children?: React.ReactNode;
} & ViewProps;

const AnimatedSafeView: React.FC<AnimatedViewProps> = ({ style, children, ...rest }) => {
  return (
    <Animated.View 
      style={style} 
      {...rest}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedSafeView; 