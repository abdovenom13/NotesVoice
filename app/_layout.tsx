import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { FoldersProvider } from '@/contexts/FoldersContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { TagsProvider } from '@/contexts/TagsContext';
import { LockScreen } from '@/components/feature';
import { useSecurity } from '@/hooks/useSecurity';

function AppContent() {
  const { isLocked } = useSecurity();

  if (isLocked) {
    return <LockScreen />;
  }

  return (
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
  );
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <SettingsProvider>
        <SecurityProvider>
          <TagsProvider>
            <FoldersProvider>
              <SafeAreaProvider>
                <StatusBar style="light" />
                <AppContent />
              </SafeAreaProvider>
            </FoldersProvider>
          </TagsProvider>
        </SecurityProvider>
      </SettingsProvider>
    </AlertProvider>
  );
}
