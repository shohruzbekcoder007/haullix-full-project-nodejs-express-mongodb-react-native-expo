import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';

const BRANDS = ['MAN', 'Isuzu', 'KAMAZ', 'Volvo', 'Scania', 'Mercedes-Benz', 'HOWO', 'SHACMAN'];

export default function ProfileSetupScreen({ navigation }) {
  // Ism va Familiya alohida ikkita maydonda
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('driver'); // driver, cargo_owner, company
  
  // Moshina ma'lumotlari
  const [selectedBrand, setSelectedBrand] = useState('MAN');
  const [model, setModel] = useState('TGS 18.400');
  const [plateRegion, setPlateRegion] = useState('01');
  const [plateNumber, setPlateNumber] = useState('A 777 AA');
  const [year, setYear] = useState('2021');
  const [payloadTons, setPayloadTons] = useState('20');
  const [ratePerKm, setRatePerKm] = useState('7500');

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Xatolik', 'Iltimos Ism va Familiyani alohida kiriting');
      return;
    }
    // Asosiy tab menyuga o'tish
    navigation.replace('MainTabs');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.screenTitle}>Profilni to'ldirish</Text>
      <Text style={styles.screenSub}>Mos yuklar va hisob-kitoblar shu ma'lumotlar asosida shakllanadi</Text>

      {/* 1. Ism va Familiya alohida */}
      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Ism</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Valijon"
            placeholderTextColor="#64748b"
          />
        </View>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Familiya</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Alijonov"
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      {/* 2. Rolni tanlash */}
      <Text style={styles.label}>Foydalanuvchi turi</Text>
      <View style={styles.roleContainer}>
        {[
          { key: 'driver', label: '🚛 Haydovchi' },
          { key: 'cargo_owner', label: '📦 Yuk egasi' },
          { key: 'company', label: '🏢 Korxona' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.roleBtn, role === item.key && styles.roleBtnActive]}
            onPress={() => setRole(item.key)}
          >
            <Text style={[styles.roleBtnText, role === item.key && styles.roleBtnTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. Moshina tanlash va logosi */}
      <Text style={styles.label}>Moshina rusumi (Logosi bilan)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandScroll}>
        {BRANDS.map((brand) => (
          <TouchableOpacity
            key={brand}
            style={[styles.brandCard, selectedBrand === brand && styles.brandCardActive]}
            onPress={() => setSelectedBrand(brand)}
          >
            <Text style={styles.brandLogoText}>{brand}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 4. Model */}
      <Text style={styles.label}>Model</Text>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholder="Masalan: TGS 18.400"
        placeholderTextColor="#64748b"
      />

      {/* 5. O'zbekiston Davlat Raqami (Bayroq va format bilan) */}
      <Text style={styles.label}>Avtomobil davlat raqami</Text>
      <View style={styles.plateContainer}>
        <View style={styles.plateRegionBox}>
          <Text style={styles.plateRegionText}>{plateRegion}</Text>
        </View>
        <View style={styles.plateDivider} />
        <TextInput
          style={styles.plateInput}
          value={plateNumber}
          onChangeText={setPlateNumber}
          placeholder="A 777 AA"
          placeholderTextColor="#64748b"
          autoCapitalize="characters"
        />
        <View style={styles.plateFlagBox}>
          <Text style={styles.flagIcon}>🇺🇿</Text>
          <Text style={styles.uzText}>UZ</Text>
        </View>
      </View>

      {/* 6. Chiqqan yili va Sig'imi */}
      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Chiqqan yili</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            placeholder="2021"
            placeholderTextColor="#64748b"
          />
        </View>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Yuk sig'imi (Tonna)</Text>
          <TextInput
            style={styles.input}
            value={payloadTons}
            onChangeText={setPayloadTons}
            keyboardType="number-pad"
            placeholder="20"
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      {/* 7. Narx / km */}
      <Text style={styles.label}>Tarif (1 km uchun so'm)</Text>
      <TextInput
        style={styles.input}
        value={ratePerKm}
        onChangeText={setRatePerKm}
        keyboardType="number-pad"
        placeholder="7500"
        placeholderTextColor="#64748b"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Saqlash va Boshlash</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f17' },
  screenTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  screenSub: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfCol: { flex: 1 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#161f2e',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
  },
  roleContainer: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#161f2e',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleBtnActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  roleBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  roleBtnTextActive: { color: '#000', fontWeight: '700' },
  brandScroll: { flexDirection: 'row', marginBottom: 18 },
  brandCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#161f2e',
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandCardActive: { borderColor: '#f59e0b', backgroundColor: '#2a2310' },
  brandLogoText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 18,
  },
  plateRegionBox: { paddingRight: 8 },
  plateRegionText: { color: '#000', fontSize: 20, fontWeight: '800' },
  plateDivider: { width: 2, height: 26, backgroundColor: '#000', marginRight: 10 },
  plateInput: { flex: 1, color: '#000', fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  plateFlagBox: { alignItems: 'center' },
  flagIcon: { fontSize: 14 },
  uzText: { color: '#1e3a8a', fontSize: 10, fontWeight: '800' },
  saveBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  saveBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
