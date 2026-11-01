import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowRight, ChevronRight, PackagePlus, Search, Truck } from 'lucide-react-native';
import { ordersAPI, matchingAPI, userAvatarUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { TopBar, UserAvatar } from '../components/ui';
import { OrderCard } from './OrdersScreen';
import { getDeliveryProgress, formatDayMonth } from '../utils/format';
import { colors, STATUS_INFO } from '../theme';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Xayrli tun';
  if (h < 12) return 'Xayrli tong';
  if (h < 18) return 'Xayrli kun';
  return 'Xayrli kech';
};

function Logo() {
  return (
    <View style={styles.logo}>
      <View style={styles.logoIcon}>
        <Truck color="#ffffff" size={16} strokeWidth={2} />
      </View>
      <Text style={styles.logoText}>HAULLIX</Text>
    </View>
  );
}

function SectionHeader({ title, onMore }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onMore ? (
        <TouchableOpacity onPress={onMore} hitSlop={8} style={styles.moreBtn}>
          <Text style={styles.moreText}>Barchasi</Text>
          <ChevronRight color={colors.primary} size={16} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// Yo'ldagi yuk: qisqa kuzatish kartasi
function ActiveShipment({ order, onPress }) {
  const { percent, remaining } = getDeliveryProgress(order);
  return (
    <TouchableOpacity style={styles.activeCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.activeTop}>
        <Text style={styles.activeLabel}>{STATUS_INFO.in_transit.label}</Text>
        <Text style={styles.activeDate}>{formatDayMonth(order.deliveryDate)}</Text>
      </View>
      <View style={styles.activeRoute}>
        <Text style={styles.activeCity} numberOfLines={1}>{order.fromCity}</Text>
        <ArrowRight color="#ffffff" size={18} />
        <Text style={styles.activeCity} numberOfLines={1}>{order.toCity}</Text>
      </View>
      <Text style={styles.activeCargo} numberOfLines={1}>{order.cargoType} · {order.volumeM3} m³</Text>
      <View style={styles.activeBarBg}>
        <View style={[styles.activeBarFill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.activeBottom}>
        <Text style={styles.activeRemaining}>{remaining}</Text>
        <Text style={styles.activeLink}>Kuzatish ›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const sidebar = useSidebar();
  const { user, role } = useAuth();
  const isDriver = role === 'driver';
  const [orders, setOrders] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ordersRes, matchesRes] = await Promise.all([
        ordersAPI.getOrders(),
        isDriver ? matchingAPI.getReturnLoads() : Promise.resolve(null),
      ]);
      setOrders(ordersRes.orders || []);
      setMatches(matchesRes?.matches || []);
    } catch (e) {
      // Xatoda bo'sh holat ko'rsatiladi; pastga tortib qayta urinish mumkin
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isDriver]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const inTransit = orders.filter((o) => o.status === 'in_transit');
  const stats = isDriver
    ? [
      { label: 'Reyting', value: user?.ratingCount ? `★ ${user.rating.toFixed(1)}` : '—' },
      { label: 'Yo\'lda', value: inTransit.length },
      { label: 'Bajarilgan', value: user?.completedTrips ?? 0 },
    ]
    : [
      { label: 'Kutilmoqda', value: orders.filter((o) => o.status === 'active').length },
      { label: 'Yo\'lda', value: inTransit.length },
      { label: 'Yetkazilgan', value: orders.filter((o) => o.status === 'completed').length },
    ];

  const openOrder = (order) => navigation.navigate('Tracking', { orderId: order._id });
  const recent = isDriver ? matches.slice(0, 3) : orders.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />
        }
      >
        <TopBar
          onMenu={sidebar?.open}
          right={<Logo />}
          style={styles.topBar}
        />
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('ProfileTab')}
          accessibilityLabel="Profil"
        >
          <UserAvatar uri={userAvatarUrl(user)} size={40} bordered={false} />
        </TouchableOpacity>

        <Text style={styles.greeting}>{greeting()},</Text>
        <Text style={styles.name} numberOfLines={1}>{user?.firstName || 'foydalanuvchi'}</Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.navigate(isDriver ? 'MatchingTab' : 'PostCargoTab')}
          activeOpacity={0.9}
        >
          <View style={styles.ctaIcon}>
            {isDriver
              ? <Search color={colors.primary} size={26} />
              : <PackagePlus color={colors.primary} size={26} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>{isDriver ? 'Qaytish yukini toping' : 'Yuk joylash'}</Text>
            <Text style={styles.ctaText}>
              {isDriver ? "Bo'sh qaytmang — yo'nalishingizga mos yuk oling" : 'Haydovchilar yukingizni darhol ko\'radi'}
            </Text>
          </View>
          <ChevronRight color="#ffffff" size={22} />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{s.value}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : (
          <>
            {inTransit.length ? (
              <>
                <SectionHeader title={isDriver ? 'Joriy reys' : "Yo'ldagi yuk"} />
                <ActiveShipment order={inTransit[0]} onPress={() => openOrder(inTransit[0])} />
              </>
            ) : null}

            <SectionHeader
              title={isDriver ? 'Siz uchun mos yuklar' : "So'nggi buyurtmalar"}
              onMore={recent.length ? () => navigation.navigate(isDriver ? 'MatchingTab' : 'OrdersTab') : null}
            />
            {recent.length ? (
              recent.map((item) => (
                <OrderCard
                  key={item._id}
                  order={item}
                  onPress={() => openOrder(item)}
                  badge={isDriver ? {
                    label: `${item.matchScore}% mos`,
                    color: colors.primary,
                    bg: colors.primarySoft,
                  } : undefined}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                {isDriver ? "Hozircha bo'sh yuklar yo'q" : "Hali buyurtma joylamagansiz"}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  topBar: { marginBottom: 8 },
  avatarBtn: { position: 'absolute', top: 12, right: 20 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 'auto', marginLeft: 14 },
  logoIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
  greeting: { fontSize: 17, color: colors.textMuted, marginTop: 8 },
  name: { fontSize: 28, fontWeight: '800', color: colors.text },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },
  ctaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  ctaText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2, lineHeight: 19 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.textSoft, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  moreBtn: { flexDirection: 'row', alignItems: 'center' },
  moreText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  activeCard: { backgroundColor: colors.dark, borderRadius: 18, padding: 18 },
  activeTop: { flexDirection: 'row', justifyContent: 'space-between' },
  activeLabel: { fontSize: 14, fontWeight: '700', color: '#4ade80' },
  activeDate: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  activeRoute: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  activeCity: { flexShrink: 1, fontSize: 20, fontWeight: '800', color: '#ffffff' },
  activeCargo: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  activeBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 14,
    overflow: 'hidden',
  },
  activeBarFill: { height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  activeBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  activeRemaining: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  activeLink: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  emptyText: { fontSize: 15, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
});
