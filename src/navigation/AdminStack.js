// =============================================
// AdminStack - Stack Navigator for Admin
// =============================================
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdmissionsScreen from '../screens/admin/AdmissionsScreen';
import JudgesScreen from '../screens/admin/JudgesScreen';
import StudentsScreen from '../screens/admin/StudentsScreen';
import CriteriaScreen from '../screens/admin/CriteriaScreen';
import ReportScreen from '../screens/admin/ReportScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';

const Stack = createStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminLogin">
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Admissions" component={AdmissionsScreen} />
      <Stack.Screen name="Judges" component={JudgesScreen} />
      <Stack.Screen name="Students" component={StudentsScreen} />
      <Stack.Screen name="Criteria" component={CriteriaScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
