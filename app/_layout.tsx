import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { DrawerProvider } from '@/context/DrawerContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import AppDrawer from '@/components/ui/AppDrawer';
import { View } from 'react-native';

function RootWithDrawer({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <AppDrawer />
    </View>
  );
}

function ThemedApp() {
  const { colors } = useTheme();

  return (
    <AuthProvider>
      <DrawerProvider>
        <ToastProvider>
          {/* The header bar stays maroon in both themes, so status bar icons stay light. */}
          <StatusBar style="light" backgroundColor={colors.maroon.dark} />
          <RootWithDrawer>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
              </Stack>
            </View>
          </RootWithDrawer>
        </ToastProvider>
      </DrawerProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
