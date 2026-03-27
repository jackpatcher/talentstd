// =============================================
// JudgeStack - Stack Navigator for Judge
// =============================================
import React from 'react';
import { Pressable } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import JudgeLoginScreen from '../screens/judge/JudgeLoginScreen';
import JudgeStudentsScreen from '../screens/judge/JudgeStudentsScreen';
import JudgeScoreScreen from '../screens/judge/JudgeScoreScreen';
import { logout } from '../services/auth';
import { COLORS, FONTS, FONT_SIZES } from '../utils/theme';

const Stack = createStackNavigator();

function LogoutButton({ navigation }) {
  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'JudgeLogin' }] });
  };
  return (
    <Pressable
      onPress={handleLogout}
      className="flex-row items-center px-3 py-1 mr-2 rounded-lg bg-error-light"
    >
      <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
    </Pressable>
  );
}

const sharedHeaderOptions = ({ navigation }) => ({
  headerRight: () => <LogoutButton navigation={navigation} />,
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg },
  headerBackTitleVisible: false,
});

export default function JudgeStack() {
  return (
    <Stack.Navigator initialRouteName="JudgeLogin">
      <Stack.Screen name="JudgeLogin" component={JudgeLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JudgeStudents" component={JudgeStudentsScreen} options={({ navigation }) => ({ title: 'นักเรียนที่ต้องประเมิน', ...sharedHeaderOptions({ navigation }) })} />
      <Stack.Screen name="JudgeScore" component={JudgeScoreScreen} options={({ navigation }) => ({ title: 'กรอกคะแนน', ...sharedHeaderOptions({ navigation }) })} />
    </Stack.Navigator>
  );
}
