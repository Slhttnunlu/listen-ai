# Listen AI — Ürün görevleri

## 1. Metin Yaz veya Yapıştır — MVP önceliği

- [ ] Metni başlıkla kaydetme ve kütüphaneye ekleme
- [ ] Kalıcı yerel depolama
- [ ] Oynat/duraklat, dinleme yüzdesi ve kaldığı yerden devam
- [x] Okunan kelimeyi ses motoru sınır olaylarıyla vurgulama
- [ ] Arka plan oynatma ve kilit ekranı kontrolleri

**Zorluk:** Orta. İlk yayın için en değerli, API gerektirmeyen özellik.

## 2. Kütüphanem

- [ ] Devam eden, tamamlanan ve favori filtrelerini gerçek veriye bağlama
- [ ] Arama, sıralama, yeniden adlandırma ve geri alınabilir silme
- [ ] Kartlarda süre, kaynak türü ve ilerleme gösterimi

**Zorluk:** Orta. Metin kaydetme ile birlikte yapılır.

## 3. Doküman

- [ ] TXT dosyası seçme ile başlama
- [ ] PDF metin çıkarma; taranmış PDF'yi OCR akışına yönlendirme
- [ ] DOCX desteği ve büyük dosyayı bölümlere ayırma
- [ ] Drive bağlantısı için OAuth + backend (sonraki faz)

**Zorluk:** Yüksek. Dosya biçimleri ve büyük içerik yönetimi gerekir.

## 4. Metni Tara

- [ ] Kamera/fotoğraf seçme izinleri
- [ ] Kırpma ve görüntü kalite kontrolü
- [ ] Türkçe OCR entegrasyonu
- [ ] OCR metnini düzenleme, kaydetme ve dinleme

**Zorluk:** Yüksek. Sonuç kalitesi fotoğraf ve OCR sağlayıcısına bağlıdır.

## 5. Podcast oluştur

- [ ] Girdi kararını verme: konu, URL veya kullanıcı metni
- [ ] Bölüm senaryosu/özet üretimi için AI backend'i
- [ ] TTS üretim kuyruğu, maliyet limiti ve hata yönetimi
- [ ] Bölümü kütüphaneye kaydetme

**Zorluk:** Çok yüksek. LLM, TTS maliyeti ve backend zorunludur.

## 6. Mail

- [ ] Gmail ya da Outlook ile başlama kararını verme
- [ ] OAuth, token saklama ve bağlantıyı kesme
- [ ] E-posta metnini temizleme, filtreleme ve dinleme
- [ ] Gizlilik bildirimi ve hassas veri kontrolleri

**Zorluk:** Çok yüksek. Kullanıcı verisi ve uygulama doğrulama süreçleri vardır.

## 7. AI ve bulut sesleri

- [ ] Kimlik doğrulama, kota ve istek günlükleri olan backend
- [ ] OpenAI/ElevenLabs kalite-maliyet karşılaştırması
- [ ] Anahtarların yalnızca backend'de tutulması
- [ ] Özet, başlık ve bölüm önerileri

## Önerilen sıra

1. Metin kaydetme + yerel kütüphane
2. Arka plan oynatma ve ilerleme
3. TXT/PDF içe aktarma
4. Kamera + OCR
5. Bulut sesleri / AI özetleme
6. Podcast, ardından Mail

---

# POC'den Production'a Geçiş Planı

Bu işler, uygulamanın yalnızca demoda çalışmasından gerçek kullanıcılar için güvenilir, ölçülebilir ve sürdürülebilir bir ürüne dönüşmesi içindir.

## P0 — Ürün temelini doğrulama

- [ ] Hedef kullanıcı, ana problem ve ilk kullanım senaryosunu tek cümlede tanımla.
- [ ] Başarı metriklerini belirle: ilk dinleme başlatma oranı, ilk haftada geri dönüş, dinleme süresi, hata oranı.
- [ ] Basit ürün analitiği olaylarını tanımla: uygulama açıldı, metin oluşturuldu, dinleme başladı/durdu/bitti, hata oluştu, içerik kaydedildi.
- [ ] Analitik olaylarına kullanıcı metni, e-posta içeriği veya kişisel veri ekleme.
- [ ] Kullanıcı geri bildirim akışı ekle: Ayarlar içinde geri bildirim ve hata bildirimi.
- [ ] Gerçek cihazlarda en az iOS ve Android için temel kullanıcı kabul testi senaryoları oluştur.

## P0 — Uygulama kalitesi

- [ ] Uygulama içi navigation yapısını standartlaştır; ekran durumları geri tuşu ve derin bağlantılarla çakışmamalı.
- [ ] `App.js` içeriğini ekran, bileşen, hook ve servis katmanlarına ayır.
- [ ] Yerel veri için şema, sürümleme ve migration stratejisi belirle.
- [ ] Çökme, beklenmeyen TTS hatası ve bozuk yerel veri için kullanıcıya anlaşılır kurtarma akışları ekle.
- [ ] Uzun metin, Türkçe karakter, emoji, satır sonu ve çok uzun kelime senaryolarını kapsayan test verisi oluştur.
- [ ] Performans hedefleri belirle: ilk açılış, ilk sesin başlaması, uzun metinde kaydırma ve bellek kullanımı.
- [ ] Erişilebilirlik denetimi yap: VoiceOver/TalkBack, dinamik metin boyutu, kontrast ve dokunma alanları.

## P0 — Otomatik test ve kalite kapıları

- [ ] ESLint, Prettier ve import/format kurallarını kur; CI'da zorunlu çalıştır.
- [ ] Birim test altyapısını kur: metin bölme, aktif kelime eşleme, süre biçimleme ve depolama dönüşümleri.
- [ ] Bileşen test altyapısını kur: ekranların temel render'ı, kart etkileşimleri ve hata/boş durumları.
- [ ] E2E test stratejisi seç: Maestro veya Detox; en az “metin gir → dinlemeyi başlat → durdur” akışını otomatikleştir.
- [ ] CI kontrol listesi oluştur: bağımlılık kurulumu, lint, test, Expo export ve raporların saklanması.
- [ ] Ana dala doğrudan kırık build alınmasını engelleyen branch/PR kontrollerini tanımla.

## P1 — Backend ve AI/TTS hazırlığı

- [ ] Backend için teknoloji, barındırma bölgesi, ortamlar (development/staging/production) ve sahiplik kararı ver.
- [ ] API sözleşmesi yaz: istek/yanıt şemaları, sürümleme, hata kodları, zaman aşımı ve tekrar deneme davranışı.
- [ ] Kimlik doğrulama stratejisini belirle: anonim başlangıç, e-posta/Apple/Google girişi ve hesap silme akışı.
- [ ] API anahtarları için secret manager, ortam değişkenleri ve erişim yetkisi kur.
- [ ] İstek doğrulama, kullanıcı başına kota/rate limit ve kötüye kullanım koruması ekle.
- [ ] OpenAI/ElevenLabs gibi sağlayıcılar için timeout, retry, fallback ve maliyet limiti tasarla.
- [ ] TTS/AI istekleri için maliyet metrikleri ve kullanıcı başına kullanım limiti oluştur.
- [ ] API günlüklerinde metin, belge veya e-posta içeriğinin maskelenmesini garanti et.

## P1 — Veri güvenliği ve uyumluluk

- [ ] Gizlilik politikası, kullanım koşulları ve destek iletişim kanalını hazırla.
- [ ] Hangi kullanıcı verisinin neden toplandığını, ne kadar süre tutulduğunu ve nasıl silindiğini belgeleyin.
- [ ] Hesap silme ve veri dışa aktarma/silme sürecini tasarla.
- [ ] Dosya ve e-posta özellikleri öncesinde izin metinlerini, saklama politikasını ve OAuth kapsamlarını gözden geçir.
- [ ] iOS App Privacy ve Google Play Data Safety beyanları için veri envanteri çıkar.
- [ ] Çocuklara yönelik kullanım, telifli içerik ve kullanıcı tarafından yüklenen içerik risklerini ürün kararlarında değerlendir.

## P1 — Operasyon ve gözlemlenebilirlik

- [ ] Crash reporting kur: sürüm, cihaz, işletim sistemi ve stack trace; kişisel veri olmadan.
- [ ] Uygulama ve backend hata oranı, gecikme, TTS başarısı ve maliyet için dashboard oluştur.
- [ ] Uyarı eşikleri belirle: çökme oranı, API hata oranı, kota aşımı ve maliyet anomalisi.
- [ ] Her sürüm için release notu, rollback planı ve incident iletişim şablonu oluştur.
- [ ] Yedekleme, geri yükleme ve veri kaybı senaryolarını backend ortaya çıkmadan önce tasarla.

## P2 — Yayın, büyüme ve gelir modeli

- [ ] Uygulama kimliği, ikon, splash ekranı, mağaza görselleri ve Türkçe mağaza açıklamasını tamamla.
- [ ] EAS Build/Submit veya eşdeğer imzalı build ve dağıtım sürecini kur.
- [ ] iOS TestFlight ve Google Play Internal Testing kanallarında kapalı beta yayınla.
- [ ] Beta katılımcıları için geri bildirim formu, hata toplama ve haftalık değerlendirme ritmi belirle.
- [ ] Freemium sınırlarını tanımla: ücretsiz metin uzunluğu, ses seçimi, dosya/OCR ve AI kullanımı.
- [ ] Abonelik düşünülüyorsa StoreKit/Google Play Billing, deneme, iptal ve geri yükleme akışlarını tasarla.
- [ ] Fiyatlandırmayı sağlayıcı maliyeti, mağaza komisyonu, destek ve hedef brüt marja göre doğrula.
- [ ] A/B test veya feature flag stratejisini yalnızca ölçülecek net bir ürün hipotezi varsa ekle.

## Production'a çıkış kriterleri

- [ ] Kritik P0 işleri tamamlandı ve CI yeşil.
- [ ] Temel TTS akışı gerçek iOS ve Android cihazlarda kabul testinden geçti.
- [ ] Çökme/hata izleme, gizlilik politikası ve kullanıcı destek kanalı hazır.
- [ ] Yeni sürümü geri alma veya sorunlu özelliği kapatma yöntemi var.
- [ ] Beta verisiyle en az bir ürün metriği iyileştirme kararı alındı.
- [ ] Bulut AI/TTS varsa kota, maliyet limiti ve API anahtarı güvenliği doğrulandı.
