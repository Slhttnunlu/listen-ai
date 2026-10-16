# Listen AI hedef mimarisi

## Bugünkü sınır

Mevcut metin dinleme ve yerel kütüphane akışı backend gerektirmez. Metin, ilerleme ve favori bilgisi cihazdaki SQLite veritabanında; seslendirme işletim sisteminin TTS motorunda kalır. Bu sınır çevrimdışı kullanımı korur ve ilk sürümün veri riskini azaltır.

Backend; hesaplar arası senkronizasyon, bulut TTS, AI özetleme, OCR sağlayıcısı, podcast üretimi veya mail/Drive entegrasyonu açıldığında zorunlu hale gelir. Mobil uygulamaya sağlayıcı API anahtarı konulmaz.

## Hedef bileşenler

```text
Expo iOS/Android
  ├─ Yerel: SQLite + cihaz TTS
  └─ HTTPS: API
       ├─ Kimlik ve kota
       ├─ İçerik metadata servisi
       ├─ AI/TTS sağlayıcı adaptörleri
       └─ Asenkron iş kuyruğu
            ├─ Worker
            └─ Şifreli obje depolama

API/Worker ─ PostgreSQL
API/Worker ─ Secret manager
API/Worker ─ Logs, metrics, traces, crash/error reporting
```

Ham kullanıcı metni varsayılan olarak kalıcı sunucu günlüğüne yazılmaz. Bir üretim işi için içerik yüklemek zorunluysa amaç, saklama süresi ve silme davranışı kullanıcıya gönderimden önce açıklanır.

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

- Mobil istemci hiçbir zaman OpenAI, ElevenLabs veya cloud secret'ı taşımaz.
- Tüm yazma istekleri idempotency anahtarı ve izleme kimliği destekler.
- Dış sağlayıcı çağrılarında timeout, sınırlı retry, circuit breaker/fallback ve maliyet bütçesi bulunur.
- İçerik payload'ları loglanmaz; hata kodları serbest metin yerine kontrollü bir sözlükten gelir.
- Veritabanı migration'ları ileri ve geri alma planıyla CI'da doğrulanır.
- Mobil uygulama backend erişilemediğinde yerel TTS ve kütüphane işlevlerini kullanmaya devam eder.
