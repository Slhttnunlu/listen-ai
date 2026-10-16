# Listen AI

Yerel cihazın Text-to-Speech motoruyla çalışan, API anahtarı gerektirmeyen ilk MVP.

## Çalıştırma

```bash
npm install
npm run start -- --clear
```

Expo Go SDK 57 ile uyumludur. Daha önce açık bir Expo sunucusu varsa önce `Ctrl+C` ile kapatın; ardından yukarıdaki komutla önbelleği temizleyerek yeniden başlatın. Expo Go ile ekrandaki QR kodu okutun veya iOS/Android simülatörü açın.

## iOS Simulator UI testleri

E2E testleri [Maestro](https://maestro.mobile.dev/) ile `.maestro/` altında tutulur. Akışlar, metin girme → oynatmayı başlatma → hızı değiştirme → durdurma ile kütüphane sekmesine geçişi kapsar.

Önce Metro'yu bir terminalde çalıştırın:

```bash
npm run start -- --port 8082 --clear
```

Ardından Expo Go yüklü iOS Simulator için diğer terminalde testleri çalıştırın:

```bash
maestro --device <SIMULATOR_UDID> test \
  --env APP_ID=host.exp.Exponent \
  --env APP_URL=exp://127.0.0.1:8082 \
  .maestro
```

`<SIMULATOR_UDID>` değerini `xcrun simctl list devices available` ile görebilirsiniz. Native development build veya EAS simulator build kullanıldığında `APP_ID` uygulamanın bundle identifier'ı (`com.slhttnunlu.listenai`) ve `APP_URL` ilgili development URL'i olmalıdır.

Paketleme kontrolü:

```bash
npm run test:export:ios
```

## MVP kapsamı

- Metin yapıştırma ve düzenleme
- Cihazdaki Türkçe sesleri seçme
- 0.75×–1.5× hız kontrolü
- Başlatma, hız değiştirme ve durdurma

Bulut TTS (OpenAI veya ElevenLabs), PDF/içerik içe aktarma, hesap ve kayıtlı kütüphane sonraki aşamalardır. API anahtarları mobil uygulamaya eklenmemelidir; bu özellikler için bir backend kullanılmalıdır.
