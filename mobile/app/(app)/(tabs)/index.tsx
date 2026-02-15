import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/auth';
import { useRouter } from 'expo-router';

// Mock data
const mockStats = [
    { id: 'docs', label: 'Documents', count: 32, icon: '📚', color: 'bg-purple-500' },
    { id: 'flashcards', label: 'Flashcards', count: 120, icon: '💡', color: 'bg-blue-500' },
    { id: 'quizzes', label: 'Quizzes', count: 8, icon: '❓', color: 'bg-green-500' },
];

const mockHistory = [
    { id: '1', title: 'Document uploaded: Principles.pdf', date: 'Today', type: 'upload' },
    { id: '2', title: 'Flashcards created from: React Notes', date: 'Yesterday', type: 'flashcards' },
    { id: '3', title: 'Quiz completed: JS Basics', date: '2 days ago', type: 'quiz' },
    { id: '4', title: 'Summary generated: AI Agents', date: '3 days ago', type: 'summary' },
];

export default function DashboardScreen() {
    const { user } = useAuth();
    const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User';
    const { signOut } = useAuth();
    const router = useRouter();
    const handleLogout = async () => {
        try {
            await signOut();                    // clears token + user state
            router.replace('/');                // back to landing page
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };
    const renderStatCard = (item: typeof mockStats[0]) => (
        <View className={`${item.color} rounded-3xl p-6 mb-4 shadow-lg shadow-purple-200/30`}>
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-4xl font-extrabold text-white">{item.count}</Text>
                    <Text className="text-lg font-medium text-white/90">{item.label}</Text>
                </View>
                <Text className="text-5xl opacity-90">{item.icon}</Text>
            </View>
        </View>
    );

    const renderHistoryItem = ({ item }: { item: typeof mockHistory[0] }) => (
        <TouchableOpacity className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100">
            <View className="flex-row items-center">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-xl">
                        {item.type === 'upload' ? '📄' : item.type === 'flashcards' ? '💡' : item.type === 'quiz' ? '❓' : '📝'}
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className="font-medium text-slate-900">{item.title}</Text>
                    <Text className="text-sm text-slate-500 mt-1">{item.date}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
                {/* Greeting */}
                <View className="w-full items-center mb-4">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-red-500 px-8 py-4 rounded-2xl"
                    >
                        <Text className="text-white font-bold text-lg">Sign Out</Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-3xl font-extrabold text-slate-900 mb-8">
                    Hi, {displayName}.
                </Text>

                {/* Stats Cards – stacked vertically */}
                <FlatList
                    data={mockStats}
                    renderItem={({ item }) => renderStatCard(item)}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    className="mb-10"
                />

                {/* Study Highlights */}
                <View className="bg-white rounded-3xl p-6 mb-8 shadow-sm">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-slate-900">Study Highlights</Text>
                        <TouchableOpacity className="bg-red-500 rounded-full px-4 py-2">
                            <Text className="text-white font-medium text-sm">Set Goal</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-slate-600 mb-4">Weekly Activity (7 days)</Text>

                    {/* Simple circular progress (mock) */}
                    <View className="items-center mb-6">
                        <View className="w-40 h-40 rounded-full border-8 border-slate-200 relative">
                            <View
                                className="absolute inset-0 bg-purple-100 rounded-full"
                                style={{ width: '75%', height: '75%', top: 0, left: 0 }}
                            />
                            <Text className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-purple-700">
                                75%
                            </Text>
                        </View>
                        <View className="flex-row mt-4 space-x-6">
                            <View className="items-center">
                                <Text className="text-purple-600 font-bold">80%</Text>
                                <Text className="text-xs text-slate-500">Flashcards</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-blue-600 font-bold">20%</Text>
                                <Text className="text-xs text-slate-500">Summaries</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-yellow-600 font-bold">25%</Text>
                                <Text className="text-xs text-slate-500">Quizzes</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <Text className="text-sm font-medium text-slate-700 mr-2">Today:</Text>
                        <View className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                            <View className="h-full bg-purple-600" style={{ width: '45%' }} />
                        </View>
                        <Text className="text-sm font-medium text-slate-700 ml-2">45%</Text>
                    </View>
                </View>

                {/* Study History */}
                <Text className="text-xl font-bold text-slate-900 mb-4">Study History</Text>
                <FlatList
                    data={mockHistory}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                />

                {/* Motivational footer */}
                <Text className="text-center text-slate-500 mt-10 mb-6 text-sm">
                    Short study sessions improve retention
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
