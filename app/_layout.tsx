import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { FoldersProvider } from '@/contexts/FoldersContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SettingsProvider>
        <FoldersProvider>
          <SafeAreaProvider>
          <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0a0a0a' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="note/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
          </SafeAreaProvider>
        </FoldersProvider>
      </SettingsProvider>
    </AlertProvider>
  );
}
