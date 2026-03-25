// =============================================
// DrawerNavigator - Desktop/Tablet Navigation
// =============================================
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AdminStack from './AdminStack';
import JudgeStack from './JudgeStack';
import { getSession } from '../services/auth';
import { useEffect, useState } from 'react';
import { COLORS, DRAWER_WIDTH, FONTS, FONT_SIZES } from '../utils/theme';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setRole(session?.role || null);
    })();
  }, []);

  return (
    <Drawer.Navigator
      initialRouteName={role === 'admin' ? 'Admin' : 'Judge'}
      screenOptions={({ route }) => ({
        drawerIcon: ({ color, size, focused }) => {
          const iconName = route.name === 'Admin'
            ? (focused ? 'shield-checkmark' : 'shield-checkmark-outline')
            : (focused ? 'clipboard' : 'clipboard-outline');
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: COLORS.drawerTextActive,
        drawerInactiveTintColor: COLORS.drawerText,
        drawerActiveBackgroundColor: COLORS.drawerActive,
        drawerInactiveBackgroundColor: COLORS.drawerBg,
        drawerStyle: {
          width: DRAWER_WIDTH,
          backgroundColor: COLORS.drawerBg,
        },
        drawerLabelStyle: {
          fontFamily: FONTS.semiBold,
          fontSize: FONT_SIZES.md,
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
      {(role === 'judge' || !role) && <Drawer.Screen name="Judge" component={JudgeStack} options={{ title: 'กรรมการ' }} />}
      {(role === 'admin' || !role) && <Drawer.Screen name="Admin" component={AdminStack} options={{ title: 'แอดมิน' }} />}
    </Drawer.Navigator>
  );
}
