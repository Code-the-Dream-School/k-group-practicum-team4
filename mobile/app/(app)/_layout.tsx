import { Stack } from 'expo-router';

export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Tabs group */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
                name="resource/[id]"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack>
    );
}
