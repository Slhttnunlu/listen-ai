# Kalite ve Performans Hedefleri

## Performans bütçeleri

- Soğuk açılışta ana ekranın kullanılabilir hale gelmesi: desteklenen orta sınıf cihazda p95 ≤ 2,5 saniye.
- **Kaydet ve Dinle** sonrasında ilk sesin başlaması: cihaz TTS sesi hazırsa p95 ≤ 1,5 saniye.
- 100.000 karakterlik metinde editör ve oynatıcı kaydırması: kullanıcı tarafından fark edilen uzun blokaj olmamalı; hedef kare süresi p95 ≤ 32 ms.
- Yerel kütüphanede 1.000 kayıtla arama/filtre sonucu: ≤ 300 ms.
- Uygulamanın bellek kullanımı, 100.000 karakter metin açıldığında başlangıç değerinin 2 katını aşmamalı.

Bu değerler release build üzerinde gerçek cihazla ölçülür. Hedef aşılıyorsa uzun metinleri parçalara ayırma ve liste sanallaştırma task'ı açılır.

## Test verisi sınıfları

- Türkçe karakterler: `çğıöşü ÇĞİÖŞÜ`.
- Emoji ve birleşik karakterler: `🎧 👨‍👩‍👧‍👦 ✅`.
- Windows ve Unix satır sonları: `\r\n`, `\n`.
- Noktalama işaretleri, URL, sayı ve kısaltmalar.
- Boş/yalnızca whitespace içerik.
- 100.000 karakterlik uzun metin.
- Boşluksuz 2.000 karakterlik tek kelime.
- UTF-8 BOM içeren TXT.
- 2 MB sınırında ve sınırı geçen TXT.
- Türkçe karakter, tablo hücresi ve birden çok paragraf içeren DOCX.
- Bozuk/parola korumalı, boş ve 10 MB sınırını geçen DOCX.

## Release kalite kapısı

```bash
npm ci
npm run lint
npm run format:check
npm test
npm run test:export:ios
```

Tüm adımlar geçmeden release adayı oluşturulmaz.
