import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Routes />
          <PortalHost />
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (isSignedIn && !inTabsGroup && segments[0] !== 'live-scan-result' && segments[0] !== 'scan-details' && segments[0] !== 'instructions') {
      // Redirect to tabs if signed in
      router.replace('/(tabs)/home');
    } else if (!isSignedIn && !inAuthGroup && segments[0] !== 'welcome') {
      // Redirect to welcome if not signed in
      router.replace('/welcome');
    }
  }, [isSignedIn, isLoaded, segments]);

  React.useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="welcome" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen name="(auth)/sign-in" options={{
        headerShown: false,
        title: 'Sign in',
      }} />
      <Stack.Screen name="(auth)/sign-up" options={{
        presentation: 'modal',
        title: '',
        headerTransparent: true,
        gestureEnabled: false,
      }} />
      <Stack.Screen name="(auth)/reset-password" options={{
        title: '',
        headerShadowVisible: false,
        headerTransparent: true,
      }} />
      <Stack.Screen name="(auth)/forgot-password" options={{
        title: '',
        headerShadowVisible: false,
        headerTransparent: true,
      }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="live-scan-result" options={{ headerShown: true, title: 'Scan Result' }} />
      <Stack.Screen name="scan-details" options={{ headerShown: true, title: 'Scan Details' }} />
      <Stack.Screen name="instructions" options={{ headerShown: true, title: 'Instructions' }} />
    </Stack>
  );
}
