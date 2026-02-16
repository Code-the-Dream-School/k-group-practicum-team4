import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
    result: {
        scorePercent: number;
        correctCount: number;
        totalQuestions: number;
        results: {
            questionId: string;
            prompt: string;
            options: string[];
            selectedIndex: number;
            correctIndex: number;
            isCorrect: boolean;
            explanation?: string;
        }[];
    };
    onBack: () => void;
};

export default function QuizResult({ result, onBack }: Props) {
    const { scorePercent, correctCount, totalQuestions, results } = result;

    return (
        <ScrollView className="flex-1 bg-slate-50 p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
                <TouchableOpacity onPress={onBack} className="flex-row items-center">
                    <MaterialIcons name="arrow-back" size={28} color="#4f46e5" />
                    <Text className="ml-2 text-lg font-medium text-indigo-600">Back</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Quiz Result</Text>
            </View>

            {/* Score card */}
            <View className="bg-white rounded-2xl p-8 mb-8 shadow-md items-center">
                <Text className="text-5xl font-extrabold text-indigo-600 mb-2">
                    {scorePercent}%
                </Text>
                <Text className="text-xl font-semibold text-slate-700 mb-4">
                    {correctCount} / {totalQuestions} correct
                </Text>
                <Text className="text-lg text-green-600">
                    {scorePercent >= 80 ? "You're on the right track!" : 'Keep practicing!'}
                </Text>
            </View>

            {/* Breakdown */}
            <Text className="text-2xl font-bold mb-6">Your Answers</Text>

            {results.map((r, index) => (
                <View
                    key={r.questionId}
                    className={`bg-white rounded-2xl p-6 mb-6 shadow-sm border-l-4 ${
                        r.isCorrect ? 'border-green-500' : 'border-red-500'
                    }`}
                >
                    <Text className="text-lg font-bold mb-3">
                        Q{index + 1}: {r.prompt}
                    </Text>

                    <Text className={`font-medium mb-2 ${r.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        Your answer: {r.options[r.selectedIndex]}
                    </Text>

                    {!r.isCorrect && (
                        <Text className="font-medium text-green-600 mb-2">
                            Correct answer: {r.options[r.correctIndex]}
                        </Text>
                    )}

                    {r.explanation && (
                        <Text className="text-slate-600 mt-2">
                            Explanation: {r.explanation}
                        </Text>
                    )}
                </View>
            ))}

            <TouchableOpacity
                onPress={onBack}
                className="bg-indigo-600 py-4 rounded-full shadow-md mb-10"
            >
                <Text className="text-white font-bold text-center text-lg">Finish</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
