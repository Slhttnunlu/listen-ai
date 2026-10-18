# Listen AI hedef mimarisi

## Bugünkü sınır

Mevcut metin dinleme ve yerel kütüphane akışı backend gerektirmez. Metin, ilerleme ve favori bilgisi cihazdaki SQLite veritabanında; seslendirme işletim sisteminin TTS motorunda kalır. Bu sınır çevrimdışı kullanımı korur ve ilk sürümün veri riskini azaltır.

Backend; hesaplar arası senkronizasyon, bulut TTS, AI özetleme, OCR sağlayıcısı, podcast üretimi veya mail/Drive entegrasyonu açıldığında zorunlu hale gelir. Mobil uygulamaya sağlayıcı API anahtarı konulmaz.

## Hedef bileşenler

```text
Mağazadan dağıtılan mobil uygulama (iOS IPA / Android AAB-APK)
  ├─ Yerel: SQLite + cihaz TTS (çevrimdışı kullanım ve fallback)
  └─ HTTPS: Listen AI API
       ├─ Kimlik, yetkilendirme, kota ve abonelik
       ├─ İçerik metadata servisi
       ├─ TTS job servisi ve sağlayıcı yönlendirme
       └─ Asenkron iş kuyruğu
            ├─ TTS worker'ları
            │    ├─ Yönetilen API: OpenAI / Gemini / ElevenLabs
            │    └─ Self-hosted model: Chatterbox veya seçilecek başka motor
            └─ Şifreli obje depolama + CDN/imzalı URL

API/Worker ─ PostgreSQL
API/Worker ─ Secret manager
API/Worker ─ Logs, metrics, traces, crash/error reporting
```

Ham kullanıcı metni varsayılan olarak kalıcı sunucu günlüğüne yazılmaz. Bir üretim işi için içerik yüklemek zorunluysa amaç, saklama süresi ve silme davranışı kullanıcıya gönderimden önce açıklanır.

## Production TTS akışı

Mobil uygulama, sağlayıcı ayrıntılarını ve API anahtarlarını bilmez. Kullanıcının açık eylemiyle metni Listen AI backend'ine gönderir; backend sağlayıcı limitlerine göre metni cümle ve paragraf sınırlarında parçalara ayırır. Böylece bölümleme davranışı mobil sürüm yayınlamadan değiştirilebilir ve bütün sağlayıcılarda aynı güvenlik, kota ve maliyet politikaları uygulanır.

```text
1. Mobil → POST /v1/tts/jobs (metin, dil, ses, hız, idempotency key)
2. API → doğrulama + kimlik + kota/maliyet rezervasyonu
3. API → 202 Accepted + job kimliği
4. Worker → metni anlamlı ve sağlayıcıya uygun segmentlere ayırma
5. Worker → seçilen TTS sağlayıcısında segmentleri üretme
6. Worker → sesleri şifreli obje depolamaya yazma
7. Mobil → hazır ilk segmenti oynatma; sonraki segmentler üretilirken indirme
8. Backend → kullanım uzlaştırma, süreli saklama ve otomatik silme
```

Uzun içerikte tüm sesin bitmesini beklemek yerine ilk küçük segment hazır olduğunda oynatma başlar. Sonraki segmentler kuyrukta önceden üretilip indirilir; kullanıcı açısından ağ ve model gecikmesi böyle gizlenir. Segment manifest'i metindeki başlangıç/bitiş konumlarını taşır. Kelime vurgusu ancak sağlayıcı gerçek zaman damgası veya hizalama verisi sağlıyorsa yapılır; tahmini zamanlayıcı kullanılmaz.

Mobil istemci kısa süreli imzalı ses URL'lerini kullanır ve gerekli segmentleri kontrollü olarak cihaz önbelleğine alır. Aynı kullanıcı, metin, ses, hız ve model sürümü için güvenli bir içerik özeti üzerinden tekrar kullanılabilir cache değerlendirilebilir; kullanıcılar arasında ham içerik veya tahmin edilebilir cache anahtarı paylaşılmaz.

İş başarısız olduğunda backend kontrollü hata kodu döndürür. Mobil uygulama sınırlı retry uygular, kısmen hazır segmentleri kaybetmez ve kullanıcı isterse cihazın yerleşik TTS motoruyla devam eder. Backend veya bulut sağlayıcısı erişilemezken yerel kütüphane kullanılabilir kalır.

## TTS sağlayıcı stratejisi

Backend tek bir sağlayıcı arayüzü sunar. OpenAI, Google Gemini, ElevenLabs ve self-hosted motorlar bu arayüzün ayrı adaptörleridir. Sağlayıcı seçimi mobil uygulamada sabitlenmez; ortam, kullanıcı planı, dil/ses seçimi, özellik bayrağı, sağlık durumu, gecikme ve maliyet politikasına göre backend tarafından yapılır.

- **Cihaz TTS:** Ücretsiz, çevrimdışı temel ve bulut hatalarında fallback.
- **Yönetilen TTS API'leri:** Başlangıçta operasyonu kolaylaştıran production adayları; karakter/ses süresi kotası ve maliyet alarmı zorunludur.
- **Self-hosted TTS:** Chatterbox MacBook POC'sinde doğrulanan akışın container ve worker olarak buluta taşınmış biçimidir. Production için warm worker, tercihen GPU, otomatik ölçekleme, model lisansı ve kapasite planı gerekir.
- **MacBook servisi:** Yalnızca development/POC içindir; production trafiği almaz, internete doğrudan açılmaz ve kalıcı backend yerine geçmez.

İlk production sürümünde yönetilen bir sağlayıcıyla düşük operasyon yükü hedeflenir. Self-hosted seçenek ancak Türkçe ses kalitesi, ilk sese kadar gecikme, eşzamanlı kullanıcı kapasitesi ve toplam maliyet ölçümleri yönetilen sağlayıcıya göre anlamlı avantaj gösterirse devreye alınır. Sağlayıcı değişimi feature flag/kill switch ile yapılabilir olmalıdır.

## Production deployment topolojisi

- Mobil uygulamanın IPA/AAB-APK paketi mağazalardan dağıtılır; backend adresi ortama göre build yapılandırmasından gelir.
- Public internete yalnızca API gateway/load balancer açıktır. API, worker, veritabanı ve kuyruk özel ağ sınırlarında çalışır.
- API stateless ölçeklenir; uzun ses üretimi request sürecinde tutulmaz, dayanıklı kuyruğa yazılır.
- TTS worker havuzları yönetilen sağlayıcı adaptörleri ile self-hosted model worker'larından bağımsız ölçeklenir.
- Ses dosyaları backend belleğinde veya veritabanında tutulmaz; şifreli obje depolamada süreli saklanır ve kısa ömürlü imzalı URL ile sunulur.
- PostgreSQL yalnızca kullanıcı, job, kota, faturalama ve içerik metadata'sını taşır; ham metin saklama varsayılanı kapalıdır.
- Queue, veritabanı ve obje depolama için yedekleme, yaşam döngüsü, silme ve felaket kurtarma politikaları ortam bazında tanımlanır.

## Teknoloji kararı

- **API ve worker:** TypeScript, Node.js LTS, NestJS ve Fastify adaptörü. Mobil ekiple ortak dil ve şema paylaşımı sağlarken modül sınırlarını belirgin tutar.
- **Sözleşme:** OpenAPI 3.1; mobil istemci tipleri sözleşmeden üretilir.
- **Kalıcı metadata:** PostgreSQL. Kullanıcı, iş, kota ve faturalama kayıtları transaction gerektirir.
- **Kuyruk:** İlk asenkron TTS/OCR ihtiyacında yönetilen kuyruk; uygulama kodu sağlayıcıdan bağımsız bir job arayüzü kullanır.
- **Dosya/ses:** Kısa ömürlü, şifreli obje depolama ve imzalı URL. Public bucket kullanılmaz.
- **Secret:** Platform secret manager. `.env` yalnızca yerel geliştirme içindir ve repoya girmez.
- **Gözlemlenebilirlik:** Yapılandırılmış log, OpenTelemetry uyumlu trace/metric ve kişisel veri içermeyen hata raporu.

Somut cloud ürünü seçimi deployment başlamadan ayrı ADR ile yapılmalıdır. Taşınabilir sınırlar korunarak AWS, GCP veya başka bir yönetilen platforma kilitlenme azaltılır.

## Bölge ve ortamlar

- Birincil üretim bölgesi Avrupa Birliği içinde seçilir; önerilen başlangıç bölgesi Frankfurt'tur.
- `development`, `staging` ve `production` ayrı hesap/proje, veritabanı, bucket, secret ve API hostname kullanır.
- Mobil development build yalnızca development API'ye; mağaza build'i yalnızca production API'ye bağlanır.
- Production verisi development veya staging'e kopyalanmaz.
- Infrastructure as Code backend reposunda tutulur; uygulama reposu deployment kimlik bilgisi taşımaz.

## Sahiplik

İlk aşamada ürün sahibi aynı zamanda teknik sahibidir. Production öncesinde aşağıdaki sorumluluklara isim atanmalıdır:

| Alan                    | Sorumluluk                                              |
| ----------------------- | ------------------------------------------------------- |
| Mobil                   | Sürüm, Expo/EAS, mağaza ve cihaz uyumluluğu             |
| Backend                 | API, worker, migration, kota ve sağlayıcı entegrasyonu  |
| Platform/operasyon      | Ortamlar, secret, yedekleme, alarm ve incident yönetimi |
| Güvenlik/veri sorumlusu | Veri envanteri, saklama, silme ve erişim denetimi       |
| Ürün                    | Metrikler, maliyet sınırı ve özellik kabul kriterleri   |

Tek kişi birden fazla rolü taşıyabilir; production erişimi ve acil durum sorumluluğu yine de yazılı olmalıdır.

## Aşamalı geçiş

1. Yerel MVP'yi backend olmadan yayınlanabilir kaliteye getir.
2. API sözleşmesi, kimlik ve boş health endpoint'iyle development ortamını kur.
3. İlk bulut özelliğini sağlayıcı adaptörü ve kullanıcı başına sert kota ile staging'de aç.
4. İçerik saklama/silme, maliyet alarmı ve incident akışı doğrulanmadan production'a açma.
5. Hesap ve senkronizasyon ancak cihaz içi verinin birleşme/çatışma stratejisi tasarlandıktan sonra eklenir.

## Mimari kurallar

- Mobil istemci hiçbir zaman OpenAI, Google Gemini veya başka bir cloud secret'ı taşımaz.
- Tüm yazma istekleri idempotency anahtarı ve izleme kimliği destekler.
- Dış sağlayıcı çağrılarında timeout, sınırlı retry, circuit breaker/fallback ve maliyet bütçesi bulunur.
- İçerik payload'ları loglanmaz; hata kodları serbest metin yerine kontrollü bir sözlükten gelir.
- Veritabanı migration'ları ileri ve geri alma planıyla CI'da doğrulanır.
- Mobil uygulama backend erişilemediğinde yerel TTS ve kütüphane işlevlerini kullanmaya devam eder.
