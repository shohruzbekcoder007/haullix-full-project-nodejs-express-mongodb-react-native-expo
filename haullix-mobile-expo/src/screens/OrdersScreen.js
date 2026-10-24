import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowRight, ChevronRight, Package } from 'lucide-react-native';
import { ordersAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScreenTitle, PrimaryButton } from '../components/ui';
import { formatDayMonth, formatSum } from '../utils/format';
import { colors, STATUS_INFO } from '../theme';

export function OrderCard({ order, onPress, badge }) {
  const status = badge || STATUS_INFO[order.status] || STATUS_INFO.active;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <Text style={styles.cargoType} numberOfLines={1}>{order.cargoType}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <View style={styles.routeRow}>
        <Text style={styles.city} numberOfLines={1}>{order.fromCity}</Text>
        <ArrowRight color={colors.textMuted} size={16} />
        <Text style={styles.city} numberOfLines={1}>{order.toCity}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.meta}>
          {order.volumeM3} m³ · {formatDayMonth(order.deliveryDate)}
        </Text>
        <Text style={styles.price}>{formatSum(order.price)}</Text>
        <ChevronRight color={colors.textSoft} size={18} />
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen({ navigation }) {
  const { role } = useAuth();
  const isDriver = role === 'driver';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await ordersAPI.getOrders();
      setOrders(res.orders || []);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const empty = loading ? (
    <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
  ) : (
    <View style={styles.empty}>
      <Package color={colors.textSoft} size={56} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>{error || (isDriver ? 'Hali reys olmagansiz' : "Buyurtmalar yo'q")}</Text>
      {!error ? (
        <Text style={styles.emptySubtitle}>
          {isDriver ? "Mos yuklar bo'limidan yuk tanlang" : 'Birinchi yukingizni joylashtiring'}
        </Text>
      ) : null}
      <PrimaryButton
        title={error ? 'Qayta urinish' : isDriver ? 'Mos yuklar' : 'Yuk joylash'}
        onPress={() => {
          if (error) { setLoading(true); load(); }
          else navigation.navigate(isDriver ? 'MatchingTab' : 'PostCargoTab');
        }}
        style={styles.emptyBtn}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={<ScreenTitle>{isDriver ? 'Reyslarim' : 'Buyurtmalarim'}</ScreenTitle>}
        ListEmptyComponent={empty}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => navigation.navigate('Tracking', { orderId: item._id })} />
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cargoType: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  city: { flexShrink: 1, fontSize: 15, fontWeight: '600', color: colors.textMuted },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  meta: { flex: 1, fontSize: 14, color: colors.textSoft },
  price: { fontSize: 15, fontWeight: '700', color: colors.primary, marginRight: 4 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  emptyBtn: { alignSelf: 'stretch' },
});
