import { Alert } from 'react-native';

// react-native-web'da Alert.alert bo'sh funksiya. Brauzer dialoglari bilan almashtiramiz.
Alert.alert = (title, message, buttons) => {
  const text = [title, message].filter(Boolean).join('\n\n');
  const actions = (buttons || []).filter((b) => b.style !== 'cancel');

  if (actions.length === 0) {
    window.alert(text);
    return;
  }
  if (actions.length === 1 && buttons.length === 1) {
    window.alert(text);
    actions[0].onPress?.();
    return;
  }
  // Bir nechta variant bo'lsa, har birini navbat bilan so'raymiz
  for (const action of actions) {
    if (window.confirm(`${text}\n\n«${action.text}» — OK / Bekor qilish`)) {
      action.onPress?.();
      return;
    }
  }
};
