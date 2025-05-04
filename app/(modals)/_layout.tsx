import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="add-medication"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'slide_from_bottom'
        }}
      />
    </Stack>
  );
} 