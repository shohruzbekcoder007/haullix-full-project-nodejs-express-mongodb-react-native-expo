import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CircleHelp, Package, Settings } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import useAvatarUpload from '../hooks/useAvatarUpload';
import { avatarUrl } from '../services/api';
import { UserAvatar } from '../components/ui';
import { formatPhone, fullName } from '../utils/format';
import { colors } from '../theme';

export const SUPPORT_TEXT = "Qo'llab-quvvatlash xizmati:\nTel: +998 71 200 00 00\nTelegram: @haullix_support";

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const { changeAvatar, uploading } = useAvatarUpload();

  const actions = [
    { label: 'Yordam', Icon: CircleHelp, onPress: () => Alert.alert('Yordam', SUPPORT_TEXT) },
    { label: 'Buyurtmalarim', Icon: Package, onPress: () => navigation.navigate('OrdersTab') },
    { label: 'Sozlamalar', Icon: Settings, onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={changeAvatar}
          disabled={uploading}
          activeOpacity={0.85}
          accessibilityLabel="Profil rasmini o'zgartirish"
        >
          <UserAvatar uri={avatarUrl(user?._id, user?.avatarUpdatedAt)} size={150} />
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
  container: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 72, paddingBottom: 32 },
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
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 36, alignSelf: 'stretch' },
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
