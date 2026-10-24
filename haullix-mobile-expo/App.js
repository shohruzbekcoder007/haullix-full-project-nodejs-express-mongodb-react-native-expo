import './src/utils/alertPolyfill';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthPhoneScreen from './src/screens/AuthPhoneScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import SettingsScreen from './src/screens/SettingsScreen';
import DriverDetailScreen from './src/screens/DriverDetailScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import PostCargoScreen from './src/screens/PostCargoScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#ffffff' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#ffffff' },
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="AuthPhone" component={AuthPhoneScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ animation: 'fade' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="DriverDetail" component={DriverDetailScreen} />
            <Stack.Screen name="EditOrder" component={PostCargoScreen} />
            <Stack.Screen name="Reviews" component={ReviewsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
