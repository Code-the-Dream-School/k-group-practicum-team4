import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '../context/auth';
import logo from '../assets/images/logo.svg';

export default function AppHeader() {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/');
        } catch (err) {
            console.error('Sign out failed:', err);
        }
    };

    return (
        <SafeAreaView className="bg-indigo-600">
            <View className="flex-row items-center justify-between px-6 py-4">
                {/* Logo */}
                <Image
                    source={require('../assets/images/logo.png')}
                    style={{ width: 140, height: 40 }}
                    resizeMode="contain"
                />

                {/* Sign Out button */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="rounded-full border border-white/70 px-6 py-2.5"
                >
                    <Text className="text-white font-semibold text-base">
                        Sign Out
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
