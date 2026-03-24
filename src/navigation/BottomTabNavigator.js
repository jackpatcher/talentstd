// =============================================
// BottomTabNavigator - Mobile Navigation
// =============================================
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminStack from './AdminStack';
import JudgeStack from './JudgeStack';
import { getSession } from '../services/auth';
import { useEffect, useState } from 'react';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setRole(session?.role || null);
    })();
  }, []);

  if (!role) return null;

  return (
    <Tab.Navigator initialRouteName={role === 'admin' ? 'Admin' : 'Judge'}>
      {role === 'admin' && <Tab.Screen name="Admin" component={AdminStack} />}
      {role === 'judge' && <Tab.Screen name="Judge" component={JudgeStack} />}
    </Tab.Navigator>
  );
}
