import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Label, PrimaryButton, UzFlag } from '../components/ui';
import { formatLocalPhone } from '../utils/format';
import { colors } from '../theme';

export default function AuthPhoneScreen({ navigation }) {
  const { signIn } = useAuth();
  const [digits, setDigits] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [demoCode, setDemoCode] = useState(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const phone = `+998${digits}`;

  const handlePhoneChange = (text) => {
    const next = text.replace(/\D/g, '').slice(0, 9);
    setDigits(next);
    // Raqam o'zgarsa, kodni qaytadan so'rash kerak
    if (codeSent) {
      setCodeSent(false);
      setCode('');
      setDemoCode(null);
    }
  };

  const sendCode = async () => {
    if (digits.length !== 9) {
      Alert.alert('Xatolik', "Telefon raqamini to'liq kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.sendOtp(phone);
      setCodeSent(true);
      setDemoCode(res.demoCode || null);
      setTimer(res.cooldownSeconds || 60);
      setTimeout(() => codeRef.current?.focus(), 100);
    } catch (e) {
      const cooldown = e?.response?.data?.cooldownSeconds;
      if (cooldown) {
        // Kod avval yuborilgan — kiritishga ruxsat beramiz
        setCodeSent(true);
        setTimer(cooldown);
      }
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code.length < 4) {
      Alert.alert('Xatolik', '4 xonali SMS kodni kiriting');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(phone, code);
      await signIn(res.token, res.user);
      navigation.reset({ index: 0, routes: [{ name: res.isNewUser ? 'ProfileSetup' : 'MainTabs' }] });
    } catch (e) {
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Telefon raqamingizni kiriting</Text>
          <Text style={styles.subtitle}>Tasdiqlash kodini SMS orqali yuboramiz.</Text>

          <Label>Telefon raqami</Label>
          <View style={styles.phoneRow}>
            <View style={styles.countryBox}>
              <UzFlag width={38} />
              <Text style={styles.countryCode}>+998</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={formatLocalPhone(digits)}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              placeholder="90 123 45 67"
              placeholderTextColor={colors.placeholder}
              maxLength={12}
            />
          </View>

          {codeSent ? (
            <>
              <Label>SMS kod</Label>
              <View style={styles.codeRow}>
                <TextInput
                  ref={codeRef}
                  style={styles.codeInput}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  placeholder="Kod"
                  placeholderTextColor={colors.placeholder}
                  maxLength={6}
                />
                <View style={styles.codeInfo}>
                  {timer > 0 ? (
                    <Text style={styles.timerText}>
                      Qayta yuborish: 00:{String(timer).padStart(2, '0')}
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={sendCode} disabled={loading} hitSlop={8}>
                      <Text style={styles.resendText}>Kodni qayta yuborish</Text>
                    </TouchableOpacity>
                  )}
                  {demoCode ? <Text style={styles.demoText}>Demo kod: {demoCode}</Text> : null}
                </View>
              </View>
            </>
          ) : null}

          <PrimaryButton
            title="Tasdiqlash"
            onPress={codeSent ? verifyCode : sendCode}
            loading={loading}
            style={{ marginTop: 32 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 24, paddingTop: 72, paddingBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, lineHeight: 40 },
  subtitle: { fontSize: 17, color: colors.textMuted, lineHeight: 25, marginTop: 10, marginBottom: 24 },
  phoneRow: { flexDirection: 'row', gap: 12 },
  countryBox: {
    width: 88,
    height: 78,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  countryCode: { fontSize: 18, fontWeight: '700', color: colors.text },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    height: 78,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 18,
    fontSize: 22,
    fontWeight: '500',
    color: colors.text,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  codeInput: {
    width: 152,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 4,
    color: colors.text,
  },
  codeInfo: { flex: 1 },
  timerText: { fontSize: 14, color: colors.textSoft },
  resendText: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  demoText: { fontSize: 13, color: colors.textSoft, marginTop: 4 },
});
