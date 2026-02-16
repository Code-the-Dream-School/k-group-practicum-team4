import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Flashcard = {
    id: string;
    front: string;
    back: string;
    explanation?: string;
};

type Props = {
    cards: Flashcard[];
    onBack: () => void;
};

export default function FlashcardPlayer({ cards, onBack }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const rotation = useSharedValue(0);

    const currentCard = cards[currentIndex];

    const flipCard = () => {
        runOnJS(setIsFlipped)(!isFlipped);
    };

    const panGesture = Gesture.Pan()
        .onEnd((event) => {
            if (event.translationX < -100 && currentIndex < cards.length - 1) {
                runOnJS(goToNext)();
            } else if (event.translationX > 100 && currentIndex > 0) {
                runOnJS(goToPrev)();
            }
        });

    const goToNext = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
        setIsFlipped(false);
        rotation.value = withSpring(0);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
        setIsFlipped(false);
        rotation.value = withSpring(0);
    };

    return (
        <View className="flex-1 bg-slate-50 p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={onBack} className="flex-row items-center">
                    <MaterialIcons name="arrow-back" size={28} color="#4f46e5" />
                    <Text className="ml-2 text-lg font-medium text-indigo-600">Back to sets</Text>
                </TouchableOpacity>

                <Text className="text-lg font-semibold text-slate-700">
                    {currentIndex + 1} / {cards.length}
                </Text>
            </View>

            {/* Card + Controls – closer together */}
            <View className="flex-1 items-center justify-center">
                {/* Card area */}
                <GestureDetector gesture={panGesture}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={flipCard}
                        className="items-center justify-center mb-8" // ← added mb-8 for space below card
                    >
                        <View
                            style={{
                                width: SCREEN_WIDTH * 0.9,
                                height: SCREEN_WIDTH * 1.2,
                                maxHeight: 500,
                                position: 'relative',
                            }}
                        >
                            {/* Front */}
                            <View
                                style={{
                                    opacity: isFlipped ? 0 : 1,
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                }}
                                className="bg-white rounded-3xl shadow-2xl justify-center items-center p-8"
                            >
                                <Text className="text-3xl font-bold text-slate-900 text-center px-4">
                                    {currentCard.front}
                                </Text>
                            </View>

                            {/* Back */}
                            <View
                                style={{
                                    opacity: isFlipped ? 1 : 0,
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                }}
                                className="bg-white rounded-3xl shadow-2xl justify-center items-center p-8"
                            >
                                <Text className="text-2xl font-bold text-slate-800 text-center mb-6 px-4">
                                    {currentCard.back}
                                </Text>
                                {currentCard.explanation && (
                                    <Text className="text-base text-slate-600 text-center px-4">
                                        {currentCard.explanation}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </GestureDetector>

                {/* Controls – now right under the card */}
                <View className="flex-row justify-between w-full max-w-[80%] px-4">
                    <TouchableOpacity
                        onPress={goToPrev}
                        disabled={currentIndex === 0}
                        className={`px-8 py-4 rounded-full ${
                            currentIndex === 0 ? 'bg-slate-200' : 'bg-indigo-100'
                        }`}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={28}
                            color={currentIndex === 0 ? '#94a3b8' : '#4f46e5'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={flipCard}
                        className="bg-indigo-600 px-12 py-4 rounded-full shadow-md"
                    >
                        <Text className="text-white font-bold text-lg">Flip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={goToNext}
                        disabled={currentIndex === cards.length - 1}
                        className={`px-8 py-4 rounded-full ${
                            currentIndex === cards.length - 1 ? 'bg-slate-200' : 'bg-indigo-100'
                        }`}
                    >
                        <MaterialIcons
                            name="arrow-forward"
                            size={28}
                            color={currentIndex === cards.length - 1 ? '#94a3b8' : '#4f46e5'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
