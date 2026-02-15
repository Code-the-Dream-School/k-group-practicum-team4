import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import {
    getResourceById,
    generateResourceSummary,
    type ResourceDto,
} from '../../../api/apiClient'; // adjust path if needed

export default function ResourceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [resource, setResource] = useState<ResourceDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'resource' | 'summary' | 'flashcards' | 'quizzes'>('resource');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    useEffect(() => {
        if (!id) return;
        loadResource();
    }, [id]);

    const loadResource = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getResourceById(id);
            setResource(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load resource');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!resource?._id || isGeneratingSummary) return;

        try {
            setIsGeneratingSummary(true);
            await generateResourceSummary(resource._id);
            await loadResource(); // refresh to get new summary
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to generate summary');
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    // Back button now closes the screen/modal
    const handleBack = () => {
        router.back(); // ← This closes the detail screen and returns to Library tab
    };

    const renderTabContent = () => {
        if (isLoading) {
            return (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            );
        }

        if (error || !resource) {
            return (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-red-500 text-center mb-4">
                        {error || 'Resource not found'}
                    </Text>
                    <TouchableOpacity onPress={loadResource} className="bg-indigo-600 px-6 py-3 rounded-full">
                        <Text className="text-white font-medium">Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        switch (activeTab) {
            case 'resource':
                return (
                    <ScrollView className="flex-1 p-6 bg-white rounded-t-3xl">
                        <Text className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {resource.textContent || 'No content available.'}
                        </Text>
                    </ScrollView>
                );

            case 'summary':
                if (resource.summary?.content) {
                    return (
                        <ScrollView className="flex-1 p-6 bg-white rounded-t-3xl">
                            <Text className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {resource.summary.content}
                            </Text>
                            <Text className="text-xs text-slate-500 mt-4">
                                Generated on {new Date(resource.summary.createdAt).toLocaleString()}
                            </Text>
                        </ScrollView>
                    );
                }

                return (
                    <View className="flex-1 items-center justify-center bg-white rounded-t-3xl p-6">
                        <Text className="text-xl font-medium text-slate-700 mb-6 text-center">
                            No summary yet
                        </Text>
                        <TouchableOpacity
                            onPress={handleGenerateSummary}
                            disabled={isGeneratingSummary}
                            className="bg-indigo-600 px-8 py-4 rounded-full shadow-md"
                        >
                            {isGeneratingSummary ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Generate Summary</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                );

            case 'flashcards':
            case 'quizzes':
                return (
                    <View className="flex-1 items-center justify-center bg-white rounded-t-3xl p-6">
                        <Text className="text-xl font-medium text-slate-700 mb-6 text-center">
                            Coming soon
                        </Text>
                        <TouchableOpacity className="bg-indigo-600 px-8 py-4 rounded-full shadow-md">
                            <Text className="text-white font-bold text-lg">
                                Generate {activeTab === 'flashcards' ? 'Flashcards' : 'Quizzes'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header with Back button */}
            <View className="bg-indigo-600 px-6 pt-12 pb-6">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
                        <MaterialIcons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white flex-1 ml-4" numberOfLines={1}>
                        {resource?.title || 'Resource'}
                    </Text>
                </View>
            </View>

            {/* Tabs */}
            <View className="bg-white border-b border-slate-200">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="py-3 px-4" // reduced vertical padding
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    <View className="flex-row gap-2"> {/* smaller gap between buttons */}
                        {['resource', 'summary', 'flashcards', 'quizzes'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab as any)}
                                className={`px-5 py-2.5 rounded-full min-w-[90px] items-center ${
                                    activeTab === tab
                                        ? 'bg-indigo-600'
                                        : 'bg-slate-100'
                                }`}
                            >
                                <Text
                                    className={`text-sm font-medium ${
                                        activeTab === tab ? 'text-white' : 'text-slate-700'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Content */}
            {renderTabContent()}
        </SafeAreaView>
    );
}
