# Listen AI — Geliştirme Talimatları

## Ürün amacı

Listen AI, Türkçe metinleri erişilebilir ve sakin bir deneyimle dinletir. İlk hedef; not, makale ve dokümanlarını dinlemek isteyen bireysel kullanıcılardır.

Öncelik sırası:

1. Metin yaz/yapıştır ve kaliteli oynatma deneyimi
2. Yerel kütüphane, ilerleme ve kaldığı yerden devam
3. Doküman içe aktarma
4. Kamera ile OCR
5. Bulut TTS ve AI özetleme
6. Podcast ve e-posta entegrasyonları

`TASKS.md`, ürün işlerinin kaynak planıdır. Büyük bir işe başlamadan önce ilgili işi alt görevlere ayır ve durumunu güncelle.

## Tasarım ve kullanıcı deneyimi

- Görsel dil: açık arka plan, açık yeşil hero alanı, sarı ana aksiyon rengi, beyaz kartlar ve geniş yuvarlatılmış köşeler.
- Yeni ekranlar Ana Sayfa, Kütüphanem ve Ayarlar ile tipografi, aralık, renk ve gezinme bakımından tutarlı olmalı.
- Metinler sade, doğal Türkçe ve kullanıcıya yönelik olmalı.
- Çalışmayan veya henüz geliştirilmemiş bir özelliği çalışıyormuş gibi gösterme. Açık bir “Yakında” durumu kullan.
- Oynatma sırasında aktif kelime, aynı metin alanında vurgulanır. Oynatma açıkken metin düzenlenmez; durdurulduğunda tekrar düzenlenebilir olur.
- Boş, yükleniyor, izin reddedildi ve hata durumları her yeni kullanıcı akışında tasarlanmalıdır.
- Erişilebilirlik: etkileşimli elemanlarda erişilebilir ad/rol kullan; yeterli kontrast ve büyük metin görünümünü kontrol et.

## Mimari ve kod organizasyonu

Mevcut MVP tek dosyada başlayabilir; yeni iş eklerken `App.js` dosyasını büyütme. İlk uygun refaktörde aşağıdaki yapıya geç:

```text
src/
  components/     # Tekrar kullanılabilir, ekrandan bağımsız UI bileşenleri
  screens/        # Ana Sayfa, Kütüphane, Ayarlar, Dinleyici gibi ekranlar
  services/       # TTS, dosya seçme, depolama ve backend istemcileri
  hooks/          # useSpeech, useLibrary gibi durum/yan etki hook'ları
  storage/        # Yerel veri modelleri ve kalıcı depolama işlemleri
  utils/          # Saf metin, tarih ve süre yardımcıları
  constants/      # Renk, aralık, metin ve yapılandırma sabitleri
  __tests__/      # Birim ve bileşen testleri
```

- React sınıf bileşeni kullanma; fonksiyonel bileşen ve hook kullan.
- Bir bileşen tek bir sorumluluğa sahip olmalı. Ekran, veri erişimi veya ses motoru ayrıntılarını doğrudan taşımamalı.
- TTS, dosya işlemleri, OCR ve API çağrılarını `services/` altında soyutla. Ekranlar yalnızca servislerin açık arayüzünü kullanmalı.
- Uygulama durumunu mümkün olduğunca ekrana yakın tut. Birden çok ekranın kullandığı durum için önce özel hook/context değerlendir; gereksiz global state kütüphanesi ekleme.
- Renk, boşluk ve tekrar eden metinleri bileşen içine dağınık yazma; ortak sabitlere taşı.
- Karmaşık veya yan etkili fonksiyonlar kısa ve test edilebilir olmalı. Bir fonksiyon hem veri dönüştürüp hem ağ çağrısı yapıp hem UI durumunu değiştirmemeli.
- Yeni bağımlılık eklemeden önce iOS/Android uyumu, Expo SDK 57 uyumu, bakım durumu ve paketin neden gerekli olduğu kontrol edilir.
- Büyük refaktörlerde davranışı değiştirmeden önce küçük adımlara böl; mevcut kullanıcı akışını koru.

## TTS ve veri kuralları

- Türkçe sesleri önceliklendir; ses yoksa anlaşılır bir boş/hata durumu göster.
- Kelime vurgusu, TTS motorunun kelime sınırı olaylarına dayanır; tahmine dayalı zamanlayıcı kullanma.
- Uzun içeriklerde performans, kaydırma, metin bölme ve bellek kullanımı düşünülmeden özellik ekleme.
- API anahtarları mobil uygulamaya asla eklenmez. OpenAI, ElevenLabs, OAuth ve benzeri gizli anahtarlar yalnızca backend ortam değişkenlerinde tutulur.
- Kullanıcı metni, belge ve e-posta verisi için açık izin akışı tasarla; gerekli değilse saklama.
- Mail, Drive veya bulut AI özelliği backend, kullanıcı kimliği, kota ve hata izleme olmadan eklenmez.

## Test ve doğrulama

Her kod değişikliğinde, ilgili değişikliğe uygun kontroller yapılmalıdır:

1. Kodun değiştirdiği akışı Expo Go üzerinde iOS veya Android'de elle dene.
2. Paketleme kontrolünü çalıştır:

   ```bash
   npx expo export --platform ios --output-dir /tmp/listen-ai-export
   ```

3. Yeni saf yardımcı fonksiyon, veri dönüştürme veya hata düzeltmesi için birim testi ekle.
4. Yeni ekran/bileşen için en az bir temel render/etkileşim testi ekle; test altyapısı yoksa bu işi aynı değişiklikte kur veya `TASKS.md`'ye açık teknik borç olarak yaz.
5. TTS değişikliklerinde en az şunları doğrula: boş metin, Türkçe ses seçimi, başlat/durdur, bitiş durumu ve aktif kelime vurgusu.
6. Dosya, kamera, mail veya ağ özelliğinde izin reddi, bağlantı hatası, boş sonuç ve uzun içerik senaryolarını test et.

Test veya paketleme başarısızsa değişikliği tamamlandı diye raporlama. Hatanın nedenini ve eksik doğrulamayı açıkça belirt.

## Çalışma biçimi

- Önce mevcut kodu ve `TASKS.md`yi incele, sonra en küçük anlamlı değişikliği yap.
- Üretim etkisi olan servis, backend, OAuth, ödeme veya kullanıcı verisi değişikliklerinde kapsamı ve varsayımları belirt.
- `npm audit fix --force`, bağımlılık yükseltmeleri, veri silme veya toplu dosya değişikliklerini otomatik yapma.
- Expo SDK 57 uyumluluğunu koru. Expo Go ile sorun yaşanırsa önce SDK ve paket sürümlerini doğrula.
- Değişiklik sonunda neyin çalıştığını, hangi dosyaların değiştiğini ve hangi testlerin yapıldığını kısa biçimde raporla.
