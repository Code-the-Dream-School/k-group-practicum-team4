import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    FlatList,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// API imports (adjust paths as needed)
import {
    getUserResources,
    createResource,
    deleteResource,
    askAi,
    type ResourceDto,
} from '../../../api/apiClient'; // your apiClient path

export default function LibraryScreen() {
    const router = useRouter();

    // Resources
    const [resources, setResources] = useState<ResourceDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Upload modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newText, setNewText] = useState('');
    const [newTagInput, setNewTagInput] = useState('');
    const [newTags, setNewTags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // AI Workspace
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Load resources
    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getUserResources();
            setResources(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load resources');
        } finally {
            setIsLoading(false);
        }
    };

    // Tags
    const addTag = () => {
        const trimmed = newTagInput.trim();
        if (trimmed && !newTags.includes(trimmed)) {
            setNewTags([...newTags, trimmed]);
            setNewTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setNewTags(newTags.filter(t => t !== tag));
    };

    // Save resource
    const handleSaveResource = async () => {
        if (!newTitle.trim()) return Alert.alert('Error', 'Title is required');
        if (!newText.trim()) return Alert.alert('Error', 'Content is required');

        try {
            setIsSaving(true);
            await createResource({
                title: newTitle.trim(),
                textContent: newText.trim(),
                tags: newTags,
            });
            setModalVisible(false);
            resetForm();
            await loadResources();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setNewTitle('');
        setNewText('');
        setNewTags([]);
        setNewTagInput('');
    };

    // Ask AI
    const handleAskAi = async () => {
        const prompt = aiPrompt.trim();
        if (!prompt) return;

        try {
            setIsAiLoading(true);
            setAiError(null);
            const response = await askAi(prompt);
            setAiResponse(response);
        } catch (err: any) {
            setAiError(err.message || 'AI request failed');
        } finally {
            setIsAiLoading(false);
        }
    };

    // Render single resource card
    const renderResource = ({ item }: { item: ResourceDto }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: `/resource/${item._id}` })}
            className="mb-4 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-3">
                <Text className="text-lg font-bold text-slate-900 flex-1 mr-2" numberOfLines={2}>
                    {item.title}
                </Text>
                <TouchableOpacity onPress={() => Alert.alert('Delete', 'Coming soon')}>
                    <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-2 mb-3">
                {item.tags.map(tag => (
                    <View key={tag} className="bg-indigo-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium text-indigo-700">{tag}</Text>
                    </View>
                ))}
            </View>

            <Text className="text-xs text-slate-500">
                Created {new Date(item.createdAt).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-indigo-600 px-6 pt-12 pb-6">
                <Text className="text-3xl font-extrabold text-white mb-4">My Library</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-white rounded-full py-4 px-6 self-start shadow-md"
                >
                    <Text className="text-indigo-600 font-bold text-center">Upload Resource</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Resources Section */}
                {error ? (
                    <Text className="text-red-500 text-center mb-6">{error}</Text>
                ) : isLoading ? (
                    <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
                ) : resources.length === 0 ? (
                    <Text className="text-slate-500 text-center py-12">
                        No resources yet. Upload your first study material!
                    </Text>
                ) : (
                    <FlatList
                        data={resources}
                        renderItem={renderResource}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

                {/* AI Workspace */}
                <View className="mt-10 mb-20">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons name="auto-awesome" size={28} color="#4f46e5" />
                        <Text className="text-2xl font-bold text-slate-900 ml-3">AI Workspace</Text>
                    </View>

                    <View className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        {aiError && <Text className="text-red-500 mb-4">{aiError}</Text>}

                        {aiResponse ? (
                            <View className="mb-6 bg-slate-50 p-4 rounded-xl">
                                <Text className="text-slate-800 whitespace-pre-wrap">{aiResponse}</Text>
                                <View className="flex-row gap-3 mt-4">
                                    <TouchableOpacity
                                        onPress={() => navigator.clipboard.writeText(aiResponse)}
                                        className="bg-indigo-100 px-4 py-2 rounded-full"
                                    >
                                        <Text className="text-indigo-700">Copy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            // TODO: open upload modal with AI response as content
                                            Alert.alert('Saved as new resource');
                                        }}
                                        className="bg-indigo-100 px-4 py-2 rounded-full"
                                    >
                                        <Text className="text-indigo-700">Save as Resource</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : null}

                        <View className="flex-row items-center bg-slate-100 rounded-full px-4">
                            <TextInput
                                className="flex-1 py-4 text-slate-900"
                                placeholder="Ask anything about your materials..."
                                value={aiPrompt}
                                onChangeText={setAiPrompt}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={handleAskAi}
                                disabled={isAiLoading || !aiPrompt.trim()}
                                className="p-3"
                            >
                                {isAiLoading ? (
                                    <ActivityIndicator size="small" color="#4f46e5" />
                                ) : (
                                    <MaterialIcons name="send" size={24} color="#4f46e5" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Upload Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-slate-900">Upload Resource</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={28} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            className="border border-slate-300 rounded-xl p-4 mb-4"
                            placeholder="Resource Title"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />

                        <View className="flex-row items-center mb-4">
                            <TextInput
                                className="flex-1 border border-slate-300 rounded-xl p-4"
                                placeholder="Add tag..."
                                value={newTagInput}
                                onChangeText={setNewTagInput}
                            />
                            <TouchableOpacity onPress={addTag} className="ml-2 bg-indigo-600 p-4 rounded-xl">
                                <MaterialIcons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal className="mb-6">
                            <View className="flex-row gap-2">
                                {newTags.map(tag => (
                                    <View key={tag} className="flex-row items-center bg-indigo-100 px-3 py-1 rounded-full">
                                        <Text className="text-indigo-700 mr-2">{tag}</Text>
                                        <TouchableOpacity onPress={() => removeTag(tag)}>
                                            <MaterialIcons name="close" size={16} color="#4f46e5" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <TextInput
                            className="border border-slate-300 rounded-xl p-4 mb-6 h-32 text-start"
                            placeholder="Paste your text here..."
                            value={newText}
                            onChangeText={setNewText}
                            multiline
                            textAlignVertical="top"
                        />

                        <View className="flex-row justify-end gap-4">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="px-6 py-3 border border-slate-300 rounded-xl"
                            >
                                <Text className="text-slate-700">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveResource}
                                disabled={isSaving}
                                className="bg-indigo-600 px-6 py-3 rounded-xl"
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
