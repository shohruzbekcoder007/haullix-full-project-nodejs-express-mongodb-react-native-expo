import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowRight, Star } from 'lucide-react-native';
import { ordersAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TopBar, ScreenTitle, PrimaryButton } from '../components/ui';
import { formatDayMonth, formatSum } from '../utils/format';
import { colors } from '../theme';

export function Stars({ rating, size = 18 }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={1.6}
          color={n <= rating ? colors.starStroke : colors.border}
          fill={n <= rating ? colors.star : 'transparent'}
        />
      ))}
    </View>
  );
}

function ReviewCard({ item, isDriver }) {
  const { review } = item;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.person} numberOfLines={1}>
          {isDriver ? item.ownerName : item.driverName}
        </Text>
        <Stars rating={review.rating} />
      </View>
      <View style={styles.routeRow}>
        <Text style={styles.route} numberOfLines={1}>{item.fromCity}</Text>
        <ArrowRight color={colors.textMuted} size={14} />
        <Text style={styles.route} numberOfLines={1}>{item.toCity}</Text>
        <Text style={styles.cargo} numberOfLines={1}>· {item.cargoType}</Text>
      </View>
      {review.notes ? <Text style={styles.notes}>{review.notes}</Text> : null}
      <View style={styles.footer}>
        <Text style={styles.meta}>{formatDayMonth(review.createdAt)}</Text>
        {review.arrivalTime ? <Text style={styles.meta}>Kelgan vaqti: {review.arrivalTime}</Text> : null}
        {review.driverFee ? <Text style={styles.meta}>{formatSum(review.driverFee)}</Text> : null}
      </View>
    </View>
  );
}

export default function ReviewsScreen({ navigation }) {
  const { user, role } = useAuth();
  const isDriver = role === 'driver';
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await ordersAPI.getMyReviews();
      setReviews(res.reviews || []);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Haydovchi uchun umumiy reyting kartasi
  const summary = isDriver && user?.ratingCount ? (
    <View style={styles.summary}>
      <Text style={styles.summaryValue}>{user.rating.toFixed(1)}</Text>
      <View>
        <Stars rating={Math.round(user.rating)} size={22} />
        <Text style={styles.summaryText}>{user.ratingCount} ta baho asosida</Text>
      </View>
    </View>
  ) : null;

  const empty = loading ? (
    <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
  ) : (
    <View style={styles.empty}>
      <Star color={colors.textSoft} size={56} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>
        {error || (isDriver ? 'Sizga hali baho berilmagan' : 'Siz hali haydovchilarni baholamagansiz')}
      </Text>
      {error ? (
        <PrimaryButton title="Qayta urinish" onPress={() => { setLoading(true); load(); }} style={{ alignSelf: 'stretch' }} />
      ) : (
        <Text style={styles.emptySubtitle}>
          {isDriver
            ? "Yuk egalari reys tugagach sizni baholaydi"
            : "Buyurtma sahifasida «Haydovchi haqida / baholash» tugmasini bosing"}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <TopBar onBack={navigation.goBack} />
            <ScreenTitle>Sharhlarim</ScreenTitle>
            <Text style={styles.subtitle}>
              {isDriver ? 'Yuk egalari sizga bergan baholar' : 'Siz haydovchilarga bergan baholar'}
            </Text>
            {summary}
          </>
        }
        ListEmptyComponent={empty}
        renderItem={({ item }) => <ReviewCard item={item} isDriver={isDriver} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: 16 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryValue: { fontSize: 40, fontWeight: '800', color: colors.text },
  summaryText: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  stars: { flexDirection: 'row', gap: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  person: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  route: { flexShrink: 1, fontSize: 14, fontWeight: '600', color: colors.textMuted },
  cargo: { flexShrink: 1, fontSize: 14, color: colors.textSoft },
  notes: { fontSize: 15, color: colors.text, marginTop: 10, lineHeight: 21 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  meta: { fontSize: 13, color: colors.textSoft },
  empty: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
});
