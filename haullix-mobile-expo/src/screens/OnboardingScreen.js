import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Truck, Zap, ShieldCheck } from 'lucide-react-native';
import { PrimaryButton } from '../components/ui';
import { colors } from '../theme';
import { ONBOARDING_KEY } from './SplashScreen';

const SLIDES = [
  {
    Icon: Truck,
    title: "Bo'sh qaytma, yuk bilan qayt!",
    desc: "Yetkazib berishdan so'ng bo'sh qaytmasdan, yo'nalishingiz bo'ylab mos yuklarni toping va daromadingizni oshiring.",
  },
  {
    Icon: Zap,
    title: 'Aqlli qaytish yuklari',
    desc: "Mashina hajmi, tonnaji va marshrutingizga mos keladigan buyurtmalarni avtomatik tanlab beramiz.",
  },
  {
    Icon: ShieldCheck,
    title: 'Yukingiz nazorat ostida',
    desc: "Yukingiz qayerdaligini kuzating, haydovchi bilan bog'laning va xizmatni baholang.",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    navigation.replace('AuthPhone');
  };

  const handleNext = () => {
    if (currentIdx < SLIDES.length - 1) setCurrentIdx(currentIdx + 1);
    else finish();
  };

  const { Icon, title, desc } = SLIDES[currentIdx];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={finish} hitSlop={12}>
          <Text style={styles.skipText}>O'tkazib yuborish</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon color={colors.primary} size={52} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, idx) => (
            <View key={idx} style={[styles.dot, currentIdx === idx && styles.dotActive]} />
          ))}
        </View>
        <PrimaryButton
          title={currentIdx === SLIDES.length - 1 ? 'Boshlash' : 'Keyingisi'}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  header: { alignItems: 'flex-end', paddingTop: 16 },
  skipText: { color: colors.textSoft, fontSize: 15, fontWeight: '600' },
  content: { alignItems: 'center', paddingHorizontal: 12 },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  desc: { color: colors.textMuted, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  footer: { paddingBottom: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderSoft, marginHorizontal: 5 },
  dotActive: { width: 24, backgroundColor: colors.primary },
});
