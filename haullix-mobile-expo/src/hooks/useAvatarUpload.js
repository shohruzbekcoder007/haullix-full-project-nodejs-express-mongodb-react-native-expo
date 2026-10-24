import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { authAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AVATAR_SIZE = 400;

// Profil rasmini tanlash, kichraytirish va serverga yuklash
export default function useAvatarUpload() {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pick = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Ruxsat kerak', fromCamera
        ? 'Rasmga olish uchun kameraga ruxsat bering'
        : 'Rasm tanlash uchun galereyaga ruxsat bering');
      return;
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.length) return;

    setUploading(true);
    try {
      // ~400px JPEG (taxminan 30-60 KB) — server va trafik uchun yengil
      const image = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: AVATAR_SIZE } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const res = await authAPI.uploadAvatar(image.base64);
      await setUser(res.user);
    } catch (e) {
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    setUploading(true);
    try {
      const res = await authAPI.deleteAvatar();
      await setUser(res.user);
    } catch (e) {
      Alert.alert('Xatolik', getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const changeAvatar = () => {
    const hasAvatar = !!user?.avatarUpdatedAt;
    // Web'da kamera yo'q: rasm bo'lmasa, darhol fayl tanlash oynasi ochiladi
    if (Platform.OS === 'web' && !hasAvatar) {
      pick(false);
      return;
    }
    const actions = [
      { text: 'Galereyadan tanlash', onPress: () => pick(false) },
      ...(Platform.OS !== 'web' ? [{ text: 'Kamera bilan olish', onPress: () => pick(true) }] : []),
      ...(hasAvatar ? [{ text: "Rasmni o'chirish", style: 'destructive', onPress: remove }] : []),
    ];
    // Android ko'pi bilan 3 ta tugma ko'rsatadi: joy bo'lmasa, oyna tashqariga bosib yopiladi
    const buttons = actions.length < 3 ? [...actions, { text: 'Bekor qilish', style: 'cancel' }] : actions;
    Alert.alert('Profil rasmi', undefined, buttons, { cancelable: true });
  };

  return { changeAvatar, uploading };
}
