import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { getQuiz, submitQuiz, type QuizDetailDto, type QuizSubmitRequestDto } from '../../../../../api/apiClient';

type Props = {
    quizId: string;
    onBack: () => void;
    onFinish: (result: any) => void;
};

export default function QuizPlayer({ quizId, onBack, onFinish }: Props) {
    const [quiz, setQuiz] = useState<QuizDetailDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [startedAt] = useState(new Date().toISOString());

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        try {
            setIsLoading(true);
            const data = await getQuiz(quizId);
            setQuiz(data);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to load quiz');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (questionId: string, index: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: index }));
    };

    const handleNext = async () => {
        if (!quiz) return;

        if (currentQuestionIndex === quiz.questions.length - 1) {
            const submitAnswers = Object.entries(answers).map(([questionId, selectedIndex]) => ({
                questionId,
                selectedIndex,
            }));

            try {
                const result = await submitQuiz(quizId, {
                    answers: submitAnswers,
                    startedAt,
                });
                onFinish(result);
            } catch (err: any) {
                Alert.alert('Error', err.message || 'Failed to submit quiz');
            }
            return;
        }

        setCurrentQuestionIndex(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    if (!quiz) {
        return (
            <View className="flex-1 items-center justify-center p-6">
                <Text className="text-red-500 text-center mb-4">Quiz not found</Text>
                <TouchableOpacity onPress={onBack} className="bg-indigo-600 px-6 py-3 rounded-full">
                    <Text className="text-white font-medium">Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <ScrollView className="flex-1 bg-slate-50 p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={onBack} className="flex-row items-center">
                    <MaterialIcons name="arrow-back" size={28} color="#4f46e5" />
                    <Text className="ml-2 text-lg font-medium text-indigo-600">Back</Text>
                </TouchableOpacity>

                <Text className="text-lg font-semibold text-slate-700">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </Text>
            </View>

            {/* Question card – smaller font, more compact */}
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
                <Text className="text-xl font-bold text-slate-900 mb-5 leading-7">
                    {currentQuestion.prompt}
                </Text>

                {currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleSelect(currentQuestion.id, index)}
                        className={`py-3.5 px-4 mb-3 rounded-xl border ${
                            answers[currentQuestion.id] === index
                                ? 'bg-indigo-100 border-indigo-600'
                                : 'border-slate-300'
                        }`}
                    >
                        <Text className="text-base text-slate-800 leading-6">
                            {String.fromCharCode(65 + index)}. {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Next button – higher up, right after options */}
            <TouchableOpacity
                onPress={handleNext}
                disabled={answers[currentQuestion.id] === undefined}
                className={`py-4 rounded-full shadow-md mt-4 ${
                    answers[currentQuestion.id] === undefined ? 'bg-slate-300' : 'bg-indigo-600'
                }`}
            >
                <Text className="text-white font-bold text-center text-lg">
                    {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next'}
                </Text>
            </TouchableOpacity>

            {/* Extra bottom padding to avoid system bar overlap */}
            <View className="h-20" />
        </ScrollView>
    );
}
