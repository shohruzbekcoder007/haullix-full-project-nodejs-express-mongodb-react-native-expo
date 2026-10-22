# HAULLIX - React Native Expo Mobile App

Ushbu loyiha yuk mashinalari haydovchilari, yuk egalari va logistika korxonalari uchun O'zbekistonda aqlli qaytish yuklari, buyurtmalar, radar va jarimalar monitoringi ilovasidir.

---

## 🚀 1. Loyihani o'rnatish va kompyuterda ishga tushirish

```bash
# 1. Mobil papkaga o'ting
cd mobile

# 2. Bog'liqliklarni o'rnating
npm install

# 3. Expo serverini ishga tushiring
npx expo start
```

---

## 📱 2. Android APK Fayl generatsiya qilish (Expo EAS Build)

To'g'ridan-to'g'ri Android telefonlarga o'rnatiladigan `.apk` faylini chiqarish uchun quyidagi qadamlarni bajaring:

```bash
# 1. EAS CLI ni global o'rnating (agar o'rnatilmagan bo'lsa)
npm install -g eas-cli

# 2. Expo hisobingizga kiring (bepul hisob: expo.dev)
eas login

# 3. EAS loyihani konfiguratsiya qiling
eas build:configure

# 4. Standalone APK yaratish buyrug'ini bering:
eas build -p android --profile preview
```

> 💡 **Eslatma:** Bir necha daqiqada Expo bulutida `.apk` fayl tayyor bo'ladi va sizga to'g'ridan-to'g'ri yuklab olish havolasi (link) hamda QR kod beriladi!
