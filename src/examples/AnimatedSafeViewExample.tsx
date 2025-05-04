import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import AnimatedSafeView from '../components/AnimatedSafeView';

/**
 * Example component demonstrating various animation techniques with AnimatedSafeView
 */
const AnimatedSafeViewExample: React.FC = () => {
  // Shared values for different animations
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Animated styles
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const translateStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withTiming(translateY.value, { duration: 500 }) },
    ],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        rotate: `${interpolate(
          rotation.value,
          [0, 1],
          [0, 360],
          Extrapolate.CLAMP
        )}deg` 
      },
    ],
  }));

  // Trigger animations
  useEffect(() => {
    // Start with a fade in
    opacity.value = withTiming(0.5, { duration: 1000 });
  }, []);

  const handlePress = () => {
    // Toggle scale
    scale.value = scale.value === 1 ? 1.5 : 1;
    
    // Toggle translation
    translateY.value = translateY.value === 0 ? 100 : 0;
    
    // Toggle rotation
    rotation.value = rotation.value === 0 ? 1 : 0;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AnimatedSafeView Examples</Text>
      
      {/* Fade animation */}
      <AnimatedSafeView style={[styles.box, fadeStyle]}>
        <Text style={styles.text}>Fade</Text>
      </AnimatedSafeView>

      {/* Scale animation */}
      <AnimatedSafeView style={[styles.box, scaleStyle]}>
        <Text style={styles.text}>Scale</Text>
      </AnimatedSafeView>

      {/* Translation animation */}
      <AnimatedSafeView style={[styles.box, translateStyle]}>
        <Text style={styles.text}>Translate</Text>
      </AnimatedSafeView>

      {/* Rotation animation */}
      <AnimatedSafeView style={[styles.box, rotateStyle]}>
        <Text style={styles.text}>Rotate</Text>
      </AnimatedSafeView>

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Animate All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AnimatedSafeViewExample; 