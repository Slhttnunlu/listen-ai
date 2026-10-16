# Backend API sözleşmesi

Makine tarafından okunabilir başlangıç sözleşmesi [`api/openapi.yaml`](api/openapi.yaml) dosyasındadır. Backend uygulanmadan önce mobil ve backend değişiklikleri bu dosya üzerinden birlikte gözden geçirilmelidir.

## Sürümleme

- Büyük ve geriye uyumsuz değişiklikler URL sürümüyle yayınlanır: `/v1`, `/v2`.
- Geriye uyumlu alan eklemeleri aynı büyük sürümde yapılabilir. İstemci bilmediği response alanlarını yok saymalıdır.
- Alan kaldırma veya anlam değiştirme yeni büyük sürüm gerektirir.
- Kullanımdan kaldırılan sürüm için mağaza sürüm geçiş süresi dikkate alınarak en az 90 gün önceden bildirim yapılır.

## İstek davranışı

- Tüm istekler HTTPS kullanır ve `X-Request-Id` response header'ı döndürür.
- Yazma istekleri UUID biçiminde `Idempotency-Key` taşır. Aynı kullanıcı, endpoint ve anahtarla yinelenen istek aynı işi döndürür.
- Mobil istemci API çağrısını 15 saniyede sonlandırır. Uzun TTS/AI üretimi HTTP bağlantısında bekletilmez; `202 Accepted` ile job oluşturulur ve durum sorgulanır.
- Job durum sorgusu ilk 5 saniye sonra başlar; `Retry-After` varsa ona uyulur. Aralık en fazla 30 saniyeye kadar üstel olarak artırılır.
- `429`, `502`, `503` ve `504` yanıtları yalnızca idempotent isteklerde, jitter eklenmiş en fazla iki retry ile denenir.
- Diğer `4xx` yanıtları otomatik denenmez. Kullanıcı iptal ettiğinde bekleyen sorgu durdurulur.

## Hata sözleşmesi

Hatalar serbest metin yerine kararlı bir `code`, kullanıcıya gösterilebilir Türkçe `message`, `request_id` ve gerektiğinde güvenli `details` taşır. İçerik, dosya adı, e-posta veya sağlayıcı ham hata mesajı response/log içine konulmaz.

İlk kod sözlüğü:

| Kod                       | HTTP | İstemci davranışı                    |
| ------------------------- | ---: | ------------------------------------ |
| `validation_failed`       |  400 | Alan hatasını göster, retry yapma    |
| `authentication_required` |  401 | Oturumu yenile veya giriş iste       |
| `quota_exceeded`          |  403 | Kota bilgisini göster                |
| `job_not_found`           |  404 | Yerel job kaydını kapat              |
| `conflict`                |  409 | Güncel durumu yeniden getir          |
| `rate_limited`            |  429 | `Retry-After` süresine uy            |
| `provider_unavailable`    |  503 | Yerel TTS öner; sınırlı retry uygula |
| `internal_error`          |  500 | Request ID ile genel hata göster     |

## İçerik güvenliği

- Metin yalnızca açık kullanıcı aksiyonuyla gönderilir.
- API gateway ve uygulama loglarında request/response body kaydı kapalıdır.
- İlk sözleşmede metin uzunluğu 20.000 karakterle sınırlıdır; daha büyük içerik bölümleme sözleşmesi eklenmeden gönderilmez.
- Üretilen ses URL'si kısa ömürlü ve kullanıcıya bağlı imzalı URL olmalıdır.
- Job ve ses dosyası için saklama süresi backend uygulama ADR'sinde kesinleştirilir ve response içinde `expires_at` ile görünür olur.
