// =============================================
// App.js - Entry Point & Navigation
// =============================================
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { MOBILE_BREAKPOINT, NAV_THEME } from './src/utils/theme';
import { setApiUrl } from './src/services/api';
import { getCache } from './src/services/cache';

// Load TH Sarabun font
import {
  useFonts,
  Sarabun_100Thin,
  Sarabun_300Light,
  Sarabun_400Regular,
  Sarabun_500Medium,
  Sarabun_600SemiBold,
  Sarabun_700Bold,
  Sarabun_800ExtraBold,
} from '@expo-google-fonts/sarabun';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const useDrawerNavigation = Platform.OS !== 'web' && !isMobile;
  const [fontsLoaded] = useFonts({
    Sarabun_100Thin,
    Sarabun_300Light,
    Sarabun_400Regular,
    Sarabun_500Medium,
    Sarabun_600SemiBold,
    Sarabun_700Bold,
    Sarabun_800ExtraBold,
  });

  useEffect(() => {
    // Responsive: detect mobile/tablet/desktop
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    if (Platform.OS === 'web') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    // Load API URL from cache/config
    (async () => {
      const config = await getCache('config');
      if (config?.app_url) setApiUrl(config.app_url);
      setIsReady(true);
    })();
  }, []);

  if (!fontsLoaded || !isReady) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer theme={NAV_THEME}>
      {useDrawerNavigation ? <DrawerNavigator /> : <BottomTabNavigator />}
    </NavigationContainer>
  );
}
