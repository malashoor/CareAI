import { Stack } from 'expo-router';

export default function AppointmentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="book" />
      <Stack.Screen name="details" />
    </Stack>
  );
}