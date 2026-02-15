import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/auth';

const AVATARS = ['🐱', '🐶', '🦊', '🐨', '🦁'];

export default function RegisterScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await signUp({
                firstName,
                lastName,
                email,
                password,
                avatar: AVATARS[selectedAvatar],
            });
            router.replace('/(app)/(tabs)');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
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
                        <Text className="text-4xl font-extrabold text-slate-900">Create Account</Text>
                        <View className="h-1.5 w-12 bg-indigo-600 mt-3 rounded-full" />
                    </View>

                    {/* Error */}
                    {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

                    {/* Form */}
                    <View className="space-y-5">
                        <View>
                            <Text className="text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-widest">
                                First Name
                            </Text>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900"
                                placeholder="First Name"
                                value={firstName}
                                onChangeText={setFirstName}
                                editable={!loading}
                            />
                        </View>

                        <View>
                            <Text className="text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-widest">
                                Last Name
                            </Text>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900"
                                placeholder="Last Name"
                                value={lastName}
                                onChangeText={setLastName}
                                editable={!loading}
                            />
                        </View>

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

                        <View>
                            <Text className="text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-widest">
                                Confirm Password
                            </Text>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900"
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>

                        {/* Avatar */}
                        <View>
                            <Text className="text-slate-500 font-bold mb-2 uppercase text-[10px] tracking-widest">
                                Choose your avatar
                            </Text>
                            <View className="flex-row justify-between mt-2 px-2">
                                {AVATARS.map((emoji, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setSelectedAvatar(index)}
                                        disabled={loading}
                                        className={`w-12 h-12 items-center justify-center rounded-full ${
                                            selectedAvatar === index
                                                ? 'bg-indigo-100 border-2 border-indigo-500'
                                                : 'bg-slate-100 border border-slate-200'
                                        } ${loading ? 'opacity-50' : ''}`}
                                    >
                                        <Text className="text-xl">{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                            className={`bg-indigo-600 rounded-2xl py-5 shadow-lg shadow-indigo-200 mt-4 ${loading ? 'opacity-50' : ''}`}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-10 mb-6">
                        <Text className="text-slate-500">Already have an account?</Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-indigo-600 font-bold ml-1">Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
