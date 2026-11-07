import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '@/lib/store';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.ink,
            headerTitleStyle: { fontWeight: '700' },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="new" options={{ presentation: 'fullScreenModal', headerShown: false, contentStyle: { backgroundColor: colors.ink } }} />
          <Stack.Screen name="quote/[id]" options={{ title: '' }} />
          <Stack.Screen name="settings" options={{ title: 'Your business', presentation: 'modal' }} />
          <Stack.Screen name="prices" options={{ title: 'My materials & prices' }} />
          <Stack.Screen name="import-materials" options={{ title: 'Import materials' }} />
          <Stack.Screen name="welcome" options={{ presentation: 'fullScreenModal', headerShown: false, contentStyle: { backgroundColor: colors.ink } }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
