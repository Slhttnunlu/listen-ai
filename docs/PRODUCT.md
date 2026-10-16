# Listen AI — Ürün Tanımı ve Başarı Metrikleri

## Ürün cümlesi

Listen AI; uzun metin, not ve makaleleri ekrana bağlı kalmadan dinlemek isteyen Türkçe konuşan kullanıcıların, içeriklerini cihaz üzerinde hızlıca sese dönüştürmesini sağlar.

## İlk kullanım senaryosu

Kullanıcı uygulamayı açar, bir metin yazar/yapıştırır veya TXT dosyası seçer, **Kaydet ve Dinle** düğmesine basar ve uygulamaya daha sonra döndüğünde kaldığı yerden devam eder.

## İlk yayın başarı metrikleri

| Metrik                     | Tanım                                                           | İlk hedef           |
| -------------------------- | --------------------------------------------------------------- | ------------------- |
| İlk dinleme başlatma oranı | İlk oturumda `playback_started` üreten cihazlar / yeni cihazlar | ≥ %60               |
| Başarılı dinleme başlatma  | Hatasız başlayan dinlemeler / tüm başlatma denemeleri           | ≥ %98               |
| İlk haftada geri dönüş     | Kurulumdan sonraki 7 gün içinde tekrar açan kullanıcı           | ≥ %25               |
| Tamamlama oranı            | `playback_completed` / `playback_started`                       | Baz değer ölçülecek |
| Crash-free session         | Çökmesiz oturum / tüm oturum                                    | ≥ %99,5             |

Metrikler beta döneminde doğrulanır; hedefler kullanıcı metinleri veya dosya içerikleri analytics sistemine gönderilmeden hesaplanır.

## Analytics event sözleşmesi

| Event                | İzin verilen alanlar                              |
| -------------------- | ------------------------------------------------- |
| `app_opened`         | `app_version`, `platform`, `locale`               |
| `text_created`       | `source: typed/pasted/txt`, `length_bucket`       |
| `playback_started`   | `rate`, `voice_locale`, `length_bucket`, `resume` |
| `playback_stopped`   | `progress_bucket`, `reason`                       |
| `playback_completed` | `length_bucket`, `duration_bucket`                |
| `feature_error`      | `feature`, `error_code`, `app_version`            |

Yasak alanlar: metin içeriği, başlık, dosya adı, e-posta adresi, cihaz sahibinin adı, tam dosya yolu ve kullanıcı tarafından yazılan serbest hata açıklaması.
