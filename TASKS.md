# Listen AI — Ürün görevleri

## 1. Metin Yaz veya Yapıştır — MVP önceliği

- [x] Metni başlıkla kaydetme ve kütüphaneye ekleme
- [x] SQLite ile kalıcı yerel depolama
- [x] Dinleme ilerlemesini kaydetme ve kütüphaneden kaldığı yerden devam
- [x] Okunan kelimeyi ses motoru sınır olaylarıyla vurgulama
- [x] Varsayılan cihaz sesi ve oynatma hızını Ayarlar'dan seçip cihazda kalıcı saklama
- [ ] Arka plan oynatma ve kilit ekranı kontrolleri

**Zorluk:** Orta. İlk yayın için en değerli, API gerektirmeyen özellik.

## 2. Kütüphanem

- [x] Devam eden, tamamlanan ve favori filtrelerini gerçek veriye bağlama
- [x] Arama, sıralama, yeniden adlandırma, favorileme ve SQLite soft-delete ile geri alınabilir silme
- [x] Kartlarda tahmini süre, kaynak türü ve gerçek dinleme ilerlemesi gösterimi
- [x] Yerel kütüphaneyi JSON dışa aktarma, tüm veriyi kalıcı silme ve 30 günlük soft-delete temizliği
- [x] Sürümlenmiş JSON yedeğini doğrulayarak ve mükerrerleri atlayarak kütüphaneyle birleştirme

**Zorluk:** Orta. Metin kaydetme ile birlikte yapılır.

## 3. Doküman

- [x] Cihazdan UTF-8 TXT seçme, boyut/içerik doğrulama ve editöre aktarma
- [ ] PDF metin çıkarma; taranmış PDF'yi OCR akışına yönlendirme
  - [x] Native development build’de dijital PDF metnini cihaz üzerinde çıkar ve büyük/bozuk/parolalı dosya hatalarını açık göster.
  - [x] Seçilebilir metni olmayan PDF’yi gelecekteki OCR/Metni Tara akışına yönlendir.
  - [ ] iOS ve Android native build’de dijital, taranmış, parolalı ve bozuk PDF kabul testlerini tamamla.
- [x] DOCX desteği ve büyük dosyayı bölümlere ayırma
  - [x] DOCX arşivinden paragrafları cihaz içinde çıkar, bozuk/parolalı/boş dosya ve 10 MB boyut kontrolü ekle.
  - [x] 250.000 karakter üzerindeki belgeleri paragraf/kelime sınırlarında ayrı kütüphane bölümlerine ayır.
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

## 7. TTS motoru karşılaştırma yol haritası

Dört yaklaşım aynı Türkçe test metinleriyle; ses doğallığı, telaffuz, ilk sese kadar geçen süre, uzun metin kararlılığı, çevrimdışı çalışma, uygulama boyutu, cihaz kaynak tüketimi, gizlilik, lisans ve tahmini maliyet açısından karşılaştırılacak.

### 7.1 Cihazın yerleşik TTS motoru — mevcut temel

- [x] iOS/Android yerleşik ses motoruyla Türkçe metin seslendirme
- [x] Cihazdaki uygun Türkçe sesleri listeleme ve varsayılan sesi seçme
- [x] Oynatma hızını değiştirme, okunan kelimeyi vurgulama ve ilerlemeyi kaydetme
- [ ] Gerçek iOS ve Android cihazlarda ses kalitesi, kesinti ve uzun metin sonuçlarını ölçme

**Rol:** Ücretsiz, çevrimdışı ve gizlilik odaklı temel/fallback seçenek olarak korunacak.

### 7.2 MacBook Pro üzerinde hafif açık kaynak TTS servisi — POC

- [ ] Türkçe destekli hafif motor ve ses modelini lisanslarıyla seç; ilk aday olarak Piper ve uygun Türkçe sesi değerlendir
- [ ] Motoru MacBook Pro'da yalnızca yerel geliştirme ağına açık bir servis olarak çalıştır
- [ ] Mobil uygulamada sağlayıcıdan bağımsız TTS istemcisi oluştur ve geliştirme ortamında bu servise istek gönder
- [ ] Uzun metni güvenli parçalara ayır; WAV/MP3 üretme, indirme, önbellek ve hata/fallback akışını ekle
- [ ] Cihaz TTS'i ile doğallık, Türkçe telaffuz, ilk ses gecikmesi ve üretim süresini karşılaştır
- [ ] Servisi internete veya production'a açmadan önce kimlik doğrulama, TLS, kota ve lisans incelemesi yap

**Rol:** API ücreti olmadan model tabanlı ses ve gerçek ses dosyası oynatma mimarisini doğrulayan geliştirme POC'si.

### 7.3 OpenAI ve Google Gemini TTS API denemeleri — kontrollü POC

- [ ] OpenAI ve Google Gemini'nin güncel TTS modelleri, Türkçe kalitesi, kullanım şartları ve fiyatlarını karşılaştır
- [ ] Sağlayıcı anahtarlarını mobil uygulamaya koymadan yalnızca backend/secret manager üzerinden çağır
- [ ] Ortak sağlayıcı arayüzü altında OpenAI ve Gemini adaptörleri geliştir
- [ ] Kullanıcı başına karakter kotası, rate limit, timeout, sınırlı retry, maliyet üst sınırı ve cihaz TTS fallback'i ekle
- [ ] Kullanıcı metninin aktarımı, saklama süresi ve AI ses açıklaması için açık bilgilendirme/onay akışını hazırla
- [ ] Aynı Türkçe test setiyle kalite, gecikme ve 1.000/10.000/100.000 karakter maliyet karşılaştırması çıkar

**Rol:** Production'daki isteğe bağlı Pro/doğal ses sağlayıcısını seçmek; ChatGPT aboneliği API kotası kabul edilmeyecek, API faturalandırması ayrı izlenecek.

### 7.4 Uygulama içinde çalışan hafif TTS motoru — cihaz içi model POC

- [x] iOS/Android ve Expo development build ile uyumlu ONNX/native çalışma zamanı olarak Sherpa-ONNX'i seç
- [x] POC Türkçe Piper modelinin lisansını incele: CC BY-NC-SA 4.0 olduğu için ticari production dağıtımına uygun değil
- [x] İlk POC için yaklaşık 79 MB modeli uygulamayla paketle; production öncesi indirilebilir model ve sürümleme kararı al
- [x] Sherpa-ONNX streaming PCM ile tamamen cihaz içinde çalışan metin → ses prototipini geliştir
- [ ] Orta sınıf gerçek cihazlarda ilk ses gecikmesi, gerçek zaman katsayısı, RAM, CPU, pil ve ısınmayı ölç
- [x] Ayarlardan cihaz/offline motor seçimi, build-time görünürlük bayrağı ve hata halinde cihaz TTS'ine güvenli fallback ekle
- [ ] Production modelini uygulamadan indirilebilir/kaldırılabilir yap ve depolama kontrollerini tamamla

POC uygulama ve doğrulama notları: [`docs/ON_DEVICE_TTS_POC.md`](docs/ON_DEVICE_TTS_POC.md)

**Rol:** Sunucu ve kullanım maliyeti olmadan daha tutarlı ses hedefi; yalnızca mobil performans ve lisans sonuçları kabul sınırlarını geçerse production adayı olacak.

### 7.5 Karar kapısı

- [ ] Dört yaklaşımın ölçümlerini tek karşılaştırma raporunda topla
- [ ] Ücretsiz katman, Pro katman ve çevrimdışı fallback için kullanılacak motorları seçip ADR ile kaydet
- [ ] Seçilmeyen deneysel motorları production build'den, izinlerden ve bağımlılıklardan kaldır

## 8. AI özellikleri

- [ ] Kimlik doğrulama, kota ve istek günlükleri olan backend
- [ ] Anahtarların yalnızca backend'de tutulması
- [ ] Özet, başlık ve bölüm önerileri

## Önerilen sıra

1. Metin kaydetme + yerel kütüphane
2. Arka plan oynatma ve ilerleme
3. TXT/PDF içe aktarma
4. Kamera + OCR
5. TTS motoru POC'leri ve karşılaştırma karar kapısı
6. Bulut sesleri / AI özetleme
7. Podcast, ardından Mail

---

# POC'den Production'a Geçiş Planı

Bu işler, uygulamanın yalnızca demoda çalışmasından gerçek kullanıcılar için güvenilir, ölçülebilir ve sürdürülebilir bir ürüne dönüşmesi içindir.

## P0 — Ürün temelini doğrulama

- [x] Hedef kullanıcı, ana problem ve ilk kullanım senaryosunu `docs/PRODUCT.md` içinde tanımla.
- [x] Başarı metriklerini ve ilk beta hedeflerini belirle.
- [x] İçerik taşımayan temel ürün analitiği event sözleşmesini tanımla.
- [x] Analytics olaylarında kullanıcı metni, dosya adı ve kişisel veriyi yasakla.
- [x] Ayarlar içinde GitHub issue formuna açılan yardım ve geri bildirim akışı ekle.
- [x] `docs/ACCEPTANCE_TESTS.md` içinde iOS ve Android gerçek cihaz kabul senaryolarını oluştur.

## P0 — Uygulama kalitesi

- [x] React Navigation ile stack/tab yapısını standartlaştır; geri hareketinde TTS'yi durdur ve `listenai://` deep-link şemasını tanımla.
- [x] `App.js` içeriğini ekran, bileşen, hook ve servis katmanlarına ayır.
- [x] SQLite `user_version` tabanlı şema sürümleme ve transaction migration stratejisi kur.
- [x] Çökme, beklenmeyen TTS hatası ve bozuk yerel veri için kullanıcıya anlaşılır kurtarma akışları ekle.
  - [x] Kütüphane yükleme hatasında kullanıcıya tekrar deneme akışı sun.
  - [x] TTS başlatma ve ilerleme kaydı hatalarını yakala; oynatmayı güvenli durumda tut.
  - [x] Bozuk veya eksik eski SQLite satırlarını güvenli varsayılanlarla normalize et.
  - [x] Uygulama seviyesinde beklenmeyen render hataları için hata sınırı ve kurtarma ekranı ekle.
- [x] Uzun metin, Türkçe karakter, emoji, satır sonu ve çok uzun kelime test sınıflarını tanımla.
- [x] İlk açılış, ilk ses, uzun metin, kütüphane ve bellek performans hedeflerini belirle.
- [ ] Erişilebilirlik denetimi yap: VoiceOver/TalkBack, dinamik metin boyutu, kontrast ve dokunma alanları.
  - [x] Etkileşimli kontrollerin ad, rol, seçili durum ve minimum dokunma alanı temelini iyileştir.
  - [x] `docs/ACCESSIBILITY.md` içinde yayın öncesi gerçek cihaz denetim listesini tanımla.
  - [ ] VoiceOver/TalkBack, maksimum dinamik metin ve kontrast kontrollerini gerçek cihazlarda tamamla.

## P0 — Otomatik test ve kalite kapıları

- [x] ESLint, Prettier ve import/format kurallarını kur; CI'da zorunlu çalıştır.
- [x] Birim test altyapısını kur: metin bölme, aktif kelime eşleme, ilerleme ve kütüphane dönüşümleri.
- [x] Bileşen test altyapısını kur: ana ekran, kütüphane filtreleri ve oynatıcı kontrolleri.
- [x] Maestro E2E akışını kur: “metin gir → dinlemeyi başlat → hızı değiştir → durdur” ve kütüphane sekmesi iOS Simulator'da otomatikleşti.
- [x] GitHub Actions CI kur: bağımlılık kurulumu, lint, format, test ve Expo iOS export.
- [x] Ana dala doğrudan kırık build alınmasını engelleyen branch/PR kontrollerini `docs/BRANCH_PROTECTION.md` içinde tanımla ve PR şablonu ekle.

## P1 — Backend ve AI/TTS hazırlığı

- [x] Backend için teknoloji, barındırma bölgesi, ortamlar (development/staging/production) ve sahiplik kararını `docs/ARCHITECTURE.md` içinde tanımla.
- [x] API sözleşmesini `docs/api/openapi.yaml` ve `docs/API.md` içinde yaz: istek/yanıt şemaları, sürümleme, hata kodları, zaman aşımı ve tekrar deneme davranışı.
- [x] Kimlik doğrulama stratejisini `docs/AUTH.md` içinde belirle: anonim başlangıç, e-posta/Apple/Google girişi ve hesap silme akışı.
- [ ] API anahtarları için secret manager, ortam değişkenleri ve erişim yetkisi kur.
- [ ] İstek doğrulama, kullanıcı başına kota/rate limit ve kötüye kullanım koruması ekle.
- [x] OpenAI/Gemini gibi sağlayıcılar için timeout, retry, circuit breaker, cihaz TTS fallback'i ve maliyet limitini `docs/TTS_PROVIDER_RELIABILITY.md` içinde tasarla.
- [ ] TTS/AI istekleri için maliyet metrikleri ve kullanıcı başına kullanım limitini uygula.
  - [x] Başlangıç metriklerini, kullanıcı/proje kotalarını ve sert bütçe davranışını tanımla.
  - [ ] Backend sayaçları, rezervasyon/uzlaştırma ve sert bütçe kesicisini uygula.
- [ ] API günlüklerinde metin, belge veya e-posta içeriğinin maskelenmesini garanti et.

## P1 — Veri güvenliği ve uyumluluk

- [x] Gizlilik politikası, kullanım koşulları ve destek iletişim kanalını hazırla.
- [x] Hangi kullanıcı verisinin neden toplandığını, ne kadar süre tutulduğunu ve nasıl silindiğini `docs/DATA_INVENTORY.md` içinde belgele.
- [x] Hesaplı ve hesapsız kullanım için veri dışa aktarma/silme sürecini tasarla.
- [x] Dosya ve e-posta özellikleri öncesinde izin, saklama ve en dar OAuth kapsamı kararlarını gözden geçir.
- [x] iOS App Privacy ve Google Play Data Safety beyanları için mevcut beta veri envanterini çıkar.
- [x] Çocuklara yönelik kullanım, telifli içerik ve kullanıcı içeriği risklerini `docs/CONTENT_RISKS.md` içinde değerlendir.

## P1 — Operasyon ve gözlemlenebilirlik

- [ ] Crash reporting kur: sürüm, cihaz, işletim sistemi ve stack trace; kişisel veri olmadan.
- [ ] Uygulama ve backend hata oranı, gecikme, TTS başarısı ve maliyet için dashboard oluştur.
  - [x] İçerik taşımayan metrikleri, dört dashboard görünümünü ve kurulum kabul kapısını tanımla.
  - [ ] İzleme sağlayıcısında staging/production dashboard'larını kur ve hata enjeksiyonuyla doğrula.
- [x] Uyarı eşikleri belirle: çökme oranı, API hata oranı, kuyruk, sağlayıcı, kota ve maliyet anomalisi.
- [x] Her sürüm için release notu, rollback planı ve incident iletişim şablonu oluştur.
- [x] Yedekleme, geri yükleme ve veri kaybı senaryolarını backend ortaya çıkmadan önce tasarla.

## P2 — Yayın, büyüme ve gelir modeli

- [ ] Uygulama kimliği, ikon, splash ekranı, mağaza görselleri ve Türkçe mağaza açıklamasını tamamla.
  - [x] iOS/Android uygulama kimliği, sürüm numarası, ikon ve splash varlıklarını yapılandır.
  - [x] Çalışan özelliklerle uyumlu Türkçe mağaza açıklaması ve metadata kontrol listesini hazırla.
  - [ ] Mağaza ekran görüntülerini son ürün görünümü ve gerekli cihaz boyutlarıyla hazırla.
- [ ] EAS Build/Submit veya eşdeğer imzalı build ve dağıtım sürecini kur.
  - [x] Development, Simulator E2E, internal preview ve production EAS profillerini tanımla.
  - [ ] EAS projesini hesaba bağla; imzalı iOS/Android build ve submit doğrulamasını tamamla.
- [ ] iOS TestFlight ve Google Play Internal Testing kanallarında kapalı beta yayınla.
- [x] Beta katılımcıları için geri bildirim formu, hata toplama ve haftalık değerlendirme ritmi belirle.
- [ ] Freemium sınırlarını tanımla: ücretsiz metin uzunluğu, ses seçimi, dosya/OCR ve AI kullanımı.
- [ ] Abonelik düşünülüyorsa StoreKit/Google Play Billing, deneme, iptal ve geri yükleme akışlarını tasarla.
- [ ] Fiyatlandırmayı sağlayıcı maliyeti, mağaza komisyonu, destek ve hedef brüt marja göre doğrula.
- [ ] A/B test veya feature flag altyapısını yalnızca ölçülecek net bir ürün hipotezi varsa ekle.
  - [x] TTS sağlayıcı rollout/kill switch stratejisini, ölçülebilir hipotezi ve kaldırma yaşam döngüsünü `docs/FEATURE_FLAGS.md` içinde tanımla.
  - [ ] Ortamları ayrılmış remote config, audit kaydı ve backend kill switch'i kurup staging'de doğrula.

## Production'a çıkış kriterleri

- [ ] Kritik P0 işleri tamamlandı ve CI yeşil.
- [ ] Temel TTS akışı gerçek iOS ve Android cihazlarda kabul testinden geçti.
- [ ] Çökme/hata izleme, gizlilik politikası ve kullanıcı destek kanalı hazır.
- [ ] Yeni sürümü geri alma veya sorunlu özelliği kapatma yöntemi var.
- [ ] Beta verisiyle en az bir ürün metriği iyileştirme kararı alındı.
- [ ] Bulut AI/TTS varsa kota, maliyet limiti ve API anahtarı güvenliği doğrulandı.
