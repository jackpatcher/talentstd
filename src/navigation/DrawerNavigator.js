// =============================================
// DrawerNavigator - Desktop/Tablet Navigation
// =============================================
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminStack from './AdminStack';
import JudgeStack from './JudgeStack';
import { getSession } from '../services/auth';
import { useEffect, useState } from 'react';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setRole(session?.role || null);
    })();
  }, []);

  if (!role) return null;

  return (
    <Drawer.Navigator initialRouteName={role === 'admin' ? 'Admin' : 'Judge'}>
      {role === 'admin' && <Drawer.Screen name="Admin" component={AdminStack} />}
      {role === 'judge' && <Drawer.Screen name="Judge" component={JudgeStack} />}
    </Drawer.Navigator>
  );
}
