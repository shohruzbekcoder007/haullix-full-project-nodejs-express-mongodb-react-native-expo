import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '../components/DateTimePicker';
import { Clock, Star } from 'lucide-react-native';
import { ordersAPI, avatarUrl, getErrorMessage } from '../services/api';
import { TopBar, ScreenTitle, Label, Field, PrimaryButton, UserAvatar } from '../components/ui';
import { formatMoney, formatPhone, formatTime } from '../utils/format';
import { colors } from '../theme';

const timeToDate = (time) => {
  const d = new Date();
  const [h, m] = String(time || '').split(':').map(Number);
  if (Number.isFinite(h) && Number.isFinite(m)) d.setHours(h, m, 0, 0);
  return d;
};

export default function DriverDetailScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);
  const [arrivalTime, setArrivalTime] = useState('');
  const [fee, setFee] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [showTime, setShowTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ordersAPI.getOrder(orderId)
      .then((res) => {
        const review = res.order.review || {};
        setOrder(res.order);
        setArrivalTime(review.arrivalTime || '');
        setFee(review.driverFee ? String(review.driverFee) : '');
        setNotes(review.notes || '');
        setRating(review.rating || 0);
      })
      .catch((e) => {
        Alert.alert('Xatolik', getErrorMessage(e));
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const onTimeChange = (event, selected) => {
    setShowTime(Platform.OS === 'ios');
    if (event.type === 'set' && selected) setArrivalTime(formatTime(selected));
  };

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert('Xatolik', 'Haydovchini baholang');
      return;
    }
    setSaving(true);
    try {
      await ordersAPI.reviewDriver(orderId, {
        arrivalTime,
        driverFee: fee ? Number(fee) : undefined,
        notes: notes.trim(),
        rating,
      });
      Alert.alert('Rahmat', 'Bahoyingiz saqlandi', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !order) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TopBar onBack={navigation.goBack} />
          <ScreenTitle>Haydovchi haqida</ScreenTitle>

          <View style={styles.driverRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.caption}>Kimligi</Text>
              <Text style={styles.driverName}>{order.driverName}</Text>
              <Text style={styles.driverPhone}>Tel: {formatPhone(order.driverPhone)}</Text>
            </View>
            <UserAvatar uri={avatarUrl(order.assignedDriver)} size={96} />
          </View>

          <View style={styles.inlineRow}>
            <Text style={styles.inlineLabel}>Kelgan vaqti</Text>
            <Field
              style={styles.inlineField}
              value={arrivalTime}
              placeholder="--:--"
              onPress={() => setShowTime(true)}
              inputStyle={styles.timeText}
              icon={<Clock color={colors.text} size={18} />}
            />
          </View>
          {showTime ? (
            <DateTimePicker value={timeToDate(arrivalTime)} mode="time" is24Hour onChange={onTimeChange} />
          ) : null}

          <View style={styles.inlineRow}>
            <Text style={styles.inlineLabel}>Oladigan summasi</Text>
            <Field
              style={styles.inlineField}
              value={formatMoney(fee)}
              onChangeText={(t) => setFee(t.replace(/\D/g, ''))}
              placeholder="Summa"
              keyboardType="number-pad"
              suffix="so'm"
            />
          </View>

          <Label>Izoh</Label>
          <Field value={notes} onChangeText={setNotes} placeholder="Izoh yozing" multiline />

          <Label style={{ marginTop: 20 }}>Baholang</Label>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => {
              const active = n <= rating;
              return (
                <TouchableOpacity key={n} onPress={() => setRating(n)} hitSlop={6} accessibilityLabel={`${n} yulduz`}>
                  <Star
                    size={40}
                    strokeWidth={1.6}
                    color={active ? colors.starStroke : colors.textSoft}
                    fill={active ? colors.star : 'transparent'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <PrimaryButton title="Yuborish" onPress={handleSubmit} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12 },
  caption: { fontSize: 15, color: colors.textSoft },
  driverName: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  driverPhone: { fontSize: 16, color: colors.text, marginTop: 10 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  inlineLabel: { width: 130, fontSize: 16, fontWeight: '600', color: colors.textMuted },
  inlineField: { flex: 1 },
  timeText: { fontSize: 19, fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 10 },
});
