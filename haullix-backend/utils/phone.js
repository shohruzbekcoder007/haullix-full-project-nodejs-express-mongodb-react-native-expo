// Telefon raqamni yagona formatga keltirish: "+998 90 123 45 67" -> "+998901234567"
exports.normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits}`;
};

exports.isValidUzPhone = (phone) => /^\+998\d{9}$/.test(phone);
