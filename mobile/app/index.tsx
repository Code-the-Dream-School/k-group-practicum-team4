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
                    paddingBottom: 60,
                    alignItems: 'center',
                }}
            >
                {/* Header / Logo area (optional – add your LOGOTYPE image if you have it) */}
                <View className="mb-12 items-center">
                    {/* Replace with real logo if you have asset */}
                    <Text className="text-4xl font-extrabold text-indigo-600">AI Study Hub</Text>
                    <Text className="text-sm text-slate-500 mt-1">Powered by AI</Text>
                </View>

                {/* Hero Section */}
                <View className="items-center mb-12">
                    <Text className="text-5xl font-black text-slate-900 text-center leading-tight mb-4">
                        UPLOAD. GENERATE. LEARN.
                    </Text>

                    <Text className="text-xl text-slate-600 text-center mb-8 max-w-md">
                        Upload your notes or PDF. Let AI create summaries, flashcards & quizzes. Study smarter in short sessions.
                    </Text>

                    {/* Hero Illustration – placeholder; replace with real image */}
                    <View className="w-full max-w-[320px] h-[260px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl items-center justify-center mb-10 shadow-lg">
                        <Text className="text-9xl">📚✨</Text>
                        {/* Real image example (add to assets/ folder):
            <Image
              source={require('../assets/hero-student-ai.png')}
              style={{ width: 280, height: 240 }}
              resizeMode="contain"
            />
            */}
                    </View>

                    {/* Primary CTA */}
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/register')}
                        className="bg-indigo-600 w-full max-w-sm rounded-2xl py-6 shadow-xl shadow-indigo-300 mb-4"
                    >
                        <Text className="text-white text-center text-xl font-bold">
                            Get Started – It's Free
                        </Text>
                    </TouchableOpacity>

                    {/* Secondary CTA */}
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/login')}
                        className="bg-white border-2 border-indigo-600 w-full max-w-sm rounded-2xl py-6"
                    >
                        <Text className="text-indigo-600 text-center text-xl font-bold">
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
                            { step: 1, title: 'Upload your material', desc: 'PDF, text, notes — anything you want to study' },
                            { step: 2, title: 'AI generates everything', desc: 'Summary, flashcards, quizzes in seconds' },
                            { step: 3, title: 'Study in short bursts', desc: '5–10 minute focused sessions' },
                            { step: 4, title: 'Track progress & improve', desc: 'See stats, set goals, repeat' },
                        ].map((item, index) => (
                            <View
                                key={index}
                                className="flex-row items-start bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                            >
                                <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-4 flex-shrink-0">
                                    <Text className="text-indigo-700 font-bold text-xl">{item.step}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-slate-900 mb-1">{item.title}</Text>
                                    <Text className="text-slate-600">{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Small progress teaser */}
                <View className="w-full items-center mb-12">
                    <Text className="text-2xl font-bold text-slate-900 mb-6">
                        See Your Progress Grow
                    </Text>
                    <View className="items-center">
                        <View className="w-44 h-44 rounded-full border-8 border-indigo-100 relative mb-4">
                            <View className="absolute inset-[10%] bg-indigo-100 rounded-full" />
                            <Text className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-indigo-700">
                                78%
                            </Text>
                        </View>
                        <Text className="text-slate-600 text-center max-w-xs">
                            Weekly activity, flashcards reviewed, quizzes completed — all in one place.
                        </Text>
                    </View>
                </View>

                {/* Final CTA */}
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    className="bg-indigo-600 w-full max-w-sm rounded-2xl py-6 shadow-xl shadow-indigo-300"
                >
                    <Text className="text-white text-center text-xl font-bold">
                        Start Learning Now
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
