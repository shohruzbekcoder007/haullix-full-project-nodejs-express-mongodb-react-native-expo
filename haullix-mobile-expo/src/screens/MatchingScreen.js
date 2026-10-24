import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowRight, Search, X } from 'lucide-react-native';
import { matchingAPI, getErrorMessage } from '../services/api';
import { TopBar, ScreenTitle, PrimaryButton, PickerModal } from '../components/ui';
import { useSidebar } from '../context/SidebarContext';
import { OrderCard } from './OrdersScreen';
import { colors } from '../theme';
import { PLACES } from '../constants';

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

function RoutePoint({ letter, value, onPress, onClear }) {
  return (
    <TouchableOpacity style={styles.point} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.pointBadge}>
        <Text style={styles.pointBadgeText}>{letter}</Text>
      </View>
      <Text style={[styles.pointText, !value && styles.pointPlaceholder]} numberOfLines={1}>
        {value || 'Istalgan'}
      </Text>
      {value ? (
        <TouchableOpacity onPress={onClear} hitSlop={10} accessibilityLabel="Tozalash">
          <X color={colors.textMuted} size={16} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

export default function MatchingScreen({ navigation }) {
  const sidebar = useSidebar();
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('all');
  const [route, setRoute] = useState({ fromCity: '', toCity: '' });
  const [picker, setPicker] = useState(null); // 'fromCity' | 'toCity'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Yo'nalish o'zgarsa, moslik foizi server tomonda qayta hisoblanadi
  const load = useCallback(async () => {
    try {
      const params = {};
      if (route.fromCity) params.fromCity = route.fromCity;
      if (route.toCity) params.toCity = route.toCity;
      const res = await matchingAPI.getReturnLoads(params);
      setMatches(res.matches || []);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [route]);

  const setPoint = (key, value) => {
    setLoading(true);
    setRoute((r) => ({ ...r, [key]: value }));
  };

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
      <TopBar onMenu={sidebar?.open} />
      <ScreenTitle>Mos yuklar</ScreenTitle>
      <Text style={styles.routeLabel}>Qaytish yo'nalishingiz</Text>
      <View style={styles.routeRow}>
        <RoutePoint
          letter="A"
          value={route.fromCity}
          onPress={() => setPicker('fromCity')}
          onClear={() => setPoint('fromCity', '')}
        />
        <ArrowRight color={colors.text} size={20} />
        <RoutePoint
          letter="B"
          value={route.toCity}
          onPress={() => setPicker('toCity')}
          onClear={() => setPoint('toCity', '')}
        />
      </View>
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
      <PickerModal
        visible={!!picker}
        title={picker === 'fromCity' ? 'Qayerdan (A)' : 'Qayerga (B)'}
        options={PLACES}
        allowCustom
        searchPlaceholder="Tuman, shahar"
        onSelect={(value) => {
          setPoint(picker, value);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  routeLabel: { fontSize: 15, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  point: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    gap: 8,
  },
  pointBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointBadgeText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  pointText: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '600', color: colors.text },
  pointPlaceholder: { fontWeight: '400', color: colors.textMuted },
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
