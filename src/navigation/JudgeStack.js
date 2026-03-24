// =============================================
// JudgeStack - Stack Navigator for Judge
// =============================================
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JudgeLoginScreen from '../screens/judge/JudgeLoginScreen';
import JudgeStudentsScreen from '../screens/judge/JudgeStudentsScreen';
import JudgeScoreScreen from '../screens/judge/JudgeScoreScreen';

const Stack = createStackNavigator();

export default function JudgeStack() {
  return (
    <Stack.Navigator initialRouteName="JudgeLogin">
      <Stack.Screen name="JudgeLogin" component={JudgeLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JudgeStudents" component={JudgeStudentsScreen} />
      <Stack.Screen name="JudgeScore" component={JudgeScoreScreen} />
    </Stack.Navigator>
  );
}
