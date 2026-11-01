import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Pressable, ScrollView,
  useWindowDimensions, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import {
  Home, PackagePlus, Search, Package, Truck, MapPin, Star, User, Settings, CircleHelp, LogOut,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { userAvatarUrl } from '../services/api';
import { UserAvatar } from './ui';
import { formatPhone, fullName } from '../utils/format';
import { colors, ROLE_LABELS } from '../theme';
import { SUPPORT_TEXT } from '../constants';

const DURATION = 220;

export default function Sidebar({ visible, onClose }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, role, signOut } = useAuth();
  const panelWidth = Math.min(320, width * 0.82);

  // Modal yopilish animatsiyasi tugaguncha ko'rinib turadi
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: DURATION,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) setMounted(false);
    });
  }, [visible]);

  const isDriver = role === 'driver';

  // Menyu yopilgach o'tish
  const go = (action) => () => {
    onClose();
    setTimeout(action, DURATION);
  };
  const toTab = (screen) => go(() => navigation.navigate('MainTabs', { screen }));
  const toScreen = (screen) => go(() => navigation.navigate(screen));

  const sections = [
    [
      { Icon: Home, label: 'Asosiy', onPress: toTab('HomeTab') },
      isDriver
        ? { Icon: Search, label: 'Mos yuklar', onPress: toTab('MatchingTab') }
        : { Icon: PackagePlus, label: 'Yuk joylash', onPress: toTab('PostCargoTab') },
      {
        Icon: isDriver ? Truck : Package,
        label: isDriver ? 'Reyslarim' : 'Buyurtmalarim',
        onPress: toTab('OrdersTab'),
      },
      { Icon: MapPin, label: 'Yukni kuzatish', onPress: toScreen('Tracking') },
      { Icon: Star, label: 'Sharhlarim', onPress: toScreen('Reviews') },
    ],
    [
      { Icon: User, label: 'Profil', onPress: toTab('ProfileTab') },
      { Icon: Settings, label: 'Sozlamalar', onPress: toScreen('Settings') },
      { Icon: CircleHelp, label: 'Yordam', onPress: go(() => Alert.alert('Yordam', SUPPORT_TEXT)) },
    ],
  ];

  const handleLogout = go(() => {
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
  });

  if (!mounted) return null;

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-panelWidth, 0] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Menyuni yopish" />
      </Animated.View>

      <Animated.View style={[styles.panel, { width: panelWidth, transform: [{ translateX }] }]}>
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <UserAvatar uri={userAvatarUrl(user)} size={72} bordered={false} />
          <Text style={styles.name} numberOfLines={1}>{fullName(user)}</Text>
          <Text style={styles.phone}>{formatPhone(user?.phone)}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{ROLE_LABELS[role]}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
          {sections.map((items, si) => (
            <View key={si} style={si > 0 && styles.sectionBorder}>
              {items.map(({ Icon, label, onPress }) => (
                <TouchableOpacity key={label} style={styles.item} onPress={onPress} activeOpacity={0.6}>
                  <Icon color={colors.text} size={22} strokeWidth={1.8} />
                  <Text style={styles.itemLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.item} onPress={handleLogout} activeOpacity={0.6}>
            <LogOut color={colors.danger} size={22} strokeWidth={1.8} />
            <Text style={[styles.itemLabel, { color: colors.danger }]}>Chiqish</Text>
          </TouchableOpacity>
          <Text style={styles.version}>Haullix v{Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  name: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginTop: 12 },
  phone: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 4 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  roleText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  sectionBorder: { borderTopWidth: 1, borderTopColor: colors.borderSoft, marginTop: 8, paddingTop: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 22,
    height: 52,
  },
  itemLabel: { fontSize: 16, fontWeight: '500', color: colors.text },
  footer: { borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: 4 },
  version: { fontSize: 13, color: colors.textSoft, paddingHorizontal: 22, marginTop: 4 },
});
