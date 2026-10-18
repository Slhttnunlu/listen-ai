# Listen AI abonelik ve entitlement tasarımı

**Durum:** Tasarım hazır; kapalı betada ödeme ve Pro arayüzü kapalı

**Son gözden geçirme:** 18 Ekim 2026

**Kapsam:** Apple StoreKit 2, Google Play Billing ve Listen AI backend uzlaştırması

Bu belge gelecekteki Pro aboneliğinin satın alma, deneme, iptal, yenileme ve geri yükleme yaşam döngüsünü tanımlar. Herhangi bir mağaza ürünü, fiyat, ödeme SDK'sı veya production entegrasyonu oluşturmaz. Ücretsiz cihaz TTS'i ve yerel kütüphane abonelikten bağımsız kalır.

## Ürün modeli

- Tek entitlement kullanılır: `pro_cloud_voice`.
- İlk sürüm adayı aynı abonelik ailesinde aylık ve yıllık otomatik yenilenen plandır.
- Lifetime veya tüketilebilir kredi ilk sürüm kapsamında değildir.
- Pro yalnızca doğal bulut sesleri ve ileride kabul edilen maliyetli AI özelliklerini açar.
- Cihaz TTS'i, yerel kütüphane, temel belge içe aktarma ve cihaz içi OCR ücretsiz kalır.
- Ürün kimlikleri, fiyatlar, para birimi ve deneme metni uygulamaya sabit yazılmaz; mağazadan alınır.

Satılabilir kota ve fiyat, sağlayıcı maliyet ölçümü tamamlanmadan belirlenmez. Bu nedenle kapalı beta build'inde paywall, “Pro” ve “ücretsiz deneme” gösterilmez.

## Yetki kaynağı ve güven sınırı

Apple veya Google ödeme işleminin kaynağıdır. Listen AI backend ise iki mağazadan gelen doğrulanmış işlemleri ortak entitlement durumuna dönüştürür. Mobil istemcinin tek başına bildirdiği satın alma erişim açmak için yeterli değildir.

```text
Mobil uygulama
  ├─ StoreKit 2 / Google Play Billing: ürünleri göster ve satın almayı başlat
  └─ Listen AI API: imzalı işlem veya purchase token gönder
       ├─ Apple App Store Server API / imzalı JWS doğrulaması
       ├─ Google Play Developer API doğrulaması
       ├─ idempotent entitlement kaydı
       └─ App Store Server Notifications V2 / Google RTDN uzlaştırması
```

- Provider ve mağaza secret'ları yalnızca backend secret manager'da tutulur.
- Backend işlem kimliği, ürün kimliği, mağaza, durum ve geçerlilik zamanlarını saklar; kart verisi saklamaz.
- Ham kullanıcı metni, belge adı veya TTS içeriği billing event'lerine ve loglara eklenmez.
- Aynı mağaza işlemi tekrar geldiğinde ikinci entitlement yaratılmaz.
- Mobil önbellekteki durum yalnızca kısa süreli kullanıcı deneyimi içindir; nihai erişim backend ve doğrulanmış mağaza durumundan gelir.

## Ortak durum modeli

| Durum                    |     Pro erişimi | Kullanıcı davranışı                                           |
| ------------------------ | --------------: | ------------------------------------------------------------- |
| `checking`               |          Beklet | Son doğrulanmış durum yüklenir; yeni ücretli iş başlatılmaz   |
| `pending`                |           Hayır | Ödeme henüz tamamlanmadı mesajı gösterilir                    |
| `trial_active`           |            Evet | Deneme bitişi ve sonraki yenileme bedeli gösterilir           |
| `active`                 |            Evet | Kota ve geçerlilik tarihiyle bulut özellikleri açılır         |
| `grace_period`           |            Evet | Mağazanın tanıdığı süre boyunca erişim korunur                |
| `billing_retry`          | Politikaya göre | Mağaza durumu doğrulanır; sessizce kalıcı hak verilmez        |
| `cancelled_until_expiry` |            Evet | Dönem sonuna kadar erişim sürer; yenilenmeyeceği gösterilir   |
| `paused`                 |           Hayır | Google duraklatma süresince bulut işi başlatılmaz             |
| `expired`                |           Hayır | Ücretsiz cihaz TTS'i ve yerel veriler kullanılmaya devam eder |
| `revoked`                |           Hayır | İade/revoke doğrulanınca bulut erişimi kaldırılır             |
| `unknown`                |           Hayır | Güvenli varsayılan; mağaza/backend yeniden sorgulanır         |

`billing_retry` erişim davranışı mağazanın doğrulanmış geçerlilik tarihi ve grace period bilgisinden türetilir; mobil uygulama kendi tahmini süre sayacını kullanmaz.

## Satın alma akışı

1. Kullanıcı hesabıyla oturum açar. Ücretsiz ve çevrimdışı özellikler hesap gerektirmez; Pro satın alma, cihazlar arası entitlement eşlemesi için hesap gerektirir.
2. Mobil uygulama mağazadan kullanılabilir ürünleri ve yerelleştirilmiş fiyatları yükler.
3. Paywall; plan dönemi, toplam fiyat, otomatik yenileme, varsa deneme koşulları, iptal yöntemi, kullanım koşulları ve gizlilik bağlantısını satın alma öncesinde gösterir.
4. Kullanıcının açık eylemiyle native mağaza satın alma arayüzü açılır.
5. Başarılı görünen işlem backend'e gönderilir ve ilgili mağazanın sunucu API'si/imzasıyla doğrulanır.
6. Yalnızca doğrulanmış `PURCHASED`/geçerli işlem entitlement açar. `PENDING` durumunda erişim verilmez.
7. Android ilk satın alması doğrulama ve entitlement kaydından sonra süresi içinde backend üzerinden acknowledge edilir; yenilemeler tekrar acknowledge edilmez.
8. Uygulama ortak entitlement sonucunu yeniler, kullanıcıya anlaşılır başarı veya bekleme durumu gösterir.

Satın alma ekranı kapanması, ağ kesilmesi veya callback'in tekrarlanması başarısız ödeme varsayımı oluşturmaz. Uygulama yeniden açıldığında mevcut işlemler sorgulanıp backend ile uzlaştırılır.

## Geri yükleme ve cihaz değişimi

- Ayarlar ve gelecekteki paywall içinde görünür bir **Satın Almaları Geri Yükle** eylemi bulunur.
- iOS uygulaması doğrulanmış güncel StoreKit entitlement'larını; Android uygulaması güncel Play satın almalarını açılışta, foreground'a dönüşte ve kullanıcı isteğiyle sorgular.
- Sonuç backend'e gönderilir; mevcut Listen AI hesabıyla eşleştirilir ve sunucu durumuyla uzlaştırılır.
- Geri yükleme yeni satın alma başlatmaz ve kullanıcıdan tekrar ücret istemez.
- Ağ veya mağaza erişilemiyorsa hata açıklanır, ücretsiz özellikler çalışmaya devam eder ve kullanıcı tekrar deneyebilir.
- Başka Listen AI hesabına bağlı bir işlem sessizce taşınmaz. Hesap kurtarma/destek akışı gösterilir; işlem ve hesap eşlemesi audit kaydıyla çözülür.

## Deneme, iptal ve iade

### Deneme

İlk kapalı betada deneme yoktur. İleride etkinleştirilirse:

- Uygunluğu mağaza belirler; uygulama kendi deneme sayacını üretmez.
- Deneme süresi, deneme sonrası yerelleştirilmiş fiyat ve otomatik yenilenme satın alma öncesinde açıkça gösterilir.
- Deneme yalnızca iki mağazada, backend'de ve kullanıcı metninde aynı koşullar tanımlandıktan sonra feature flag ile açılır.
- Deneme bitişi server notification ve mağaza durumuyla uzlaştırılır.

### İptal

- Abonelik yönetimi ilgili mağazanın sistem ekranına yönlendirilir.
- İptal genellikle yenilemeyi durdurur; doğrulanmış ücretli dönem sonuna kadar entitlement korunur.
- Uygulama “iptal edildi” ile “erişim sona erdi” durumlarını ayrı gösterir.

### İade ve revoke

- Mağazadan gelen doğrulanmış refund/revoke olayı entitlement'ı kaldırır.
- Hazır bulut seslerinin saklama politikası ayrıca uygulanır; yerel kullanıcı metni ve ücretsiz cihaz TTS'i silinmez veya kilitlenmez.
- Çakışan client/backend durumu güvenli biçimde sunucudan yeniden sorgulanır ve idempotent olarak düzeltilir.

## Sunucu bildirimleri ve uzlaştırma

- Apple için App Store Server Notifications V2 ve imzalı JWS doğrulaması kullanılır; V1 üzerine yeni entegrasyon kurulmaz.
- Google için Real-time Developer Notifications alınır ve her bildirimde Play Developer API üzerinden gerçek durum doğrulanır.
- Notification teslimi tek sefer varsayılmaz. Event işleme idempotenttir, tekrar ve sırasız teslimi destekler.
- Kaçırılmış bildirimler için periyodik reconciliation job çalışır.
- Mobil açılış/foreground sorgusu, backend bildirimi ve periyodik uzlaştırma birbirini tamamlar.
- Entitlement değişiklikleri içerik taşımayan audit kaydı üretir; hassas token değerleri loglanmaz.

## Hata ve güvenli fallback davranışı

- Mağaza ürünleri yüklenemezse uydurma fiyat veya satın alma butonu gösterilmez.
- Doğrulama zaman aşımında kullanıcıdan tekrar satın alması istenmez; işlem `checking` olarak yeniden sorgulanır.
- Backend erişilemezse yeni bulut işi başlatılmaz. Cihaz TTS'i ve yerel kütüphane çalışır.
- Abonelik sona erdiğinde yerel içerik silinmez; kullanıcı aynı metni ücretsiz cihaz sesiyle dinleyebilir.
- Billing kill switch paywall ve yeni satın alma başlatmayı kapatır; mevcut kullanıcıların mağaza yönetim/geri yükleme erişimini kaldırmaz.

## Test matrisi ve yayın kapısı

Aşağıdaki senaryolar Apple sandbox/TestFlight ve Google Play license tester/internal testing hesaplarında gerçek mağaza callback'leriyle geçmeden Pro açılmaz:

- aylık ve yıllık ilk satın alma;
- kullanıcının satın alma ekranını iptal etmesi;
- bekleyen ödemenin başarıya ve iptale dönmesi;
- yenileme, fiyat/plan değişimi ve dönem sonu;
- grace period, billing retry, pause ve hesap bekletme;
- otomatik yenilemeyi kapatma ve ücretli dönem sonuna kadar erişim;
- refund/revoke sonrası erişimin kaldırılması;
- uygulamayı silip yeniden kurduktan sonra geri yükleme;
- ikinci cihazda ve aynı/başka Listen AI hesabında geri yükleme;
- çevrimdışı, mağaza erişilemiyor, backend timeout ve tekrarlanan callback;
- uygulama kapalıyken gerçekleşen yenileme veya durum değişimi;
- log, analytics ve crash raporlarında purchase token, JWS veya kullanıcı içeriği bulunmaması.

Production açılışı için ayrıca fiyat/marj doğrulaması, kullanım kotası, provider maliyet kesicisi, gizlilik beyanı, kullanım koşulları ve destek/iadeye yönlendirme metni tamamlanmalıdır.

## Uygulama sırası

1. App Store Connect ve Play Console ürün kimlikleri, dönemleri ve mağaza metinleri onaylanır.
2. Backend transaction/entitlement şeması, doğrulama endpoint'leri ve idempotent event consumer geliştirilir.
3. Server Notifications V2 ve RTDN yalnızca staging ortamında bağlanır.
4. Mobilde ortak `BillingService` arayüzü ve platform adaptörleri development build'de eklenir.
5. Restore, hesap eşleme, hata ve yönetim ekranları tamamlanır.
6. Sandbox test matrisi otomatik ve manuel kanıtlarla geçirilir.
7. Fiyat/maliyet kararı sonrası remote flag ile küçük beta grubuna açılır; kill switch hazır tutulur.

## Resmî kaynaklar

- [Apple App Review Guidelines — In-App Purchase ve subscriptions](https://developer.apple.com/app-store/review/guidelines/)
- [Apple StoreKit 2](https://developer.apple.com/storekit/)
- [Apple currentEntitlements](https://developer.apple.com/documentation/storekit/transaction/currententitlements)
- [Apple App Store Server Notifications V2](https://developer.apple.com/documentation/appstoreservernotifications/receiving-app-store-server-notifications)
- [Google Play Billing entegrasyonu](https://developer.android.com/google/play/billing/integrate)
- [Google Play subscription yaşam döngüsü](https://developer.android.com/google/play/billing/subscriptions)
