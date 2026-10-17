# Cihaz İçi TTS POC — Sherpa-ONNX

## Kapsam

Bu POC, `react-native-sherpa-onnx` üzerinde Piper'ın `vits-piper-tr_TR-dfki-medium` Türkçe modelini CPU ile ve internet bağlantısı olmadan çalıştırır. Ses native PCM player'a parça parça gönderilir. Cihazın yerleşik TTS motoru varsayılan seçenek olarak korunur.

## Kullanım

1. Native bağımlılıkları kurmak için `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install` komutunu `ios/` altında çalıştırın.
2. Expo Go yerine `npm run ios` ile development build oluşturun.
3. Uygulamada **Ayarlar → Ses motoru** satırına dokunarak `Cihazın sistem sesi` ve `Offline Türkçe (Deneysel)` arasında geçiş yapın.

Yerel `withOfflineTtsAssets` config plugin'i `assets/models` dizinini iOS uygulama paketindeki `models/` dizinine kopyalar. `ios/` yeniden üretildiğinde model kaynak ayarı bu nedenle kaybolmaz. `expo-asset` yalnızca desteklenen tekil varlık türlerini işler; çok dosyalı ONNX model klasörü için kullanılmaz.

## Devre dışı bırakma ve fallback

```bash
EXPO_PUBLIC_ENABLE_ON_DEVICE_TTS=false npm run ios
```

Bu bayrak deneysel seçeneği arayüzden ve runtime seçiminden kapatır; cihaz TTS'i varsayılan kalır. Offline motor başlatılamaz veya streaming sırasında hata verirse mevcut dinleme cihaz TTS'i ile devam eder ve kalıcı tercih de cihaz motoruna alınır.

Bayrak model ve native kütüphaneyi derlenen binary'den fiziksel olarak çıkarmaz. Production boyutunu küçültmek için karar kapısında bağımlılığı/model asset'ini hariç tutan ayrı build profili veya sonradan model indirme yaklaşımı uygulanmalıdır.

## Lisans uyarısı

Kullanılan DFKI Türkçe modelinin model kartı eğitim verisini **CC BY-NC-SA 4.0** olarak belirtir. Bu nedenle bu model yalnızca teknik POC içindir; ücretli veya ticari production sürümünde kullanılamaz. Production öncesinde ticari kullanıma uygun bir Türkçe model seçilmeli ve kod, ağırlıklar, eğitim verisi ile üçüncü taraf native lisansları hukuk incelemesinden geçmelidir.

Modelle birlikte kaynak model kartı `assets/models/vits-piper-tr_TR-dfki-medium/MODEL_CARD` altında tutulur.

## Bilinen sınırlar

- Native modül nedeniyle Expo Go desteklenmez.
- Model paketi yaklaşık 79 MB'dir ve uygulama boyutunu belirgin artırır.
- Mevcut kelime vurgulama `expo-speech` boundary olaylarına dayanır. Bu ilk offline streaming POC gerçek kelime zaman damgası üretmediğinden Sherpa sesi seçiliyken sarı kelime takibi yoktur. İkinci iterasyonda Sherpa alignment modeli veya güvenilir zamanlama eşlemesi gerekir.
- Gerçek iPhone/Android üzerinde gecikme, RAM, CPU, pil ve uzun metin kabul testleri henüz yapılmamıştır.
- Bu makinedeki Swift 6.0, Expo 57'nin `ExpoModulesJSI` Swift tools 6.2 gereksinimini karşılamıyor. Native Simulator build'i için Swift 6.2 sağlayan güncel Xcode gereklidir.
