import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const sloganFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(sloganFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          navigation.replace('Onboarding');
        }, 1200);
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.truckIcon}>🚛</Text>
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
    backgroundColor: '#0b0f17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  truckIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 3,
  },
  slogan: {
    marginTop: 16,
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
