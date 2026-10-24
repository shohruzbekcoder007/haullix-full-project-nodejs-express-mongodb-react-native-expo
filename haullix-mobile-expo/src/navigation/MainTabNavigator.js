import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PackagePlus, Package, Search, Truck, User } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import PostCargoScreen from '../screens/PostCargoScreen';
import OrdersScreen from '../screens/OrdersScreen';
import MatchingScreen from '../screens/MatchingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const tabIcon = (Icon) => ({ color, size }) => <Icon color={color} size={size} strokeWidth={2} />;

export default function MainTabNavigator() {
  const { role } = useAuth();
  const isDriver = role === 'driver';

  return (
    // key: rol o'zgarganda tablar qaytadan quriladi
    <Tab.Navigator
      key={role}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: colors.borderSoft,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      {isDriver ? (
        <Tab.Screen
          name="MatchingTab"
          component={MatchingScreen}
          options={{ tabBarLabel: 'Mos yuklar', tabBarIcon: tabIcon(Search) }}
        />
      ) : (
        <Tab.Screen
          name="PostCargoTab"
          component={PostCargoScreen}
          options={{ tabBarLabel: 'Yuk joylash', tabBarIcon: tabIcon(PackagePlus) }}
        />
      )}
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: isDriver ? 'Reyslarim' : 'Buyurtmalar',
          tabBarIcon: tabIcon(isDriver ? Truck : Package),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil', tabBarIcon: tabIcon(User) }}
      />
    </Tab.Navigator>
  );
}
