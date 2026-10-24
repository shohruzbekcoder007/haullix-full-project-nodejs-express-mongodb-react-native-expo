import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
  Modal, FlatList, Pressable, Image,
} from 'react-native';
import Svg, { Rect, Circle, Ellipse, ClipPath, Defs, G } from 'react-native-svg';
import { ArrowLeft, Menu, X } from 'lucide-react-native';
import { colors } from '../theme';

// Yuqoridagi orqaga / menyu / yopish tugmalari. right — o'ng tomondagi ixtiyoriy element
export function TopBar({ onBack, onMenu, onClose, right, color = colors.text, style }) {
  let left = <View />;
  if (onBack) {
    left = (
      <TouchableOpacity onPress={onBack} hitSlop={12} accessibilityLabel="Orqaga">
        <ArrowLeft color={color} size={26} strokeWidth={2} />
      </TouchableOpacity>
    );
  } else if (onMenu) {
    left = (
      <TouchableOpacity onPress={onMenu} hitSlop={12} accessibilityLabel="Menyu">
        <Menu color={color} size={26} strokeWidth={2} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.topBar, style]}>
      {left}
      {right}
      {onClose ? (
        <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityLabel="Yopish">
          <X color={color} size={26} strokeWidth={2} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ScreenTitle({ children, style }) {
  return <Text style={[styles.screenTitle, style]}>{children}</Text>;
}

export function Label({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

// Kiritish maydoni: o'ng tomonda birlik (m³, so'm) yoki ikonka bo'lishi mumkin.
// onPress berilsa, maydon tanlash tugmasi sifatida ishlaydi (sana, vaqt, ro'yxat).
export function Field({ value, placeholder, suffix, icon, onPress, style, inputStyle, ...inputProps }) {
  const right = suffix ? <Text style={styles.suffix}>{suffix}</Text> : icon;

  if (onPress) {
    return (
      <TouchableOpacity style={[styles.field, style]} onPress={onPress} activeOpacity={0.7}>
        <Text
          style={[styles.fieldText, !value && styles.fieldPlaceholder, inputStyle]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        {right}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.field, inputProps.multiline && styles.fieldMultiline, style]}>
      <TextInput
        style={[styles.fieldInput, inputProps.multiline && styles.fieldInputMultiline, inputStyle]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        {...inputProps}
      />
      {right}
    </View>
  );
}

export function PrimaryButton({ title, onPress, loading, disabled, icon, style }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, (disabled || loading) && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <View style={styles.btnRow}>
          {icon}
          <Text style={styles.primaryBtnText}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress, loading, color = colors.primary, style }) {
  return (
    <TouchableOpacity
      style={[styles.secondaryBtn, { borderColor: color }, loading && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? <ActivityIndicator color={color} /> : (
        <Text style={[styles.secondaryBtnText, { color }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// Ikki variantli tanlov (Haydovchi / Yuk egasi)
export function ChoiceRow({ options, value, onChange }) {
  return (
    <View style={styles.choiceRow}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.choice, active && styles.choiceActive]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.choiceText, active && styles.choiceTextActive]} numberOfLines={1}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// O'zbekiston bayrog'i
export function UzFlag({ width = 44 }) {
  const height = width / 2;
  return (
    <Svg width={width} height={height} viewBox="0 0 250 125">
      <Rect width="250" height="125" fill="#ffffff" />
      <Rect width="250" height="40" fill="#0099b5" />
      <Rect y="85" width="250" height="40" fill="#1eb53a" />
      <Rect y="40" width="250" height="3" fill="#ce1126" />
      <Rect y="82" width="250" height="3" fill="#ce1126" />
      <Circle cx="30" cy="20" r="14" fill="#ffffff" />
      <Circle cx="35" cy="20" r="12.5" fill="#0099b5" />
      {[0, 1, 2, 3].map((col) =>
        [0, 1, 2].map((row) =>
          row === 0 && col < 2 ? null : (
            <Circle key={`${col}-${row}`} cx={55 + col * 10} cy={10 + row * 10} r="2.6" fill="#ffffff" />
          )
        )
      )}
    </Svg>
  );
}

// Profil rasmi o'rniga kulrang siluet
export function AvatarPlaceholder({ size = 110, bordered = true }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="avatarClip">
          <Circle cx="50" cy="50" r="48" />
        </ClipPath>
      </Defs>
      <Circle cx="50" cy="50" r="49" fill="#e5e7eb" stroke={bordered ? colors.border : 'none'} strokeWidth="1.5" />
      <G clipPath="url(#avatarClip)">
        <Circle cx="50" cy="42" r="15" fill="#6b7280" />
        <Ellipse cx="50" cy="94" rx="29" ry="25" fill="#6b7280" />
      </G>
    </Svg>
  );
}

// Foydalanuvchi rasmi. Rasm yo'q yoki yuklanmasa, kulrang siluet ko'rsatiladi
export function UserAvatar({ uri, size = 110, bordered = true }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);

  if (!uri || failed) return <AvatarPlaceholder size={size} bordered={bordered} />;
  return (
    <Image
      source={{ uri }}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#e5e7eb',
        borderWidth: bordered ? 1.5 : 0,
        borderColor: colors.border,
      }}
    />
  );
}

// Pastdan ochiladigan ro'yxatdan tanlash oynasi. allowCustom bo'lsa, o'z qiymatini yozish mumkin.
export function PickerModal({ visible, title, options, onSelect, onClose, allowCustom, searchPlaceholder }) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const filtered = trimmed
    ? options.filter((o) => o.toLowerCase().includes(trimmed.toLowerCase()))
    : options;
  const showCustom = allowCustom && trimmed && !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  const choose = (item) => {
    setQuery('');
    onSelect(item);
  };
  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.modalBackdrop} onPress={close} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={close} hitSlop={12}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
        {allowCustom ? (
          <Field
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder || 'Qidirish yoki yozish'}
            style={{ marginBottom: 8 }}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              // Enter: yozilgan qiymatni yoki yagona mos variantni tanlash
              if (showCustom) choose(trimmed);
              else if (filtered.length === 1) choose(filtered[0]);
            }}
          />
        ) : null}
        <FlatList
          data={showCustom ? [trimmed, ...filtered] : filtered}
          keyExtractor={(item, idx) => `${item}-${idx}`}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.modalItem} onPress={() => choose(item)}>
              <Text style={styles.modalItemText}>
                {showCustom && index === 0 ? `«${item}» ni tanlash` : item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 54,
    backgroundColor: colors.background,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    minHeight: 110,
    paddingVertical: 10,
  },
  fieldInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    color: colors.text,
    paddingVertical: 12,
  },
  fieldInputMultiline: {
    textAlignVertical: 'top',
    minHeight: 88,
  },
  fieldText: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  fieldPlaceholder: {
    fontWeight: '400',
    color: colors.placeholder,
  },
  suffix: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    marginLeft: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.7 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primaryBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginTop: 12,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700' },
  choiceRow: { flexDirection: 'row', gap: 12 },
  choice: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: colors.background,
  },
  choiceActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { fontSize: 15, fontWeight: '600', color: colors.text },
  choiceTextActive: { color: '#ffffff', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: {
    maxHeight: '70%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 19, fontWeight: '700', color: colors.text },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  modalItemText: { fontSize: 16, color: colors.text },
});
