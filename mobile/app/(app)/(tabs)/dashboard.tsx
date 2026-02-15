import { View, Text} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl font-bold text-green-600">
            Tab TWO Screen
          </Text>
        </View>
      </SafeAreaView>
  );
}


