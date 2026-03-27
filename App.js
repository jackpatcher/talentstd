// =============================================
// App.js - Entry Point & Navigation
// =============================================
import './global.css';
import React, { useEffect, useRef } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
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
  const [fontsLoaded] = useFonts({
    Sarabun_100Thin,
    Sarabun_300Light,
    Sarabun_400Regular,
    Sarabun_500Medium,
    Sarabun_600SemiBold,
    Sarabun_700Bold,
    Sarabun_800ExtraBold,
  });
  const [isReady, setIsReady] = React.useState(false);
  const [navState, setNavState] = React.useState();
  const navStateRef = useRef();
  const dimensions = useWindowDimensions();
  const isMobile = dimensions.width < MOBILE_BREAKPOINT;
  const useDrawerNavigation = !isMobile;

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

  // Deep linking config
  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        Home: 'home',
        Admin: {
          path: 'admin',
          screens: {
            AdminLogin: 'login',
            Admissions: 'admissions',
            Judges: 'judges',
            Students: 'students',
            Criteria: 'criteria',
            Report: 'report',
            Settings: 'settings',
          },
        },
        Judge: {
          path: 'judge',
          screens: {
            JudgeLogin: 'login',
            JudgeStudents: 'students',
            JudgeScore: 'score',
          },
        },
      },
    },
  };

  return (
    <NavigationContainer
      theme={NAV_THEME}
      linking={linking}
      initialState={navState}
      onStateChange={state => {
        setNavState(state);
        navStateRef.current = state;
      }}
    >
      {useDrawerNavigation ? <DrawerNavigator /> : <BottomTabNavigator />}
    </NavigationContainer>
  );
}
