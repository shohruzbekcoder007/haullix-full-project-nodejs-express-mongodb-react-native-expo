export const colors = {
  primary: '#168039',
  primaryDark: '#116a2f',
  primarySoft: '#e8f3ec',
  text: '#111827',
  textMuted: '#4b5563',
  textSoft: '#6b7280',
  placeholder: '#6b7280',
  border: '#9ca3af',
  borderSoft: '#e5e7eb',
  surface: '#f3f4f6',
  background: '#ffffff',
  danger: '#dc2626',
  star: '#f59e0b',
  starStroke: '#b45309',
  dark: '#111827',
};

export const ROLE_LABELS = {
  cargo_owner: 'Yuk egasi',
  driver: 'Haydovchi',
};

export const STATUS_INFO = {
  active: { label: 'Haydovchi kutilmoqda', color: '#b45309', bg: '#fef3c7' },
  in_transit: { label: 'Yetkazib berilyapti', color: colors.primary, bg: colors.primarySoft },
  completed: { label: 'Yetkazildi', color: '#1d4ed8', bg: '#dbeafe' },
  cancelled: { label: 'Bekor qilindi', color: colors.danger, bg: '#fee2e2' },
};
