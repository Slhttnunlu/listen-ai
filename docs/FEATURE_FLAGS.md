# Feature flag ve deney sözleşmesi

Feature flag yalnızca güvenli rollout, acil kapatma veya önceden tanımlanmış bir ürün hipotezini ölçmek için kullanılır. Tamamlanmamış özellikleri süresiz saklamak ya da kullanıcı gruplarına açıklanmayan farklı gizlilik davranışları uygulamak için kullanılmaz.

## İlk flag kataloğu

| Flag                          | Varsayılan | Amaç                                                  | Acil durumda                           |
| ----------------------------- | ---------- | ----------------------------------------------------- | -------------------------------------- |
| `tts.mac_local.enabled`       | `false`    | Geliştirme cihazlarında MacBook POC servisini denemek | Cihaz TTS'ine dön                      |
| `tts.openai.enabled`          | `false`    | Kontrollü bulut TTS rollout'u                         | Yeni işleri durdur, cihaz TTS'ine dön  |
| `tts.gemini.enabled`          | `false`    | Kontrollü bulut TTS rollout'u                         | Yeni işleri durdur, cihaz TTS'ine dön  |
| `tts.on_device_model.enabled` | `false`    | Cihaz içi model POC'si                                | Modeli başlatma, sistem TTS'ini kullan |

Production build'de deneysel flag'ler varsayılan olarak kapalıdır. Mobil paketteki varsayılan değer yalnızca güvenli fallback'tir; production rollout değeri backend/remote config üzerinden, kimliği doğrulanmış ve TLS korumalı olarak gelir. API anahtarı, sağlayıcı secret'ı veya kullanıcı içeriği flag payload'ına konulmaz.

## Değerlendirme ve güvenlik

1. Uygulama açılışında imzalı/sürümlü yapılandırma alınır ve kısa süreli cihaz cache'ine yazılır.
2. Yapılandırma alınamazsa süresi dolmuş deney değeri kullanılmaz; yerel güvenli varsayılan uygulanır.
3. Kullanıcı işi başladığında seçilen sağlayıcı iş boyunca sabitlenir. Flag değişikliği devam eden işi başka sağlayıcıya sessizce taşımaz.
4. Global kill switch kullanıcı segmentinden önce değerlendirilir.
5. Değişiklik; aktör, gerekçe, zaman, eski/yeni değer ve sona erme tarihiyle audit kaydına girer.
6. Production flag değiştirme yetkisi en az ayrıcalıkla sınırlandırılır; mobil istemci flag yazamaz.

## Rollout sırası

- internal: ekip/geliştirme cihazları;
- %5 kapalı beta: en az 24 saat ve minimum örnek koşulu;
- %25 kapalı beta;
- %50 kapalı beta;
- %100 uygun kullanıcılar.

Her aşamada [`OBSERVABILITY.md`](OBSERVABILITY.md) eşikleri izlenir. Kritik alarm, bütçenin %100'e ulaşması, içerik/secret sızıntısı veya sağlayıcı sözleşmesi ihlali rollout'u otomatik durdurur. Kill switch'in cihazlara ulaşma hedefi beş dakikadır; uzaktan yapılandırma yoksa API gateway ilgili sağlayıcıda yeni iş kabul etmez.

## İlk ölçülebilir hipotez

> Model tabanlı Türkçe TTS, cihaz TTS'ine göre dinlemeyi tamamlama oranını anlamlı biçimde artırırken p95 ilk ses süresini, hata oranını ve kullanıcı başına maliyeti kabul sınırlarında tutar.

Birincil metrik tamamlanan dinleme oranıdır. Koruma metrikleri p95 ilk ses süresi, TTS başarı oranı, crash-free session, kullanıcı başına maliyet ve fallback oranıdır. Deney başlamadan önce minimum örnek, süre ve “anlamlı iyileşme” eşiği analiz planına yazılır; sonuç görüldükten sonra değiştirilmez.

Kullanıcı açıkça bulut TTS'i seçmeden metni bulut sağlayıcıya gönderen deney yapılamaz. OpenAI ve Gemini kolları arasında kullanıcı metni sessizce paylaştırılmaz.

## Yaşam döngüsü

Her flag'in sahibi, oluşturulma nedeni, bitiş tarihi ve kaldırma işi bulunur. Deney kararı verildiğinde flag kalıcı ürün ayarına dönüştürülür veya koddan, uzaktan yapılandırmadan, izinlerden ve dashboard'lardan kaldırılır. Üç ay boyunca sahibi ya da aktif rollout'u olmayan flag teknik borç incelemesine girer.

## Kurulum kabul kapısı

Strateji belgesi gerçek feature flag kurulumu değildir. Production görevi ancak aşağıdakiler kanıtlandığında tamamlanır:

1. Development, staging ve production ortamları ayrıdır.
2. Yetkisiz değişiklik reddedilir ve yetkili değişiklik audit kaydı üretir.
3. Süresi dolmuş/bozuk yapılandırmada güvenli varsayılan kullanılır.
4. Kill switch beş dakika içinde yeni bulut işlerini durdurur; cihaz TTS'i çalışır.
5. Her sağlayıcı ayrı açılıp kapatılabilir ve devam eden işler sessizce taşınmaz.
