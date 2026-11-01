import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CircleHelp, Package, Settings, Truck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import useAvatarUpload from '../hooks/useAvatarUpload';
import { authAPI, ordersAPI, userAvatarUrl } from '../services/api';
import { useSidebar } from '../context/SidebarContext';
import { TopBar, UserAvatar } from '../components/ui';
import { formatPhone, fullName } from '../utils/format';
import { colors } from '../theme';
import { SUPPORT_TEXT } from '../constants';

export default function ProfileScreen({ navigation }) {
  const sidebar = useSidebar();
  const { user, role, setUser } = useAuth();
  const { changeAvatar, uploading } = useAvatarUpload();
  const [orderCounts, setOrderCounts] = useState(null);
  const isDriver = role === 'driver';

  // Har ochilganda reyting, reyslar va buyurtmalar sonini yangilash
  useFocusEffect(useCallback(() => {
    authAPI.getProfile().then((res) => setUser(res.user)).catch(() => {});
    ordersAPI.getOrders()
      .then((res) => {
        const orders = res.orders || [];
        setOrderCounts({
          total: orders.length,
          active: orders.filter((o) => o.status === 'active' || o.status === 'in_transit').length,
          completed: orders.filter((o) => o.status === 'completed').length,
        });
      })
      .catch(() => {});
  }, [setUser]));

  const count = (key) => (orderCounts ? orderCounts[key] : '—');
  const stats = isDriver
    ? [
      { label: 'Reyting', value: user?.ratingCount ? `★ ${user.rating.toFixed(1)}` : '—' },
      { label: 'Reyslar', value: user?.completedTrips ?? 0 },
      { label: 'Yo\'lda', value: count('active') },
    ]
    : [
      { label: 'Buyurtmalar', value: count('total') },
      { label: 'Faol', value: count('active') },
      { label: 'Yetkazilgan', value: count('completed') },
    ];

  const vehicle = user?.vehicle || {};
  const vehicleText = isDriver
    ? [vehicle.brand, vehicle.plateNumber, vehicle.maxPayloadTons && `${vehicle.maxPayloadTons} t`]
      .filter(Boolean).join(' · ')
    : '';

  const actions = [
    { label: 'Yordam', Icon: CircleHelp, onPress: () => Alert.alert('Yordam', SUPPORT_TEXT) },
    { label: 'Buyurtmalarim', Icon: Package, onPress: () => navigation.navigate('OrdersTab') },
    { label: 'Sozlamalar', Icon: Settings, onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.container}>
        <TopBar onMenu={sidebar?.open} style={styles.topBar} />
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={changeAvatar}
          disabled={uploading}
          activeOpacity={0.85}
          accessibilityLabel="Profil rasmini o'zgartirish"
        >
          <UserAvatar uri={userAvatarUrl(user)} size={150} />
          {uploading ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#ffffff" size="large" />
            </View>
          ) : null}
          <View style={styles.cameraBadge}>
            <Camera color="#ffffff" size={22} />
          </View>
        </TouchableOpacity>

        <Text style={styles.userName}>{fullName(user)}</Text>
        <Text style={styles.userPhone}>Tel: {formatPhone(user?.phone)}</Text>

        <View style={styles.statsCard}>
          {stats.map((s, idx) => (
            <View key={s.label} style={[styles.stat, idx > 0 && styles.statBorder]}>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{s.value}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
            </View>
          ))}
        </View>
        {vehicleText ? (
          <View style={styles.vehicleRow}>
            <Truck color={colors.primary} size={20} />
            <Text style={styles.vehicleText} numberOfLines={1}>{vehicleText}</Text>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          {actions.map(({ label, Icon, onPress }) => (
            <TouchableOpacity key={label} style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
              <Icon color={colors.primary} size={40} strokeWidth={1.8} />
              <Text style={styles.actionLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  topBar: { alignSelf: 'stretch', marginBottom: 16 },
  avatarWrapper: { marginBottom: 22 },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 75,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -6,
    bottom: 4,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: { fontSize: 26, fontWeight: '800', color: colors.text },
  userPhone: { fontSize: 18, color: colors.textMuted, marginTop: 6 },
  statsCard: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 24,
  },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: colors.borderSoft },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.textSoft, marginTop: 2 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  vehicleText: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 24, alignSelf: 'stretch' },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
});
