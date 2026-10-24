import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { matchingAPI, getErrorMessage } from '../services/api';
import { ScreenTitle, PrimaryButton } from '../components/ui';
import { OrderCard } from './OrdersScreen';
import { colors } from '../theme';

const FILTERS = [
  { key: 'all', label: 'Barchasi' },
  { key: 'high', label: 'Yuqori mos' },
  { key: 'price', label: 'Qimmat' },
  { key: 'soon', label: 'Yaqin sana' },
];

const scoreBadge = (score) => {
  if (score >= 80) return { label: `${score}% mos`, color: colors.primary, bg: colors.primarySoft };
  if (score >= 50) return { label: `${score}% mos`, color: '#b45309', bg: '#fef3c7' };
  return { label: `${score}% mos`, color: colors.textMuted, bg: colors.borderSoft };
};

export default function MatchingScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await matchingAPI.getReturnLoads();
      setMatches(res.matches || []);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const visible = useMemo(() => {
    const list = [...matches];
    if (filter === 'high') return list.filter((m) => m.matchScore >= 70);
    if (filter === 'price') return list.sort((a, b) => b.price - a.price);
    if (filter === 'soon') return list.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
    return list;
  }, [matches, filter]);

  const header = (
    <>
      <ScreenTitle>Mos yuklar</ScreenTitle>
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  const empty = loading ? (
    <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
  ) : (
    <View style={styles.empty}>
      <Search color={colors.textSoft} size={56} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>{error || "Hozircha bo'sh yuklar yo'q"}</Text>
      {error ? (
        <PrimaryButton title="Qayta urinish" onPress={() => { setLoading(true); load(); }} style={{ alignSelf: 'stretch' }} />
      ) : (
        <Text style={styles.emptySubtitle}>Pastga tortib yangilang</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <FlatList
        data={visible}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            badge={scoreBadge(item.matchScore)}
            onPress={() => navigation.navigate('Tracking', { orderId: item._id })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#ffffff' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: colors.textMuted, marginTop: 6 },
});
