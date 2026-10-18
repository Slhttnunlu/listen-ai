# Listen AI

Yerel cihazın Text-to-Speech motoruyla çalışan, API anahtarı gerektirmeyen ilk MVP.

## Çalıştırma

```bash
npm install
npm run start -- --clear
```

Expo Go SDK 57 ile uyumludur. Daha önce açık bir Expo sunucusu varsa önce `Ctrl+C` ile kapatın; ardından yukarıdaki komutla önbelleği temizleyerek yeniden başlatın. Expo Go ile ekrandaki QR kodu okutun veya iOS/Android simülatörü açın.

Çevrimdışı kullanımda cihazın sistem TTS'i kullanılır. Geliştirme ortamında MacBook üzerinde çalışan Chatterbox servisi [`local-tts-server/README.md`](local-tts-server/README.md) adımlarıyla isteğe bağlı olarak kullanılabilir.

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

## Kod kalite kontrolleri

Pull request veya `main` push'unda GitHub Actions şu kontrolleri çalıştırır:

```bash
npm run lint
npm run format:check
npm test
npm run test:export:ios
```

Projede Expo SDK 57'nin desteklediği Node sürümleri kullanılmalıdır. Önerilen yerel sürüm Node `22.13+` LTS'dir.

## MVP kapsamı

- Metin yapıştırma ve düzenleme
- Cihazdaki Türkçe sesleri seçme
- 0.75×–1.5× hız kontrolü
- Başlatma, hız değiştirme ve durdurma

Bulut TTS (OpenAI veya Google Gemini) ve kullanıcı hesabı sonraki aşamalardır. Dijital PDF metin çıkarma native development build gerektirir; taranmış PDF'ler için OCR akışı henüz kullanıma açılmamıştır. API anahtarları mobil uygulamaya eklenmemelidir; bu özellikler için bir backend kullanılmalıdır.

Yerel/çevrimdışı sınır ile gelecekteki backend bileşenleri [hedef mimari](docs/ARCHITECTURE.md) belgesinde tanımlanmıştır.

Kapalı beta yayınlarında [sürüm ve geri alma operasyonu](docs/RELEASE_OPERATIONS.md) izlenir. Yerel ve gelecekteki bulut verisi için kurtarma sınırları [yedekleme ve geri yükleme tasarımında](docs/BACKUP_RECOVERY.md) açıklanır.

Beta geri bildirimleri ve haftalık ürün değerlendirmesi [kapalı beta geri bildirim sürecinde](docs/BETA_FEEDBACK.md) yönetilir.

Gelecekteki bulut TTS denemeleri [sağlayıcı dayanıklılığı ve maliyet sınırlarına](docs/TTS_PROVIDER_RELIABILITY.md), telemetry kurulumu ise [gözlemlenebilirlik ve alarm sözleşmesine](docs/OBSERVABILITY.md) uymalıdır.

Ücretsiz kapalı beta kapsamı ile gelecekteki Pro açılış kapıları [freemium sınırları](docs/FREEMIUM.md) belgesinde tanımlanmıştır.

TTS sağlayıcılarının kontrollü açılması, acil kapatılması ve deney yaşam döngüsü [feature flag sözleşmesinde](docs/FEATURE_FLAGS.md) tanımlanır.
