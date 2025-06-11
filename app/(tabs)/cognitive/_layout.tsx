import { Stack } from 'expo-router';

export default function CognitiveLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="exercise" />
      <Stack.Screen name="results" />
    </Stack>
  );
}