import "../global.css";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router'; // removed unused Redirect
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/context/auth';

// Force start on dashboard for testing
export const unstable_settings = {
  initialRouteName: '(app)/(tabs)',  // ← this should take priority now
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
  );
}

function RootLayoutNav() {
    const { user, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            console.log('[Auth] Loading auth state...');
            return;
        }

        console.log('[Auth] Segments:', segments);
        console.log('[Auth] User exists?', !!user);

        // Detect if we are on the landing page (root)
        const isOnLanding =
            segments.length === 0 ||
            segments[0] === '' ||
            segments[0] === 'index';

        // VERY IMPORTANT: Completely skip redirect logic when on landing
        if (isOnLanding) {
            console.log('[Auth] On landing page → NO redirect allowed');
            return;
        }

        // Only apply auth protection for other routes
        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';

        if (!user && !inAuthGroup) {
            console.log('[Auth] Not logged in → redirect to login');
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            console.log('[Auth] Logged in → redirect to dashboard');
            router.replace('/(app)/(tabs)');
        }
    }, [user, segments, isLoading, router]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />           {/* Landing page */}
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
    );
}
