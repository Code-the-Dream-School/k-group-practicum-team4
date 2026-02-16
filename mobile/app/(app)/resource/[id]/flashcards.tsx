import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    ActivityIndicator,
    Alert,
    FlatList,
    TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
    getFlashcardSetsByResource,
    getFlashcardSetById,
    generateFlashcards,
    deleteFlashcardSet,
    type FlashcardSetListItemDto,
    type FlashcardSetDetailDto,
} from '../../../../api/apiClient';
import FlashcardPlayer from "@/app/(app)/resource/[id]/components/FlashcardPlayer";

type Props = {
    resourceId: string;
    resourceTitle?: string;
};

export default function ResourceFlashcardsTab({ resourceId, resourceTitle }: Props) {
    const [sets, setSets] = useState<FlashcardSetListItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
    const [selectedSet, setSelectedSet] = useState<FlashcardSetDetailDto | null>(null);
    const [isLoadingSet, setIsLoadingSet] = useState(false);

    const [generateModalVisible, setGenerateModalVisible] = useState(false);
    const [generateCount, setGenerateCount] = useState('10');
    const [isGenerating, setIsGenerating] = useState(false);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadSets();
    }, [resourceId]);

    const loadSets = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getFlashcardSetsByResource(resourceId);
            setSets(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load flashcard sets');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        const count = parseInt(generateCount, 10);
        if (isNaN(count) || count < 1 || count > 50) {
            Alert.alert('Error', 'Please enter a number between 1 and 50');
            return;
        }

        try {
            setIsGenerating(true);
            await generateFlashcards({
                resourceId,
                title: resourceTitle || 'Flashcards',
                count,
            });
            setGenerateModalVisible(false);
            setGenerateCount('10');
            await loadSets();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to generate flashcards');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (setId: string) => {
        try {
            await deleteFlashcardSet(setId);
            setSets(sets.filter(s => s.id !== setId));
            if (selectedSetId === setId) {
                setSelectedSetId(null);
                setSelectedSet(null);
            }
            setDeleteModalVisible(false);
            setDeleteId(null);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete set');
        }
    };

    const openSet = async (setId: string) => {
        try {
            setIsLoadingSet(true);
            const data = await getFlashcardSetById(setId);
            setSelectedSet(data);
            setSelectedSetId(setId);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to load set');
        } finally {
            setIsLoadingSet(false);
        }
    };

    if (selectedSetId && selectedSet) {
        return (
            <FlashcardPlayer
                cards={selectedSet.cards}
                onBack={() => {
                    setSelectedSetId(null);
                    setSelectedSet(null);
                }}
            />
        );
    }

    return (
        <View className="flex-1 bg-slate-50 p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-slate-900">Flashcards</Text>
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

            {error && (
                <Text className="text-red-500 text-center mb-6">{error}</Text>
            )}

            {isLoading ? (
                <ActivityIndicator size="large" color="#4f46e5" />
            ) : sets.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-xl text-slate-600 mb-6 text-center">
                        No flashcard sets yet
                    </Text>
                    <TouchableOpacity
                        onPress={() => setGenerateModalVisible(true)}
                        className="bg-indigo-600 px-8 py-4 rounded-full shadow-md"
                    >
                        <Text className="text-white font-bold">Generate Flashcards</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={sets}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View className="mb-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-slate-900 mb-1">
                                        {item.title}
                                    </Text>
                                    <Text className="text-sm text-slate-500">
                                        Created {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
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
                                onPress={() => openSet(item.id)}
                                className="mt-4 bg-indigo-50 py-3 rounded-xl items-center"
                            >
                                <Text className="text-indigo-700 font-medium">
                                    Open Set
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Generate Modal */}
            <Modal
                visible={generateModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setGenerateModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-2xl font-bold mb-4">Generate Flashcards</Text>

                        <Text className="text-slate-600 mb-2">Number of questions</Text>
                        <TextInput
                            className="border border-slate-300 rounded-xl p-4 mb-6 text-lg"
                            keyboardType="numeric"
                            value={generateCount}
                            onChangeText={setGenerateCount}
                            placeholder="10"
                        />

                        <View className="flex-row justify-end gap-4">
                            <TouchableOpacity
                                onPress={() => setGenerateModalVisible(false)}
                                className="px-6 py-3 border border-slate-300 rounded-xl"
                            >
                                <Text className="text-slate-700">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleGenerate}
                                disabled={isGenerating}
                                className="bg-indigo-600 px-6 py-3 rounded-xl"
                            >
                                <Text className="text-white font-bold">
                                    {isGenerating ? 'Generating...' : 'Generate'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold mb-4">Delete Flashcard Set?</Text>
                        <Text className="text-slate-600 mb-6">
                            This action cannot be undone.
                        </Text>

                        <View className="flex-row justify-end gap-4">
                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                className="px-6 py-3 border border-slate-300 rounded-xl"
                            >
                                <Text className="text-slate-700">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (deleteId) handleDelete(deleteId);
                                }}
                                className="bg-red-600 px-6 py-3 rounded-xl"
                            >
                                <Text className="text-white font-bold">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
