import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import MatchingScreen from '../screens/MatchingScreen';
import OrdersScreen from '../screens/OrdersScreen';
import FinesScreen from '../screens/FinesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="MatchingTab"
        component={MatchingScreen}
        options={{
          tabBarLabel: 'Mos yuklar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚡</Text>,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Buyurtmalar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="FinesTab"
        component={FinesScreen}
        options={{
          tabBarLabel: 'Jarimalar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🚨</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
