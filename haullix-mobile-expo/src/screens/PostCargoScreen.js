import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '../components/DateTimePicker';
import { ArrowRight, Calendar, Check, ChevronDown } from 'lucide-react-native';
import { ordersAPI, getErrorMessage } from '../services/api';
import { TopBar, ScreenTitle, Label, Field, PrimaryButton, PickerModal } from '../components/ui';
import { formatDateInput, formatMoney } from '../utils/format';
import { colors } from '../theme';

const CARGO_TYPES = [
  "Bug'doy",
  'Qurilish materiallari',
  'Oziq-ovqat mahsulotlari',
  'Meva-sabzavot',
  'Maishiy texnika',
  'Mebel',
  'Kiyim-kechak',
  'Kimyoviy moddalar',
  "Qishloq xo'jaligi",
  'Boshqa',
];

const PLACES = [
  'Toshkent', 'Toshkent viloyati', 'Samarqand', 'Buxoro', 'Navoiy', 'Qarshi', 'Termiz',
  'Jizzax', 'Guliston', 'Namangan', 'Andijon', "Farg'ona", "Qo'qon", 'Urganch', 'Nukus',
  'Chirchiq', 'Angren', 'Olmaliq', 'Shahrisabz', 'Denov', 'Kattaqo\'rg\'on', 'Marg\'ilon',
];

const EMPTY = {
  cargoType: '',
  fromCity: '',
  toCity: '',
  volume: '',
  price: '',
  date: null,
  payerName: '',
  payerId: '',
};

export default function PostCargoScreen({ navigation }) {
  const [form, setForm] = useState(EMPTY);
  const [picker, setPicker] = useState(null); // 'cargo' | 'from' | 'to'
  const [showDate, setShowDate] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onSelectPicker = (value) => {
    const key = { cargo: 'cargoType', from: 'fromCity', to: 'toCity' }[picker];
    set(key)(value);
    setPicker(null);
  };

  const onDateChange = (event, selected) => {
    setShowDate(Platform.OS === 'ios');
    if (event.type === 'set' && selected) set('date')(selected);
  };

  const handleSubmit = async () => {
    const error =
      (!form.cargoType && 'Tovar turini tanlang') ||
      ((!form.fromCity || !form.toCity) && "Qayerdan va qayerga ekanini tanlang") ||
      (!(Number(form.volume) > 0) && 'Tovar hajmini kiriting') ||
      (!form.price && 'Summani kiriting') ||
      (!form.date && 'Yetib borish sanasini tanlang');
    if (error) {
      Alert.alert('Xatolik', error);
      return;
    }

    setLoading(true);
    try {
      await ordersAPI.createOrder({
        cargoType: form.cargoType,
        fromCity: form.fromCity,
        toCity: form.toCity,
        volumeM3: Number(form.volume),
        price: Number(form.price),
        deliveryDate: formatDateInput(form.date),
        payerName: form.payerName.trim(),
        payerId: form.payerId.trim(),
      });
      setForm(EMPTY);
      Alert.alert('Tayyor', 'Yukingiz joylashtirildi. Haydovchilar uni ko\'rishadi.', [
        { text: 'OK', onPress: () => navigation.navigate('OrdersTab') },
      ]);
    } catch (e) {
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TopBar onBack={navigation.canGoBack() ? navigation.goBack : null} />
          <ScreenTitle>Yuk joylash</ScreenTitle>

          <Label>Tovar turi</Label>
          <Field
            value={form.cargoType}
            placeholder="Tovar turini tanlang"
            onPress={() => setPicker('cargo')}
            inputStyle={styles.cargoText}
            icon={<ChevronDown color={colors.text} size={18} />}
          />

          <Label>Qayerdan — qayerga</Label>
          <View style={styles.routeRow}>
            <RouteBox letter="A" value={form.fromCity} onPress={() => setPicker('from')} />
            <ArrowRight color={colors.text} size={22} />
            <RouteBox letter="B" value={form.toCity} onPress={() => setPicker('to')} />
          </View>

          <Label>Tovar hajmi</Label>
          <Field
            value={form.volume}
            onChangeText={(t) => set('volume')(t.replace(',', '.').replace(/[^\d.]/g, ''))}
            placeholder="Hajmini kiriting"
            keyboardType="decimal-pad"
            suffix="m³"
          />

          <Label>Summa</Label>
          <Field
            value={formatMoney(form.price)}
            onChangeText={(t) => set('price')(t.replace(/\D/g, ''))}
            placeholder="Summani kiriting"
            keyboardType="number-pad"
            suffix="so'm"
          />

          <Label>Yetib borish sanasi</Label>
          <Field
            value={form.date ? formatDateInput(form.date) : ''}
            placeholder="kk/oo/yyyy"
            onPress={() => setShowDate(true)}
            icon={<Calendar color={colors.text} size={22} />}
          />
          {showDate ? (
            <DateTimePicker
              value={form.date || today}
              mode="date"
              minimumDate={today}
              onChange={onDateChange}
            />
          ) : null}

          <Label>To'lovchi: qabul qiluvchi yoki yuboruvchi</Label>
          <Field value={form.payerName} onChangeText={set('payerName')} placeholder="Ismi" autoCapitalize="words" />
          <Field
            value={form.payerId}
            onChangeText={set('payerId')}
            placeholder="ID raqami"
            style={{ marginTop: 12 }}
          />

          <PrimaryButton
            title="Tasdiqlash"
            icon={<Check color="#ffffff" size={22} strokeWidth={2.5} />}
            onPress={handleSubmit}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={picker === 'cargo'}
        title="Tovar turi"
        options={CARGO_TYPES}
        allowCustom
        searchPlaceholder="Qidirish yoki o'zingiz yozing"
        onSelect={onSelectPicker}
        onClose={() => setPicker(null)}
      />
      <PickerModal
        visible={picker === 'from' || picker === 'to'}
        title={picker === 'from' ? 'Qayerdan (A)' : 'Qayerga (B)'}
        options={PLACES}
        allowCustom
        searchPlaceholder="Tuman, shahar"
        onSelect={onSelectPicker}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

function RouteBox({ letter, value, onPress }) {
  return (
    <TouchableOpacity style={styles.routeBox} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.routeBadge}>
        <Text style={styles.routeBadgeText}>{letter}</Text>
      </View>
      <Text style={[styles.routeText, !value && styles.routePlaceholder]} numberOfLines={2}>
        {value || 'Tuman, shahar'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  cargoText: { fontSize: 18, fontWeight: '600', color: colors.text },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    gap: 10,
  },
  routeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBadgeText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  routeText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  routePlaceholder: { fontWeight: '400', color: colors.textMuted },
});
