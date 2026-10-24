import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, TOKEN_KEY } from '../services/api';

const USER_KEY = 'auth_user';
// Eski versiyadan qolgan kalitlar (chiqishda tozalanadi)
const LEGACY_KEYS = ['user_phone', 'user_name', 'user_role'];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);

  const setUser = useCallback(async (nextUser) => {
    setUserState(nextUser);
    if (nextUser) await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const signIn = useCallback(async (token, nextUser) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await setUser(nextUser);
  }, [setUser]);

  const signOut = useCallback(async () => {
    setUserState(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, ...LEGACY_KEYS]);
  }, []);

  // Ilova ochilganda sessiyani tiklash.
  // Natija: 'signed_in' | 'profile_required' | 'signed_out'
  const restore = useCallback(async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return 'signed_out';

    try {
      const res = await authAPI.getProfile();
      await setUser(res.user);
      return 'signed_in';
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        await signOut();
        return 'signed_out';
      }
      if (status === 403 && e.response.data?.code === 'PROFILE_REQUIRED') {
        return 'profile_required';
      }
      // Tarmoq xatosi: saqlangan profil bilan davom etamiz
      const cached = await AsyncStorage.getItem(USER_KEY);
      if (cached) {
        setUserState(JSON.parse(cached));
        return 'signed_in';
      }
      return 'signed_out';
    }
  }, [setUser, signOut]);

  const value = useMemo(
    () => ({ user, role: user?.role === 'driver' ? 'driver' : 'cargo_owner', setUser, signIn, signOut, restore }),
    [user, setUser, signIn, signOut, restore]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
