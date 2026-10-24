const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

// "+998901234567" -> "+998 90 123 45 67"
export const formatPhone = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length !== 12) return phone || '';
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
};

// Mahalliy raqam kiritishda: "901234567" -> "90 123 45 67"
export const formatLocalPhone = (digits) => {
  const d = digits.slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
};

// 4800000 -> "4 800 000"
export const formatMoney = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatSum = (value) => (value ? `${formatMoney(value)} so'm` : '—');

export const pad2 = (n) => String(n).padStart(2, '0');

// Date -> "24/10/2026"
export const formatDateInput = (date) =>
  `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;

// Date -> "24-oktabr"
export const formatDayMonth = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`;
};

export const formatTime = (date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

export const fullName = (user) => `${user?.lastName || ''} ${user?.firstName || ''}`.trim();

// Yetkazib berish jarayoni: foiz va qolgan vaqt matni
export const getDeliveryProgress = (order) => {
  if (!order) return { percent: 0, remaining: '' };
  if (order.status === 'completed') return { percent: 100, remaining: 'Yetkazib berildi' };
  if (order.status !== 'in_transit') return { percent: 0, remaining: '' };

  const start = new Date(order.acceptedAt || order.createdAt).getTime();
  const end = new Date(order.deliveryDate);
  end.setHours(18, 0, 0, 0);
  const now = Date.now();
  const total = end.getTime() - start;
  const percent = total > 0 ? Math.round(((now - start) / total) * 100) : 90;

  const hoursLeft = Math.ceil((end.getTime() - now) / 3600000);
  let remaining;
  if (hoursLeft <= 0) remaining = 'Belgilangan vaqt o\'tdi';
  else if (hoursLeft < 24) remaining = `Taxminan ${hoursLeft} soat qoldi`;
  else remaining = `Taxminan ${Math.ceil(hoursLeft / 24)} kun qoldi`;

  return { percent: Math.max(5, Math.min(95, percent)), remaining };
};
