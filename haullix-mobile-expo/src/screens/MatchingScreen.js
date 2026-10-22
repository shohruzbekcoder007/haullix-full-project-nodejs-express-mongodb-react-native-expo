import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const MOCK_MATCHES = [
  {
    id: '1',
    number: '#1245',
    from: 'Qarshi',
    to: 'Toshkent',
    cargo: "Bug'doy va un mahsulotlari",
    weight: '18 tonna',
    price: "3 500 000 so'm",
    matchScore: 96,
    time: 'Bugun, 18:00',
    owner: 'Azizbek Komilov',
  },
  {
    id: '2',
    number: '#1246',
    from: 'Qarshi',
    to: 'Toshkent',
    cargo: 'Qurilish mollari',
    weight: '15 tonna',
    price: "2 900 000 so'm",
    matchScore: 91,
    time: 'Bugun, 20:00',
    owner: 'Rustam Karimov',
  },
  {
    id: '3',
    number: '#1247',
    from: 'Qarshi',
    to: 'Toshkent',
    cargo: 'Polietilen granulalar',
    weight: '20 tonna',
    price: "4 000 000 so'm",
    matchScore: 84,
    time: 'Ertaga, 09:00',
    owner: 'Jamshid Tohirov',
  },
];

export default function MatchingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.routeHeader}>
        <Text style={styles.routeTitle}>Qarshi ➔ Toshkent</Text>
        <Text style={styles.routeSub}>Sizning mashinangizga 96% gacha mos qaytish yuklari</Text>
      </View>

      <FlatList
        data={MOCK_MATCHES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{item.matchScore}% mos</Text>
              </View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>

            <Text style={styles.cargoTitle}>{item.cargo}</Text>
            <Text style={styles.weightText}>{item.weight} • Tent / Fura</Text>

            <View style={styles.cardBottom}>
              <Text style={styles.priceText}>{item.price}</Text>
              <TouchableOpacity style={styles.takeBtn}>
                <Text style={styles.takeBtnText}>Tanlash</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f17', padding: 16 },
  routeHeader: { marginBottom: 16, paddingTop: 10 },
  routeTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  routeSub: { fontSize: 13, color: '#f59e0b', marginTop: 4 },
  card: {
    backgroundColor: '#161f2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  scoreText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  timeText: { color: '#94a3b8', fontSize: 12 },
  cargoTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 10 },
  weightText: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  priceText: { color: '#f59e0b', fontSize: 17, fontWeight: '800' },
  takeBtn: { backgroundColor: '#f59e0b', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  takeBtnText: { color: '#000', fontWeight: '700', fontSize: 13 },
});
