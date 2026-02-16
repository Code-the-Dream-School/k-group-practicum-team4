import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '../../../context/auth';
import { getDashboardData, getActivityLog, type DashboardResponse, type ActivityLogItemDto } from '../../../api/apiClient';


import DocStatIcon from '../../../assets/images/DocStatIcon.png';
import FlashStatIcon from '../../../assets/images/FlashStatIcon.png';
import QuizzesStatIcon from '../../../assets/images/QuizzesStatIcon.png';
import AppHeader from "@/components/AppHeader";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type User = { firstName: string; lastName: string };

type DashboardStats = {
    documents: number;
    flashcards: number;
    quizzes: number;
};

type WeeklyActivity = {
    flashcards: number;
    summaries: number;
    quizzes: number;
};

type TodayStats = {
    studiedMinutes: number;
    goalMinutes: number;
    flashcardsReviewed: number;
    quizzesCompleted: number;
};

// ──────────────────────────────────────────────
// Dashboard Screen
// ──────────────────────────────────────────────

export default function DashboardScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const displayName = user?.displayName?.trim() || '';
    const firstName = useMemo(() => {
        if (!displayName) return 'Student';
        const parts = displayName.split(' ').filter(Boolean);
        return parts[0] || 'Student';
    }, [displayName]);

    const [stats, setStats] = useState<DashboardStats>({ documents: 0, flashcards: 0, quizzes: 0 });
    const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity>({ flashcards: 0, summaries: 0, quizzes: 0 });
    const [todayStats, setTodayStats] = useState<TodayStats>({
        studiedMinutes: 0,
        goalMinutes: 60, // default goal
        flashcardsReviewed: 0,
        quizzesCompleted: 0,
    });
    const [activity, setActivity] = useState<ActivityLogItemDto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [goalModalVisible, setGoalModalVisible] = useState(false);
    const [goalInput, setGoalInput] = useState<string>(todayStats.goalMinutes.toString());

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [dashboardData, activityLog] = await Promise.all([
                getDashboardData(),
                getActivityLog(10),
            ]);

            setStats({
                documents: dashboardData.stats.documentsCount,
                flashcards: dashboardData.stats.flashcardsCount,
                quizzes: dashboardData.stats.quizzesCount,
            });

            setWeeklyActivity(dashboardData.weeklyActivity);

            setTodayStats(prev => ({
                ...prev,
                studiedMinutes: dashboardData.todayActivity?.studiedMinutes ?? 0,
                flashcardsReviewed: dashboardData.todayActivity?.flashcardsReviewed ?? 0,
                quizzesCompleted: dashboardData.todayActivity?.quizzesCompleted ?? 0,
            }));

            setActivity(activityLog);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveGoal = () => {
        const minutes = parseInt(goalInput, 10);
        if (isNaN(minutes) || minutes < 5 || minutes > 240) {
            Alert.alert('Invalid Goal', 'Please enter a number between 5 and 240 minutes');
            return;
        }

        setTodayStats(prev => ({ ...prev, goalMinutes: minutes }));
        setGoalModalVisible(false);
    };

    const weeklyTotal = weeklyActivity.flashcards + weeklyActivity.summaries + weeklyActivity.quizzes;
    const flashcardsPct = weeklyTotal > 0 ? (weeklyActivity.flashcards / weeklyTotal) * 100 : 0;
    const summariesPct = weeklyTotal > 0 ? (weeklyActivity.summaries / weeklyTotal) * 100 : 0;
    const quizzesPct = weeklyTotal > 0 ? (weeklyActivity.quizzes / weeklyTotal) * 100 : 0;

    const todayProgress = todayStats.goalMinutes > 0
        ? Math.min((todayStats.studiedMinutes / todayStats.goalMinutes) * 100, 100)
        : 0;

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <AppHeader />
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
                {/* Greeting */}
                <Text className="text-3xl font-extrabold text-slate-900 mb-8">
                    Hi, {firstName}
                </Text>

                {error && (
                    <Text className="text-red-500 text-center mb-6">{error}</Text>
                )}

                {/* Stats Cards – stacked vertically with custom images */}
                <View className="space-y-4 mb-10">
                    {/* Documents */}
                    <View className="bg-purple-600 rounded-3xl p-6 shadow-lg shadow-purple-300/30">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-5xl font-extrabold text-white">{stats.documents}</Text>
                                <Text className="text-xl font-medium text-white/90 mt-1">Documents</Text>
                            </View>
                            <Image
                                source={DocStatIcon}
                                style={{ width: 80, height: 80 }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Flashcards */}
                    <View className="bg-indigo-600 rounded-3xl p-6 shadow-lg shadow-indigo-300/30">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-5xl font-extrabold text-white">{stats.flashcards}</Text>
                                <Text className="text-xl font-medium text-white/90 mt-1">Flashcards</Text>
                            </View>
                            <Image
                                source={FlashStatIcon}
                                style={{ width: 80, height: 80 }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Quizzes */}
                    <View className="bg-violet-600 rounded-3xl p-6 shadow-lg shadow-violet-300/30">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-5xl font-extrabold text-white">{stats.quizzes}</Text>
                                <Text className="text-xl font-medium text-white/90 mt-1">Quizzes</Text>
                            </View>
                            <Image
                                source={QuizzesStatIcon}
                                style={{ width: 80, height: 80 }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>

                {/* Study Highlights */}
                <View className="bg-white rounded-3xl p-6 mb-8 shadow-sm">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-slate-900">Study Highlights</Text>
                        <TouchableOpacity
                            onPress={() => setGoalModalVisible(true)}
                            className="bg-indigo-600 px-5 py-2.5 rounded-full"
                        >
                            <Text className="text-white font-medium text-sm">Set Goal</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Weekly Activity */}
                    <Text className="text-base font-semibold mb-4">Weekly Activity (last 7 days)</Text>

                    {/* Simple pie chart mock */}
                    <View className="items-center mb-6">
                        <View className="w-40 h-40 rounded-full border-8 border-slate-200 relative overflow-hidden">
                            <View
                                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-white"
                                style={{ transform: [{ rotate: '0deg' }] }}
                            />
                            <View className="absolute inset-0 flex items-center justify-center">
                                <Text className="text-3xl font-bold text-white">
                                    {Math.round((weeklyTotal / 100) * 100)}%
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row mt-4 space-x-6">
                            <View className="items-center">
                                <Text className="text-purple-600 font-bold">{Math.round(flashcardsPct)}%</Text>
                                <Text className="text-xs text-slate-500">Flashcards</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-indigo-600 font-bold">{Math.round(summariesPct)}%</Text>
                                <Text className="text-xs text-slate-500">Summaries</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-black font-bold">{Math.round(quizzesPct)}%</Text>
                                <Text className="text-xs text-black">Quizzes</Text>
                            </View>
                        </View>
                    </View>

                    {/* Today Progress */}
                    <Text className="text-base font-semibold mb-2">Today</Text>
                    <View className="flex-row items-center mb-4">
                        <Text className="text-sm font-medium text-slate-700 mr-3">
                            {todayStats.studiedMinutes} min
                        </Text>
                        <View className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-indigo-600"
                                style={{ width: `${todayProgress}%` }}
                            />
                        </View>
                        <Text className="text-sm font-medium text-slate-700 ml-3">
                            {todayStats.goalMinutes} min
                        </Text>
                    </View>

                    <View className="space-y-2 text-base">
                        <Text>Flashcards Reviewed: {todayStats.flashcardsReviewed} cards</Text>
                        <Text>Quizzes Completed: {todayStats.quizzesCompleted} quizzes</Text>
                    </View>
                </View>

                {/* Study History */}
                <Text className="text-xl font-bold text-slate-900 mb-4">Study History</Text>
                {activity.length === 0 ? (
                    <Text className="text-slate-500 text-center py-6">No activity yet</Text>
                ) : (
                    activity.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-slate-100"
                            onPress={() => {
                                // TODO: navigate to resource if item has resourceId
                                Alert.alert('History Item', item.type);
                            }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-4">
                                    <MaterialIcons
                                        name={
                                            item.type === 'resource_uploaded' ? 'description' :
                                                item.type === 'summary_created' ? 'summarize' :
                                                    item.type === 'flashcards_created' ? 'flash-on' :
                                                        'quiz'
                                        }
                                        size={28}
                                        color="#4f46e5"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-medium text-slate-900">
                                        {item.type.replace('_', ' ').toUpperCase()} - {item.resourceTitle || 'Untitled'}
                                    </Text>
                                    <Text className="text-sm text-slate-500 mt-1">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* Motivational footer */}
                <Text className="text-center text-slate-500 mt-10 mb-20 text-sm">
                    Short study sessions improve retention
                </Text>
            </ScrollView>

            {/* Set Goal Modal */}
            <Modal
                visible={goalModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setGoalModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 w-full max-w-sm">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-slate-900">Set Your Daily Study Goal</Text>
                            <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
                                <MaterialIcons name="close" size={28} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-slate-600 mb-4">
                            How many minutes would you like to study each day?
                        </Text>

                        <TextInput
                            className="border border-slate-300 rounded-xl p-4 mb-6 text-lg"
                            keyboardType="numeric"
                            value={goalInput}
                            onChangeText={setGoalInput}
                            placeholder="Daily Goal (minutes)"
                        />

                        <View className="flex-row justify-end gap-4">
                            <TouchableOpacity
                                onPress={() => setGoalModalVisible(false)}
                                className="px-6 py-3 border border-slate-300 rounded-xl"
                            >
                                <Text className="text-slate-700">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveGoal}
                                className="bg-indigo-600 px-6 py-3 rounded-xl"
                            >
                                <Text className="text-white font-bold">Save Goal</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-xs text-slate-400 mt-4">
                            * You can update this goal anytime.
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
