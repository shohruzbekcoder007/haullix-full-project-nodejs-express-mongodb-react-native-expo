import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { finesAPI } from '../services/api';

export default function FinesScreen() {
  const [plate, setPlate] = useState('01A777AA');
  const [loading, setLoading] = useState(false);
  const [fines, setFines] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleCheck = async () => {
    if (!plate.trim()) {
      Alert.alert('Xatolik', 'Avtomobil davlat raqamini kiriting');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await finesAPI.checkFines(plate.toUpperCase().trim());
      if (res.data && res.data.fines) {
        setFines(res.data.fines);
      } else {
        setFines([]);
      }
    } catch (e) {
      // Mock data if no fines found or offline
      setFines([
        {
          id: '1',
          article: "128-modda 3-qism (Tezlikni oshirish 20-40 km/soat)",
          amount: 340000,
          location: "M39 yo'li, 42-km (Qashqadaryo)",
          date: "2026-03-12 14:22",
          status: "To'lanmagan",
          discountDate: "2026-03-27"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jarimalar & Radarlar</Text>
        <Text style={styles.subtitle}>DYXX va radar jarimalarini onlayn tekshirish</Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.label}>Avtomobil davlat raqami</Text>
        <TextInput
          style={styles.input}
          value={plate}
          onChangeText={setPlate}
          placeholder="01 A 777 AA"
          placeholderTextColor="#64748b"
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.checkBtn} onPress={handleCheck} disabled={loading}>
          <Text style={styles.checkBtnText}>{loading ? 'Tekshirilmoqda...' : 'Jarimalarni tekshirish'}</Text>
        </TouchableOpacity>
      </View>

      {searched && (
        <View style={styles.resultsBox}>
          <Text style={styles.resultTitle}>Tekshiruv natijasi</Text>
          {fines.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>Ushbu avtomobilda to'lanmagan jarima topilmadi!</Text>
            </View>
          ) : (
            fines.map((f, i) => (
              <View key={i} style={styles.fineCard}>
                <View style={styles.fineHeader}>
                  <Text style={styles.fineAmount}>{f.amount?.toLocaleString()} so'm</Text>
                  <Text style={styles.fineStatus}>{f.status}</Text>
                </View>
                <Text style={styles.fineArticle}>{f.article}</Text>
                <Text style={styles.fineMeta}>📍 {f.location}</Text>
                <Text style={styles.fineMeta}>🕒 {f.date}</Text>
                {f.discountDate && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>50% chegirma bilan: {(f.amount / 2).toLocaleString()} so'm ({f.discountDate} gacha)</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* Yo'ldagi yangi radarlar haqida ogohlantirish */}
      <View style={styles.radarCard}>
        <Text style={styles.radarTitle}>🚨 Yo'ldagi faol statsionar radarlar</Text>
        <Text style={styles.radarDesc}>Toshkent — Samarqand — Qarshi trassasida 14 ta yangi tezlik o'lchash moslamasi faol ishlamoqda.</Text>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  searchCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  checkBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsBox: {
    paddingHorizontal: 16,
  },
  resultTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  fineCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  fineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fineAmount: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: '800',
  },
  fineStatus: {
    color: '#f87171',
    fontWeight: '600',
    fontSize: 12,
  },
  fineArticle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  fineMeta: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 4,
  },
  discountBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 8,
    borderRadius: 6,
  },
  discountText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  radarCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  radarTitle: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  radarDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
});
