// =============================================
// BottomTabNavigator - Mobile Navigation
// =============================================
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminStack from './AdminStack';
import JudgeStack from './JudgeStack';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import { getSession } from '../services/auth';
import { useEffect, useState } from 'react';
import { COLORS, FONTS, FONT_SIZES } from '../utils/theme';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setRole(session?.role || null);
    })();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'help';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'About') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          } else if (route.name === 'Judge') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontFamily: FONTS.semiBold,
          fontSize: FONT_SIZES.xs,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontFamily: FONTS.bold,
          fontSize: FONT_SIZES.lg,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'หน้าหลัก' }} />
      <Tab.Screen name="Judge" component={JudgeStack} options={{ title: 'กรรมการ', headerShown: false }} />
      <Tab.Screen name="Admin" component={AdminStack} options={{ title: 'แอดมิน', headerShown: false }} />
      <Tab.Screen name="About" component={AboutScreen} options={{ title: 'เกี่ยวกับ' }} />
    </Tab.Navigator>
  );
}
