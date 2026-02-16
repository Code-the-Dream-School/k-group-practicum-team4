import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 40,
                    paddingBottom: 80,
                    alignItems: 'center',
                }}
            >
                {/* Logo + tagline */}
                <View className="mb-12 items-center">
                    <View className="bg-indigo-600 rounded-2xl p-4 shadow-lg">
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={{ width: 180, height: 60 }}
                            resizeMode="contain"
                        />
                    </View>
                    <Text className="text-sm text-slate-500 mt-3">Powered by AI</Text>
                </View>

                {/* Hero text */}
                <View className="items-center mb-12">
                    <Text className="text-5xl font-black text-indigo-600 text-center leading-tight mb-4">
                        UPLOAD. GENERATE. LEARN.
                    </Text>
                    <Text className="text-xl text-slate-600 text-center mb-8 max-w-md">
                        Upload your notes or PDF. Let AI create summaries, flashcards & quizzes. Study smarter in short sessions.
                    </Text>

                    {/* Hero image */}
                    <View className="w-full max-w-[360px] h-[300px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl items-center justify-center mb-10 shadow-xl">
                        <Image
                            source={require('../assets/images/hero-boy.png')}
                            style={{ width: 320, height: 280 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Primary CTA – bigger, more padding, stronger shadow */}
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/register')}
                        activeOpacity={0.85}
                        className="bg-indigo-600 w-full max-w-sm rounded-full py-6 px-10 shadow-2xl shadow-indigo-400/40 mb-5"
                    >
                        <Text className="text-white text-center text-2xl font-bold">
                            Get Started – It's Free
                        </Text>
                    </TouchableOpacity>

                    {/* Secondary CTA – thicker border, more padding */}
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/login')}
                        activeOpacity={0.85}
                        className="bg-white border-2 border-indigo-600 w-full max-w-sm rounded-full py-6 px-10 shadow-md mb-12"
                    >
                        <Text className="text-indigo-600 text-center text-2xl font-bold">
                            I already have an account
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* How It Works – vertical steps */}
                <View className="w-full mb-12">
                    <Text className="text-3xl font-bold text-slate-900 text-center mb-8">
                        How It Works
                    </Text>

                    <View className="space-y-6">
                        {[
                            {
                                step: 1,
                                title: 'Upload your material',
                                desc: 'PDF, text, notes — anything you want to study',
                            },
                            {
                                step: 2,
                                title: 'AI generates everything',
                                desc: 'Summary, flashcards, quizzes in seconds',
                            },
                            {
                                step: 3,
                                title: 'Study in short bursts',
                                desc: '5–10 minute focused sessions',
                            },
                            {
                                step: 4,
                                title: 'Track progress & improve',
                                desc: 'See stats, set goals, repeat',
                            },
                        ].map((item, index) => (
                            <View
                                key={index}
                                className="flex-row items-start bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                            >
                                <View className="w-14 h-14 bg-indigo-100 rounded-full items-center justify-center mr-5 flex-shrink-0">
                                    <Text className="text-indigo-700 font-bold text-2xl">{item.step}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xl font-semibold text-slate-900 mb-2">{item.title}</Text>
                                    <Text className="text-slate-600 text-lg">{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Progress teaser */}
                <View className="w-full items-center mb-12">
                    <Text className="text-2xl font-bold text-slate-900 mb-6">See Your Progress Grow</Text>
                    <View className="items-center">
                        <View className="w-48 h-48 rounded-full border-8 border-indigo-100 relative mb-4">
                            <View className="absolute inset-[12%] bg-indigo-100 rounded-full" />
                            <Text className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-indigo-700">
                                78%
                            </Text>
                        </View>
                        <Text className="text-slate-600 text-center max-w-xs text-lg">
                            Weekly activity, flashcards reviewed, quizzes completed — all in one place.
                        </Text>
                    </View>
                </View>

                {/* Final CTA */}
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    activeOpacity={0.85}
                    className="bg-indigo-600 w-full max-w-sm rounded-full py-6 px-10 shadow-2xl shadow-indigo-400/40"
                >
                    <Text className="text-white text-center text-2xl font-bold">
                        Start Learning Now
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
