# TTS sağlayıcı dayanıklılığı ve maliyet sınırları

Bu belge MacBook Pro açık kaynak POC'si ile gelecekteki OpenAI/Google Gemini adaptörlerinin uyması gereken ortak davranışı tanımlar. Sağlayıcıya ait güncel model, fiyat ve kullanım şartları her deneme öncesi yeniden doğrulanır; mobil uygulama doğrudan sağlayıcı anahtarı taşımaz.

## Sağlayıcı sınırı

Her adaptör aynı iç arayüzü uygular:

- `estimate(request)`: karakter, tahmini ses süresi ve üst maliyet sınırı;
- `submit(request, idempotencyKey)`: sağlayıcı işi veya ses üretimini başlatma;
- `getStatus(providerJobId)`: destekleniyorsa işi sorgulama;
- `cancel(providerJobId)`: destekleniyorsa iptal;
- kontrollü hata sözlüğü: `invalid_input`, `rate_limited`, `timeout`, `provider_unavailable`, `budget_exceeded`.

Ham sağlayıcı yanıtı, kullanıcı metni, belge adı ve ses dosyası URL'si uygulama loguna yazılmaz. Adaptör yalnızca sağlayıcı adı, model sürümü, karakter kovası, süre, durum ve normalize hata kodu üretir.

## Zaman aşımı ve retry

Başlangıç varsayılanları ölçümle değiştirilmek üzere yapılandırılabilir tutulur:

| Aşama                      | Sınır | Davranış                                    |
| -------------------------- | ----: | ------------------------------------------- |
| DNS/TCP/TLS bağlantısı     |  3 sn | İstek gönderilmediyse bir retry             |
| Sağlayıcının isteği kabulü | 10 sn | İdempotency anahtarıyla en fazla iki retry  |
| Tek metin parçası üretimi  | 60 sn | İş durumu doğrulanır; kör retry yapılmaz    |
| Toplam kullanıcı işi       |  5 dk | İş iptal/failed olur, cihaz TTS önerilir    |
| Mobil API çağrısı          | 15 sn | `202` job sonrasında bağlantı açık tutulmaz |

Retry yalnızca `429`, bağlantı hatası, `502`, `503` ve `504` için; 1 sn ve 3 sn tabanlı exponential backoff + jitter ile en fazla iki kez yapılır. `Retry-After` daha uzunsa ona uyulur. Validation, authentication, kota ve içerik/politika hataları retry edilmez.

İstek sağlayıcıya ulaştı mı belirsizse yeni iş oluşturulmaz; önce idempotency anahtarıyla mevcut sonuç sorgulanır. Kullanıcı iptalinde polling ve planlanmış retry durdurulur.

## Circuit breaker ve fallback

- Aynı sağlayıcı/modelde 30 saniye içinde en az 10 isteğin 5'i transient hatayla biterse circuit 60 saniye açılır.
- Half-open durumda tek deneme yapılır; başarı kapanmasını, hata sürenin iki katına çıkmasını sağlar. Üst açık süre 10 dakikadır.
- Bir bulut sağlayıcısına gönderilmek üzere onaylanan metin başka bir sağlayıcıya sessizce aktarılmaz. Provider değişimi ayrıca kullanıcı onayı gerektirir.
- Varsayılan ve gizlilik açısından güvenli fallback cihaz TTS'idir. Üretilmiş ses varsa ağ hatasında yerel cache kullanılabilir.
- POC MacBook servisi erişilemiyorsa otomatik olarak cihaz TTS önerilir; production internete açıkmış gibi kabul edilmez.

## Kota ve maliyet koruması

İlk kontrollü POC varsayılanları:

| Limit                      | Başlangıç değeri |
| -------------------------- | ---------------: |
| Tek bulut isteği           |  20.000 karakter |
| Kullanıcı başına günlük    |  20.000 karakter |
| Kullanıcı başına aylık     | 200.000 karakter |
| Eşzamanlı aktif iş         |                2 |
| POC proje aylık sert bütçe |  50 USD eşdeğeri |

Bu değerler ürün fiyatı değildir. Provider fiyatı değiştiğinde `estimate` güncellenir ve istek kabul edilmeden önce en kötü durum maliyeti rezerve edilir. İş tamamlanınca gerçek kullanım rezervasyonla uzlaştırılır; başarısız/iptal işin kullanılmayan rezervasyonu bırakılır.

- Proje bütçesinin %70'inde uyarı, %90'ında kritik uyarı oluşur.
- %100'de yeni bulut işleri otomatik reddedilir; cihaz TTS çalışmaya devam eder.
- Kullanıcı kotası atomik sayaçla uygulanır; paralel isteklerle aşılamaz.
- Admin override süreli, gerekçeli ve audit kayıtlıdır; limitsiz anahtar yoktur.
- Maliyet metriği kullanıcı metni veya tam kullanıcı kimliği içermez; döndürülemez iç kimlik kullanır.

## POC kabul ölçümleri

Her motor aynı sabit, telifsiz Türkçe test setiyle en az kısa, orta, uzun, sayı/tarih, kısaltma ve yabancı özel ad sınıflarında ölçülür:

- başarılı üretim oranı;
- ilk byte/ilk ses ve toplam üretim süresi p50/p95;
- gerçek zaman katsayısı (üretim süresi / ses süresi);
- 1.000, 10.000 ve 100.000 karakter tahmini maliyeti;
- manuel doğallık ve telaffuz puanı;
- üretilen dosya boyutu ve cache isabeti;
- fallback sayısı ve normalize hata dağılımı.

Production sağlayıcısı ancak lisans/gizlilik incelemesi, sert bütçe testi, hata enjeksiyonu ve cihaz TTS fallback kabul testi tamamlandıktan sonra seçilebilir.
