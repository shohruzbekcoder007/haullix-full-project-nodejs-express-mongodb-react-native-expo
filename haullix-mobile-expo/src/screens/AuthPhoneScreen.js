import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function AuthPhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('+998 ');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1 = phone, 2 = sms code
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handleSendSms = () => {
    if (phone.length < 13) {
      Alert.alert('Xatolik', 'Iltimos to\'g\'ri telefon raqam kiriting');
      return;
    }
    setStep(2);
    setTimer(60);
    setIsTimerActive(true);
  };

  const handleVerify = () => {
    if (code.length < 4) {
      Alert.alert('Xatolik', '4 xonali SMS kodni kiriting');
      return;
    }
    // Profilni to'ldirishga o'tish
    navigation.navigate('ProfileSetup', { phone });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>
        {step === 1 ? 'Tizimga kirish' : 'SMS Kodni kiriting'}
      </Text>
      <Text style={styles.subTitle}>
        {step === 1
          ? 'Haulix platformasidan foydalanish uchun telefon raqamingizni kiriting'
          : `${phone} raqamiga 4 xonali tasdiqlash kodi yuborildi`}
      </Text>

      {step === 1 ? (
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Telefon raqam</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+998 90 123 45 67"
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleSendSms}>
            <Text style={styles.btnText}>SMS Kod olish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>4 xonali kod</Text>
          <TextInput
            style={[styles.input, styles.otpInput]}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="1234"
            placeholderTextColor="#64748b"
          />
          
          {/* SMS Taymer bloki */}
          <View style={styles.timerBox}>
            {isTimerActive ? (
              <Text style={styles.timerText}>
                Qayta yuborish: 00:{timer < 10 ? `0${timer}` : timer}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleSendSms}>
                <Text style={styles.resendText}>Kodni qayta yuborish</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleVerify}>
            <Text style={styles.btnText}>Tasdiqlash</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
    padding: 24,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: '#161f2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#0b0f17',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 10,
    fontWeight: '700',
  },
  timerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  resendText: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
