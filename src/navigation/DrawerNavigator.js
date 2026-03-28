// =============================================
// DrawerNavigator - Desktop/Tablet Navigation
// =============================================
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerIconLabel from '../components/DrawerIconLabel';
import AdminStack from './AdminStack';
import JudgeStack from './JudgeStack';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
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
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused }) => {
          let iconName = 'help';
          let label = '';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            label = 'หน้าหลัก';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
            label = 'แอดมิน';
          } else if (route.name === 'Judge') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
            label = 'กรรมการ';
          } else if (route.name === 'About') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
            label = 'เกี่ยวกับ';
          }
          return <DrawerIconLabel icon={iconName} label={label} focused={focused} />;
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
          display: 'none', // Hide default label
        },
        drawerType: 'permanent', // Always show sidebar
        swipeEnabled: false, // Disable swipe to open/close
        headerShown: false, // Remove hamburger and header
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'หน้าหลัก' }} />
      <Drawer.Screen name="Judge" component={JudgeStack} options={{ title: 'กรรมการ' }} />
      <Drawer.Screen name="Admin" component={AdminStack} options={{ title: 'แอดมิน' }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'เกี่ยวกับ' }} />
    </Drawer.Navigator>
  );
}
