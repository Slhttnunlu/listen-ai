# Listen AI

Yerel cihazın Text-to-Speech motoruyla çalışan, API anahtarı gerektirmeyen ilk MVP.

## Çalıştırma

```bash
npm install
npm run start -- --clear
```

Expo Go SDK 57 ile uyumludur. Daha önce açık bir Expo sunucusu varsa önce `Ctrl+C` ile kapatın; ardından yukarıdaki komutla önbelleği temizleyerek yeniden başlatın. Expo Go ile ekrandaki QR kodu okutun veya iOS/Android simülatörü açın.

## MVP kapsamı

- Metin yapıştırma ve düzenleme
- Cihazdaki Türkçe sesleri seçme
- 0.75×–1.5× hız kontrolü
- Başlatma ve durdurma

Bulut TTS (OpenAI veya ElevenLabs), PDF/içerik içe aktarma, hesap ve kayıtlı kütüphane sonraki aşamalardır. API anahtarları mobil uygulamaya eklenmemelidir; bu özellikler için bir backend kullanılmalıdır.
