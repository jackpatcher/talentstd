// =============================================
// BottomTabNavigator - Mobile Navigation
// =============================================
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminStack from './AdminStack';
import JudgeStack from './JudgeStack';
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
      initialRouteName={role === 'admin' ? 'Admin' : 'Judge'}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = route.name === 'Admin'
            ? (focused ? 'shield-checkmark' : 'shield-checkmark-outline')
            : (focused ? 'clipboard' : 'clipboard-outline');
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
      {(role === 'judge' || !role) && <Tab.Screen name="Judge" component={JudgeStack} options={{ title: 'กรรมการ' }} />}
      {(role === 'admin' || !role) && <Tab.Screen name="Admin" component={AdminStack} options={{ title: 'แอดมิน' }} />}
    </Tab.Navigator>
  );
}
