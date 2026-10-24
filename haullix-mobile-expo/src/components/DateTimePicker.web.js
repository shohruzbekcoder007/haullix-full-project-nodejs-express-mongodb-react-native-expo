import React from 'react';
import { pad2 } from '../utils/format';

// Web'da native picker yo'q: brauzerning <input type="date|time"> elementi ishlatiladi
export default function DateTimePicker({ value, mode = 'date', minimumDate, onChange }) {
  const toInput = (d) => (mode === 'time'
    ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    : `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);

  const handleChange = (e) => {
    if (!e.target.value) return;
    const next = new Date(value);
    if (mode === 'time') {
      const [h, m] = e.target.value.split(':').map(Number);
      next.setHours(h, m, 0, 0);
    } else {
      const [y, mo, d] = e.target.value.split('-').map(Number);
      next.setFullYear(y, mo - 1, d);
    }
    onChange({ type: 'set' }, next);
  };

  // Bo'sh ochiladi: foydalanuvchi aniq tanlaganda onChange ishlaydi.
  // Brauzer kalendarini darhol ochamiz (showPicker eski brauzerlarda bo'lmasligi mumkin).
  const openOnMount = (el) => {
    if (!el || el.dataset.opened) return;
    el.dataset.opened = '1';
    el.focus();
    try { el.showPicker?.(); } catch (e) {}
  };

  return React.createElement('input', {
    ref: openOnMount,
    type: mode === 'time' ? 'time' : 'date',
    min: minimumDate && mode !== 'time' ? toInput(minimumDate) : undefined,
    onChange: handleChange,
    style: { marginTop: 8, padding: 10, fontSize: 16, borderRadius: 10, border: '1.5px solid #9ca3af' },
  });
}
