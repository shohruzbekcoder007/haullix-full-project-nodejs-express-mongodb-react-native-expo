import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {
  Repeat, ShoppingBag, RotateCcw, Star, MessageSquare, Bell, CircleHelp, Mail,
  ChevronRight, Pencil,
} from 'lucide-react-native';
import { authAPI, userAvatarUrl, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useAvatarUpload from '../hooks/useAvatarUpload';
import { TopBar, UserAvatar, UzFlag, PrimaryButton } from '../components/ui';
import { formatPhone, fullName } from '../utils/format';
import { colors, ROLE_LABELS } from '../theme';
import { SUPPORT_TEXT } from '../constants';

const soon = (title) => () => Alert.alert(title, "Bu bo'lim keyingi versiyada qo'shiladi");

export default function SettingsScreen({ navigation }) {
  const { user, role, setUser, signOut } = useAuth();
  const { changeAvatar, uploading } = useAvatarUpload();
  const [switching, setSwitching] = useState(false);

  const changeRole = async (nextRole) => {
    if (nextRole === role) return;
    setSwitching(true);
    try {
      const res = await authAPI.switchRole(nextRole);
      await setUser(res.user);
      // Tablar yangi rolga mos qayta quriladi
      navigation.navigate('MainTabs');
    } catch (e) {
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setSwitching(false);
    }
  };

  const handleRole = () => {
    Alert.alert("Rolni o'zgartirish", 'Ilovadan kim sifatida foydalanasiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Haydovchi', onPress: () => changeRole('driver') },
      { text: 'Yuk egasi', onPress: () => changeRole('cargo_owner') },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Rostdan ham chiqmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Ha, chiqish',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'AuthPhone' }] });
        },
      },
    ]);
  };

  const groups = [
    [
      { Icon: Repeat, label: "Rolni o'zgartirish", value: switching ? '...' : ROLE_LABELS[role], onPress: handleRole },
      { Icon: ShoppingBag, label: 'Buyurtmalarim', onPress: () => navigation.navigate('MainTabs', { screen: 'OrdersTab' }) },
      { Icon: RotateCcw, label: 'Qaytarishlar', onPress: soon('Qaytarishlar') },
      { Icon: Star, label: 'Sharhlarim', onPress: () => navigation.navigate('Reviews') },
    ],
    [
      { Icon: MessageSquare, label: 'Chatlarim', onPress: soon('Chatlarim') },
      { Icon: Bell, label: 'Bildirishnomalar', onPress: soon('Bildirishnomalar') },
    ],
    [
      { flag: true, label: 'Ilova tili', value: "O'zbekcha", onPress: () => Alert.alert('Ilova tili', "Hozircha faqat o'zbek tili mavjud") },
      { Icon: CircleHelp, label: "Ma'lumotnoma", onPress: () => Alert.alert("Ma'lumotnoma", 'Haullix — bo\'sh qaytmaslik uchun yuk topish platformasi.') },
      { Icon: Mail, label: "Biz bilan bog'lanish", onPress: () => Alert.alert("Biz bilan bog'lanish", SUPPORT_TEXT) },
    ],
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <TopBar onBack={navigation.goBack} color="#ffffff" style={styles.headerBar} />
          <Text style={styles.headerTitle}>Sozlamalar</Text>

          <View style={styles.profileRow}>
            {/* Avatar — rasmni almashtirish; ism yonidagi qalam — profil ma'lumotlarini tahrirlash */}
            <TouchableOpacity
              style={styles.avatar}
              onPress={changeAvatar}
              disabled={uploading}
              activeOpacity={0.85}
              accessibilityLabel="Profil rasmini o'zgartirish"
            >
              <UserAvatar uri={userAvatarUrl(user)} size={118} bordered={false} />
              <View style={styles.editStrip}>
                {uploading ? <ActivityIndicator color="#ffffff" size="small" /> : (
                  <>
                    <Pencil color="#ffffff" size={13} />
                    <Text style={styles.editText}>To'g'rilash</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileInfo}
              onPress={() => navigation.navigate('ProfileSetup', { edit: true })}
              activeOpacity={0.7}
              accessibilityLabel="Profil ma'lumotlarini tahrirlash"
            >
              <Text style={styles.profileName} numberOfLines={2}>{fullName(user)}</Text>
              <Text style={styles.profilePhone}>{formatPhone(user?.phone)}</Text>
              <View style={styles.editInfo}>
                <Pencil color="#ffffff" size={14} />
                <Text style={styles.editInfoText}>Ma'lumotlarni tahrirlash</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {groups.map((items, gi) => (
          <View key={gi} style={styles.group}>
            {items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.item, idx > 0 && styles.itemBorder]}
                onPress={item.onPress}
                disabled={switching && idx === 0 && gi === 0}
              >
                <View style={styles.itemIcon}>
                  {item.flag ? <UzFlag width={34} /> : <item.Icon color={colors.text} size={26} strokeWidth={1.8} />}
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
                {item.value ? <Text style={styles.itemValue}>{item.value}</Text> : null}
                <ChevronRight color={colors.textMuted} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <Text style={styles.version}>Ilova versiyasi: {Constants.expoConfig?.version || '1.0.0'}</Text>
        <PrimaryButton title="Chiqish" onPress={handleLogout} style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerBar: { marginTop: 8 },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  avatar: {
    width: 118,
    height: 118,
    borderRadius: 59,
    overflow: 'hidden',
    marginRight: 18,
  },
  editStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 38,
    backgroundColor: 'rgba(31, 41, 55, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  editText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  profileInfo: { flex: 1 },
  profileName: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  profilePhone: { color: '#ffffff', fontSize: 17, marginTop: 6 },
  editInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, opacity: 0.9 },
  editInfoText: { color: '#ffffff', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  group: {
    backgroundColor: colors.background,
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 16,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    minHeight: 64,
    paddingVertical: 8,
  },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.borderSoft },
  itemIcon: { width: 40, alignItems: 'flex-start' },
  itemLabel: { flex: 1, fontSize: 17, color: colors.text, marginLeft: 6 },
  itemValue: { fontSize: 16, color: colors.textMuted, marginRight: 10 },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 14, marginTop: 24 },
  logoutBtn: { marginHorizontal: 20, marginTop: 14 },
});
