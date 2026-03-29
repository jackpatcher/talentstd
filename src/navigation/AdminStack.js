// =============================================
// AdminStack - Stack Navigator for Admin
// =============================================
import React from 'react';
import { Pressable } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdmissionsScreen from '../screens/admin/AdmissionsScreen';
import AdmissionDetailScreen from '../screens/admin/AdmissionDetailScreen';
import JudgesScreen from '../screens/admin/JudgesScreen';
import StudentsScreen from '../screens/admin/StudentsScreen';
import CriteriaScreen from '../screens/admin/CriteriaScreen';
import ReportScreen from '../screens/admin/ReportScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import { logout } from '../services/auth';
import { COLORS, FONTS, FONT_SIZES } from '../utils/theme';

const Stack = createStackNavigator();

function LogoutButton({ navigation }) {
  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'AdminLogin' }] });
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

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminLogin">
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Admissions" component={AdmissionsScreen} options={({ navigation }) => ({ title: 'การรับนักเรียน', ...sharedHeaderOptions({ navigation }) })} />
      <Stack.Screen name="AdmissionDetail" component={AdmissionDetailScreen} options={({ route, navigation }) => ({ title: route.params?.admission?.name || 'รายละเอียด', ...sharedHeaderOptions({ navigation }) })} />
      <Stack.Screen name="Judges" component={JudgesScreen} options={({ navigation }) => ({ title: 'กรรมการตัดสิน', ...sharedHeaderOptions({ navigation }) })} />
      <Stack.Screen name="Students" component={StudentsScreen} options={({ navigation }) => ({ title: 'การรับเข้า', ...sharedHeaderOptions({ navigation }) })} />
      <Stack.Screen name="Criteria" component={CriteriaScreen} options={({ navigation }) => ({ title: 'ลักษณะความสามารถ', ...sharedHeaderOptions({ navigation }) })} />
      <Stack.Screen name="Report" component={ReportScreen} options={({ navigation }) => ({ title: 'รายงานผล', ...sharedHeaderOptions({ navigation }) })} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={({ navigation }) => ({ title: 'ตั้งค่าระบบ', ...sharedHeaderOptions({ navigation }) })} />
    </Stack.Navigator>
  );
}
