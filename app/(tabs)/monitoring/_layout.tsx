import { Stack } from 'expo-router';

export default function MonitoringLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="fall-details" />
    </Stack>
  );
}