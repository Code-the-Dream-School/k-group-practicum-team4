import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/auth'; // adjust path if needed

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Call real API via context
            await signIn(email, password);
            router.replace('/(app)/(tabs)'); // go to dashboard
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    paddingHorizontal: 32,
                    paddingVertical: 20,
                }}
            >
                {/* Header */}
                <View className="items-center mb-12">
                    <Text className="text-4xl font-extrabold text-slate-900">Welcome Back</Text>
                    <View className="h-1.5 w-12 bg-indigo-600 mt-3 rounded-full" />
                </View>

                {/* Error */}
                {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

                {/* Form */}
                <View className="space-y-5">
                    <View>
                        <Text className="text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-widest">
                            Email Address
                        </Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900"
                            placeholder="name@company.com"
                            placeholderTextColor="#94a3b8"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                        />
                    </View>

                    <View>
                        <Text className="text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-widest">
                            Password
                        </Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900"
                            placeholder="••••••••"
                            placeholderTextColor="#94a3b8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                        className={`bg-indigo-600 rounded-2xl py-5 shadow-lg shadow-indigo-200 mt-4 ${loading ? 'opacity-50' : ''}`}
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="flex-row justify-center mt-10 mb-6">
                    <Text className="text-slate-500">Don't have an account?</Text>
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                            <Text className="text-indigo-600 font-bold ml-1">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
