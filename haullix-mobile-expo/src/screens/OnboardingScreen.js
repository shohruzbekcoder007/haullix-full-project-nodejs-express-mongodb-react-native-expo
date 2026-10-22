import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: '🚛',
    title: "Bo'sh qaytma, yuk bilan qayt!",
    desc: "Yetkazib berishdan so'ng bo'sh qaytmasdan, yo'nalishingiz bo'ylab mos yuklarni toping va daromadingizni 40% ga oshiring.",
  },
  {
    id: '2',
    icon: '⚡',
    title: "Aqlli Qaytish Yuklari (AI Matching)",
    desc: "Moshina hajmi, tonnaji va marshrutingizga 96% gacha mos keladigan qaytish buyurtmalarini avtomatik tanlab beramiz.",
  },
  {
    id: '3',
    icon: '🛡️',
    title: "Radarlar va Jarimalar nazorati",
    desc: "Yo'ldagi tezlik radarlari, yangi kameralar va transport vositangiz jarimalarini real vaqtda bepul tekshiring.",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleNext = () => {
    if (currentIdx < SLIDES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      navigation.replace('AuthPhone');
    }
  };

  const slide = SLIDES[currentIdx];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('AuthPhone')}>
          <Text style={styles.skipText}>O'tkazib yuborish</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>{slide.icon}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, currentIdx === idx && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
          <Text style={styles.btnText}>
            {currentIdx === SLIDES.length - 1 ? 'Boshlash' : 'Keyingisi'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'flex-end',
    paddingTop: 10,
  },
  skipText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconText: {
    fontSize: 52,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  desc: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
    marginHorizontal: 5,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#2563eb',
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
