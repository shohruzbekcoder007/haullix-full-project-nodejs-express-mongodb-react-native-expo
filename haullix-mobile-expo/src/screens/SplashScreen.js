import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Truck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export const ONBOARDING_KEY = 'onboarding_seen';

export default function SplashScreen({ navigation }) {
  const { restore } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const sloganFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = new Promise((resolve) => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(sloganFade, { toValue: 1, duration: 600, useNativeDriver: true }).start(() => {
          setTimeout(resolve, 800);
        });
      });
    });

    // Animatsiya va sessiyani tiklash parallel bajariladi
    Promise.all([animation, restore(), AsyncStorage.getItem(ONBOARDING_KEY)]).then(
      ([, session, onboardingSeen]) => {
        if (session === 'signed_in') navigation.replace('MainTabs');
        else if (session === 'profile_required') navigation.replace('ProfileSetup');
        else navigation.replace(onboardingSeen ? 'AuthPhone' : 'Onboarding');
      }
    );
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Animated.View style={[styles.logoBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Truck color="#ffffff" size={52} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>HAULLIX</Text>
      </Animated.View>
      <Animated.Text style={[styles.slogan, { opacity: sloganFade }]}>
        Bo'sh qaytma, yuk bilan qayt!
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  title: { color: '#ffffff', fontSize: 38, fontWeight: '900', letterSpacing: 5 },
  slogan: { color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
});
