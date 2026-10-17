# Cihaz İçi TTS POC — Sherpa-ONNX

## Kapsam

Bu POC, `react-native-sherpa-onnx` üzerinde `sherpa-onnx-supertonic-3-tts-int8-2026-05-11` modelini Türkçe (`tr`) ve CPU ile internet bağlantısı olmadan çalıştırır. Cihazın yerleşik TTS motoru varsayılan seçenek olarak korunur.

İlk Piper `vits-piper-tr_TR-dfki-medium` POC'si çalışır durumda doğrulandı ancak ses kalitesi kabul edilmediği ve model lisansı ticari kullanımı kısıtladığı için uygulama paketinden kaldırıldı.

## Kullanım

1. Native bağımlılıkları kurmak için `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install` komutunu `ios/` altında çalıştırın.
2. Expo Go yerine `npm run ios` ile development build oluşturun.
3. Uygulamada **Ayarlar → Ses motoru** satırına dokunarak `Cihazın sistem sesi` ve `Supertonic 3 INT8 Türkçe` arasında geçiş yapın.

Yerel `withOfflineTtsAssets` config plugin'i `assets/models` dizinini iOS uygulama paketindeki `models/` dizinine kopyalar. `ios/` yeniden üretildiğinde model kaynak ayarı bu nedenle kaybolmaz. `expo-asset` yalnızca desteklenen tekil varlık türlerini işler; çok dosyalı ONNX model klasörü için kullanılmaz.

## Devre dışı bırakma ve fallback

```bash
EXPO_PUBLIC_ENABLE_ON_DEVICE_TTS=false npm run ios
```

Bu bayrak deneysel seçeneği arayüzden ve runtime seçiminden kapatır; cihaz TTS'i varsayılan kalır. Offline motor başlatılamaz veya streaming sırasında hata verirse mevcut dinleme cihaz TTS'i ile devam eder ve kalıcı tercih de cihaz motoruna alınır.

Bayrak model ve native kütüphaneyi derlenen binary'den fiziksel olarak çıkarmaz. Production boyutunu küçültmek için karar kapısında bağımlılığı/model asset'ini hariç tutan ayrı build profili veya sonradan model indirme yaklaşımı uygulanmalıdır.

## Lisans uyarısı

Supertonic örnek/entegrasyon kodu MIT, model ağırlıkları **OpenRAIL-M** lisanslıdır. OpenRAIL-M kullanım kısıtları ve dağıtım yükümlülükleri production kararı öncesinde hukuk incelemesinden geçmelidir.

Modelle birlikte resmi `LICENSE` ve `README.md` dosyaları `assets/models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11/` altında tutulur.

## Bilinen sınırlar

- Native modül nedeniyle Expo Go desteklenmez.
- Paketlenen model klasörü yaklaşık 139 MB'dir ve uygulama boyutunu belirgin artırır.
- Supertonic/Sherpa akışı gerçek kelime sınırı üretmez. Production kelime vurgusu için zorunlu hizalama modeli veya motorun sağladığı gerçek zaman damgaları kullanılmalıdır.
- Gerçek iPhone/Android üzerinde gecikme, RAM, CPU, pil ve uzun metin kabul testleri henüz yapılmamıştır.
- Supertonic kabul testinden sonra OpenAI benzeri bulut TTS sağlayıcıları backend üzerinden karşılaştırılacaktır; API anahtarları mobil uygulamaya konulmaz.
