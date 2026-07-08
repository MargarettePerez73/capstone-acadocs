import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { DrawerProvider } from '@/context/DrawerContext';
import { ToastProvider } from '@/context/ToastContext';
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <DrawerProvider>
        <ToastProvider>
          <StatusBar style="light" backgroundColor="#5C0016" />
          <RootWithDrawer>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
            </Stack>
          </RootWithDrawer>
        </ToastProvider>
      </DrawerProvider>
    </AuthProvider>
  );
}
