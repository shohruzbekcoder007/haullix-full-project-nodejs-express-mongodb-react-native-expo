import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function ProfileScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert('Chiqish', 'Hisobdan chiqishni xohlaysizmi?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: () => navigation.replace('AuthPhone') },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SH</Text>
        </View>
        <Text style={styles.name}>Shohruzbek Ochilov</Text>
        <Text style={styles.role}>🚛 Professional Haydovchi</Text>
        <Text style={styles.phone}>+998 90 123 45 67</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transport vositasi</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Rusum & Model:</Text>
            <Text style={styles.value}>MAN TGS 18.400</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Davlat raqami:</Text>
            <Text style={styles.valueHighlight}>01 A 777 AA</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Yuk ko'tarish quvvati:</Text>
            <Text style={styles.value}>22 tonna</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>1 km tarifi:</Text>
            <Text style={styles.value}>7 500 so'm</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistika</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>14</Text>
            <Text style={styles.statLabel}>Bajarilgan qatnovlar</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>4.9 ⭐</Text>
            <Text style={styles.statLabel}>Mijozlar bahosi</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>96%</Text>
            <Text style={styles.statLabel}>Moslik aniqligi</Text>
          </View>
        </View>
      </View>

      <View style={styles.btnBox}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Hisobdan chiqish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 24,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  role: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  phone: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
  },
  value: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  valueHighlight: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNum: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  btnBox: {
    padding: 16,
    marginBottom: 30,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
