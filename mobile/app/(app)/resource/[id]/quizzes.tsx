import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    FlatList,
    TextInput,
    Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
    getResourceQuizzes,
    generateQuiz,
    deleteQuizSet,
    type QuizListItemDto,
} from '../../../../api/apiClient';

import QuizPlayer from './components/QuizPlayer';
import QuizResult from './components/QuizResult';

type Props = {
    resourceId: string;
    resourceTitle?: string;
};

export default function ResourceQuizzesTab({ resourceId, resourceTitle }: Props) {
    const [quizzes, setQuizzes] = useState<QuizListItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [generateModalVisible, setGenerateModalVisible] = useState(false);
    const [questionCount, setQuestionCount] = useState('5');
    const [isGenerating, setIsGenerating] = useState(false);

    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [quizResult, setQuizResult] = useState<any>(null);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadQuizzes();
    }, [resourceId]);

    const loadQuizzes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getResourceQuizzes(resourceId);
            setQuizzes(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load quizzes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        const count = parseInt(questionCount, 10);
        if (isNaN(count) || count < 1 || count > 20) {
            Alert.alert('Error', 'Please enter a number between 1 and 20');
            return;
        }

        try {
            setIsGenerating(true);
            await generateQuiz(resourceId, count);
            setGenerateModalVisible(false);
            setQuestionCount('5');
            await loadQuizzes();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to generate quiz');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (quizId: string) => {
        try {
            await deleteQuizSet(quizId);
            setQuizzes(quizzes.filter(q => q.id !== quizId));
            if (selectedQuizId === quizId) {
                setSelectedQuizId(null);
                setQuizResult(null);
            }
            setDeleteModalVisible(false);
            setDeleteId(null);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete quiz');
        }
    };

    if (quizResult) {
        return (
            <QuizResult
                result={quizResult}
                onBack={() => {
                    setQuizResult(null);
                    setSelectedQuizId(null);
                    loadQuizzes();
                }}
            />
        );
    }

    if (selectedQuizId) {
        return (
            <QuizPlayer
                quizId={selectedQuizId}
                onBack={() => setSelectedQuizId(null)}
                onFinish={(result) => setQuizResult(result)}
            />
        );
    }

    return (
        <FlatList
            data={quizzes}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
                <>
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold text-slate-900">Quizzes</Text>
                        <TouchableOpacity
                            onPress={() => setGenerateModalVisible(true)}
                            disabled={isGenerating}
                            className="bg-indigo-600 px-6 py-3 rounded-full shadow-md"
                        >
                            <Text className="text-white font-medium">
                                {isGenerating ? 'Generating...' : 'Generate'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {error && <Text className="text-red-500 text-center mb-6">{error}</Text>}

                    {isLoading && (
                        <ActivityIndicator size="large" color="#4f46e5" className="my-10" />
                    )}
                </>
            }
            ListEmptyComponent={
                !isLoading && (
                    <View className="flex-1 items-center justify-center py-20">
                        <Text className="text-xl text-slate-600 mb-6 text-center">
                            No quizzes yet
                        </Text>
                        <TouchableOpacity
                            onPress={() => setGenerateModalVisible(true)}
                            className="bg-indigo-600 px-8 py-4 rounded-full shadow-md"
                        >
                            <Text className="text-white font-bold">Generate Quiz</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
            renderItem={({ item }) => (
                <View className="mb-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900">{item.title}</Text>
                            <Text className="text-sm text-slate-500 mt-1">
                                Created {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                            {item.lastScore != null && (
                                <Text className="text-sm text-green-600 mt-1">
                                    Last score: {item.lastScore}%
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setDeleteId(item.id);
                                setDeleteModalVisible(true);
                            }}
                        >
                            <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => setSelectedQuizId(item.id)}
                        className="mt-4 bg-indigo-50 py-3 rounded-xl items-center"
                    >
                        <Text className="text-indigo-700 font-medium">
                            Start Quiz ({item.questionCount} questions)
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListFooterComponent={
                quizzes.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setGenerateModalVisible(true)}
                        className="bg-indigo-600 py-4 rounded-full shadow-md mt-6"
                    >
                        <Text className="text-white font-bold text-center text-lg">
                            Generate Another Quiz
                        </Text>
                    </TouchableOpacity>
                )
            }
        />
    );
}
