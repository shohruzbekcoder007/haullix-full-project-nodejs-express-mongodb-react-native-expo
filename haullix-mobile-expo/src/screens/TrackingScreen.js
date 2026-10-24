import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { Phone, Truck } from 'lucide-react-native';
import { ordersAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TopBar, PrimaryButton, SecondaryButton } from '../components/ui';
import { formatDayMonth, formatPhone, formatSum, getDeliveryProgress } from '../utils/format';
import { colors, STATUS_INFO } from '../theme';

// Xaritadagi marshrut: A dan B gacha kubik egri chiziq
const MAP_W = 300;
const MAP_H = 310;
const ROUTE = [[22, 268], [110, 190], [190, 210], [272, 55]];
const pointAt = (t) => {
  const u = 1 - t;
  const [p0, p1, p2, p3] = ROUTE;
  return [0, 1].map((i) =>
    u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]
  );
};
const samplePoints = (from, to, steps = 30) =>
  Array.from({ length: steps + 1 }, (_, i) => pointAt(from + ((to - from) * i) / steps).join(',')).join(' ');

function RouteMap({ progress }) {
  const t = progress / 100;
  const [truckX, truckY] = pointAt(t);

  return (
    <View style={styles.map}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
        {/* Ko'chalar */}
        <Line x1="60" y1="0" x2="98" y2={MAP_H} stroke="#ffffff" strokeWidth="9" />
        <Line x1="212" y1="0" x2="190" y2={MAP_H} stroke="#ffffff" strokeWidth="9" />
        <Line x1="0" y1="92" x2={MAP_W} y2="122" stroke="#ffffff" strokeWidth="9" />
        <Line x1="0" y1="232" x2={MAP_W} y2="210" stroke="#ffffff" strokeWidth="9" />
        {/* Bosib o'tilgan va qolgan yo'l */}
        {t > 0 ? (
          <Polyline points={samplePoints(0, t)} fill="none" stroke={colors.primary} strokeWidth="5" strokeLinecap="round" />
        ) : null}
        {t < 1 ? (
          <Polyline
            points={samplePoints(t, 1)}
            fill="none"
            stroke="#6b7280"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0.1 18"
          />
        ) : null}
        <Circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="15" fill={colors.dark} />
        <SvgText x={ROUTE[0][0]} y={ROUTE[0][1] + 5} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">A</SvgText>
        <Circle cx={ROUTE[3][0]} cy={ROUTE[3][1]} r="15" fill={colors.dark} />
        <SvgText x={ROUTE[3][0]} y={ROUTE[3][1] + 5} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">B</SvgText>
      </Svg>

      <View
        style={[
          styles.truckMarker,
          { left: `${(truckX / MAP_W) * 100}%`, top: `${(truckY / MAP_H) * 100}%` },
        ]}
      >
        <Truck color={colors.primary} fill={colors.primary} size={22} strokeWidth={1.5} />
      </View>

      <View style={styles.gpsBadge}>
        <Text style={styles.gpsText}>GPS</Text>
      </View>
    </View>
  );
}

function InfoRow({ label, children }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueBox}>{children}</View>
    </View>
  );
}

export default function TrackingScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = orderId ? await ordersAPI.getOrder(orderId) : await ordersAPI.getActiveTracking();
      setOrder(res.order || null);
    } catch (e) {
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const close = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs'));

  const runAction = (title, message, action) => {
    Alert.alert(title, message, [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Ha',
        onPress: async () => {
          setActing(true);
          try {
            const res = await action();
            if (res?.order) setOrder(res.order);
            else close();
          } catch (e) {
            Alert.alert('Xatolik', getErrorMessage(e));
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TopBar onBack={close} />
          <Text style={styles.emptyText}>Hozircha yo'ldagi yuk yo'q</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user && order.owner === user._id;
  const isAssignedDriver = user && order.assignedDriver === user._id;
  const status = STATUS_INFO[order.status] || STATUS_INFO.active;
  const { percent, remaining } = getDeliveryProgress(order);

  const contact = isOwner
    ? { label: 'Haydovchi', name: order.driverName, phone: order.driverPhone }
    : { label: 'Yuk egasi', name: order.ownerName, phone: order.ownerPhone };

  const arrival = order.review?.arrivalTime ? `, taxminan ${order.review.arrivalTime} da` : '';
  const headline = `${formatDayMonth(order.deliveryDate)}${arrival} ${order.status === 'completed' ? 'yetib keldi' : 'yetib keladi'}`;

  const callContact = () => {
    Linking.openURL(`tel:${contact.phone}`).catch(() =>
      Alert.alert('Xatolik', "Qo'ng'iroq qilib bo'lmadi")
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TopBar onBack={close} onClose={close} />

        <View style={styles.card}>
          <Text style={styles.headline}>{headline}</Text>
          <InfoRow label="Tovar turi"><Text style={styles.infoValue}>{order.cargoType}</Text></InfoRow>
          <InfoRow label="Yo'nalish"><Text style={styles.infoValue}>{order.fromCity} → {order.toCity}</Text></InfoRow>
          <InfoRow label="Hajmi"><Text style={styles.infoValue}>{order.volumeM3} m³</Text></InfoRow>
          <InfoRow label="Summa"><Text style={styles.infoValue}>{formatSum(order.price)}</Text></InfoRow>
          <InfoRow label={contact.label}>
            {contact.name ? (
              <>
                <Text style={styles.infoValue}>{contact.name}</Text>
                <Text style={styles.infoValue}>{formatPhone(contact.phone)}</Text>
              </>
            ) : (
              <Text style={styles.infoMuted}>Hali biriktirilmagan</Text>
            )}
          </InfoRow>
        </View>

        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          {remaining ? <Text style={styles.remaining}>{remaining}</Text> : null}
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>

        <RouteMap progress={percent} />

        {contact.phone ? (
          <PrimaryButton
            title={`${contact.label} bilan bog'lanish`}
            icon={<Phone color="#ffffff" fill="#ffffff" size={20} />}
            onPress={callContact}
            style={{ marginTop: 16 }}
          />
        ) : null}

        {user?.role === 'driver' && order.status === 'active' && !isOwner ? (
          <PrimaryButton
            title="Yukni qabul qilish"
            loading={acting}
            onPress={() => runAction('Qabul qilish', 'Ushbu yukni olib borasizmi?', () => ordersAPI.accept(order._id))}
            style={{ marginTop: 16 }}
          />
        ) : null}

        {isAssignedDriver && order.status === 'in_transit' ? (
          <SecondaryButton
            title="Yetkazib berildi"
            loading={acting}
            onPress={() => runAction('Yetkazildi', 'Yuk manzilga yetkazildimi?', () => ordersAPI.complete(order._id))}
          />
        ) : null}

        {isOwner && order.assignedDriver ? (
          <SecondaryButton
            title={order.review ? 'Haydovchi bahosini tahrirlash' : 'Haydovchi haqida / baholash'}
            onPress={() => navigation.navigate('DriverDetail', { orderId: order._id })}
          />
        ) : null}

        {isOwner && order.status === 'active' ? (
          <SecondaryButton
            title="Buyurtmani bekor qilish"
            color={colors.danger}
            loading={acting}
            onPress={() => runAction('Bekor qilish', 'Buyurtmani bekor qilmoqchimisiz?', () => ordersAPI.cancel(order._id))}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  emptyText: { fontSize: 17, color: colors.textMuted, textAlign: 'center', marginTop: 80 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginTop: 6,
  },
  headline: { fontSize: 21, fontWeight: '800', color: colors.text, lineHeight: 28, marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  infoLabel: { fontSize: 16, color: colors.textMuted },
  infoValueBox: { alignItems: 'flex-end', flexShrink: 1, marginLeft: 12 },
  infoValue: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'right', lineHeight: 24 },
  infoMuted: { fontSize: 16, color: colors.textSoft },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 12,
  },
  statusLabel: { flex: 1, fontSize: 18, fontWeight: '800', lineHeight: 22 },
  remaining: { flex: 1, fontSize: 15, color: colors.textMuted, lineHeight: 20 },
  progressBg: {
    height: 8,
    backgroundColor: colors.borderSoft,
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  map: {
    marginTop: 16,
    width: '100%',
    aspectRatio: MAP_W / MAP_H,
    backgroundColor: '#e7efe2',
    borderRadius: 18,
    overflow: 'hidden',
  },
  truckMarker: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.dark,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  gpsText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
