import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, StatusBar,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TopBar, ScreenTitle, Label, Field, ChoiceRow, PrimaryButton } from '../components/ui';
import { colors } from '../theme';

const BRANDS = ['MAN', 'Isuzu', 'KAMAZ', 'Volvo', 'Scania', 'Mercedes-Benz', 'HOWO', 'SHACMAN'];

const ROLE_OPTIONS = [
  { value: 'driver', label: 'Haydovchi' },
  { value: 'cargo_owner', label: 'Yuk egasi' },
];
const ENTITY_OPTIONS = [
  { value: 'individual', label: 'Jismoniy shaxs' },
  { value: 'legal', label: 'Yuridik shaxs' },
];
const SIDE_OPTIONS = [
  { value: 'receiver', label: 'Yuk qabul qiluvchi' },
  { value: 'sender', label: 'Yuk yuboruvchi' },
];

export default function ProfileSetupScreen({ navigation, route }) {
  const isEdit = !!route?.params?.edit;
  const { user, setUser, signOut } = useAuth();
  const initial = (isEdit && user) || {};
  const vehicle = initial.vehicle || {};

  const [role, setRole] = useState(initial.role === 'driver' ? 'driver' : 'cargo_owner');
  const [entityType, setEntityType] = useState(initial.entityType || 'individual');
  const [cargoSide, setCargoSide] = useState(initial.cargoSide || 'receiver');
  const [firstName, setFirstName] = useState(initial.firstName || '');
  const [lastName, setLastName] = useState(initial.lastName || '');
  const [companyName, setCompanyName] = useState(initial.companyName || '');
  const [taxId, setTaxId] = useState(initial.taxId || '');
  const [brand, setBrand] = useState(vehicle.brand || '');
  const [plateNumber, setPlateNumber] = useState(vehicle.plateNumber || '');
  const [payload, setPayload] = useState(vehicle.maxPayloadTons ? String(vehicle.maxPayloadTons) : '');
  const [loading, setLoading] = useState(false);

  const isDriver = role === 'driver';
  const isLegal = entityType === 'legal';

  const handleBack = async () => {
    if (isEdit) {
      navigation.goBack();
      return;
    }
    // Ro'yxatdan o'tish bekor qilinsa, raqam kiritishga qaytamiz
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'AuthPhone' }] });
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Xatolik', 'Ism va familiyani kiriting');
      return;
    }
    if (isLegal && !companyName.trim()) {
      Alert.alert('Xatolik', 'Korxona nomini kiriting');
      return;
    }

    const profile = {
      role,
      entityType,
      cargoSide,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      companyName: isLegal ? companyName.trim() : '',
      taxId: isLegal ? taxId.trim() : '',
    };
    if (isDriver) {
      profile.vehicle = {
        ...vehicle,
        brand,
        plateNumber: plateNumber.trim().toUpperCase(),
        maxPayloadTons: Number(payload) || undefined,
      };
    }

    setLoading(true);
    try {
      const res = await authAPI.saveProfile(profile);
      await setUser(res.user);
      if (isEdit) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e) {
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TopBar onBack={handleBack} />
          <ScreenTitle style={styles.title}>{isDriver ? 'Haydovchilar' : 'Yuk egalari'}</ScreenTitle>
          <Text style={styles.subtitle}>Kimligi</Text>

          <Label style={styles.sectionLabel}>Siz kimsiz?</Label>
          <ChoiceRow options={ROLE_OPTIONS} value={role} onChange={setRole} />

          <Label>Shaxs turi</Label>
          <ChoiceRow options={ENTITY_OPTIONS} value={entityType} onChange={setEntityType} />

          {!isDriver ? (
            <>
              <Label>Yuk bo'yicha</Label>
              <ChoiceRow options={SIDE_OPTIONS} value={cargoSide} onChange={setCargoSide} />
            </>
          ) : null}

          {isLegal ? (
            <>
              <Label>Korxona nomi</Label>
              <Field value={companyName} onChangeText={setCompanyName} placeholder="Korxona nomi" />
              <Label>STIR</Label>
              <Field
                value={taxId}
                onChangeText={(t) => setTaxId(t.replace(/\D/g, '').slice(0, 9))}
                placeholder="123456789"
                keyboardType="number-pad"
              />
            </>
          ) : null}

          <Label>Ism</Label>
          <Field value={firstName} onChangeText={setFirstName} placeholder="Ism" autoCapitalize="words" />

          <Label>Familiya</Label>
          <Field value={lastName} onChangeText={setLastName} placeholder="Familiya" autoCapitalize="words" />

          {isDriver ? (
            <>
              <Label>Mashina rusumi</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRow}>
                {BRANDS.map((item) => {
                  const active = brand === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.brandChip, active && styles.brandChipActive]}
                      onPress={() => setBrand(item)}
                    >
                      <Text style={[styles.brandText, active && styles.brandTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Label>Davlat raqami</Label>
              <Field
                value={plateNumber}
                onChangeText={setPlateNumber}
                placeholder="01 A 777 AA"
                autoCapitalize="characters"
              />

              <Label>Yuk ko'tarish quvvati</Label>
              <Field
                value={payload}
                onChangeText={(t) => setPayload(t.replace(/[^\d.]/g, ''))}
                placeholder="Masalan: 20"
                keyboardType="decimal-pad"
                suffix="tonna"
              />
            </>
          ) : null}

          <PrimaryButton title={isEdit ? 'Saqlash' : 'Davom etish'} onPress={handleSave} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  title: { marginBottom: 0 },
  subtitle: { fontSize: 18, color: colors.textSoft, marginTop: 2 },
  sectionLabel: { marginTop: 28 },
  brandRow: { gap: 8 },
  brandChip: {
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  brandChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  brandText: { fontSize: 14, fontWeight: '600', color: colors.text },
  brandTextActive: { color: '#ffffff' },
});
