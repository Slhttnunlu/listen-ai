# Gözlemlenebilirlik, dashboard ve alarm sözleşmesi

Bu sözleşme mevcut yerel beta ile gelecekteki backend/TTS servisinin hangi sinyalleri üreteceğini tanımlar. Bir izleme sağlayıcısı ve production ortamı henüz bağlı değildir; dashboard kurulumu bu sözleşmeden sonra yapılacaktır.

## Veri minimizasyonu

Metrik, log, trace ve crash raporunda şu alanlar yasaktır:

- kullanıcı metni, başlık, belge/dosya adı ve dosya yolu;
- e-posta, ad, access/refresh token, API key ve Authorization header;
- ses dosyasının imzalı URL'si veya ham sağlayıcı response'u;
- kullanıcı tarafından girilmiş serbest açıklama.

İzin verilen ortak alanlar: `environment`, `app_version`, `build`, `platform`, `os_major`, `provider`, `model`, `operation`, `status`, kontrollü `error_code`, `duration_bucket`, `length_bucket`, `request_id` ve döndürülemez iç kullanıcı kimliği. URL query/body ve header değerleri telemetry başlamadan önce drop edilir.

## Metrikler ve paneller

### Mobil kalite

- crash-free session ve crash-free user;
- `playback_started / playback_attempted`;
- ilk sese kadar süre p50/p95;
- cihaz TTS hata/fallback oranı;
- sürüm ve platforma göre aktif beta cihazı.

### API ve worker

- request hacmi, p50/p95/p99 gecikme ve kontrollü hata oranı;
- TTS job queued/processing/completed/failed/cancelled sayıları;
- queue depth ve en eski iş yaşı;
- sağlayıcı/model bazında başarı, timeout, retry, circuit durumu;
- üretilen karakter/ses süresi, cache isabeti ve tahmini/gerçek maliyet;
- kullanıcı/proje kota reddi ve günlük/aylık bütçe kullanımı.

Dashboard; **Mobile health**, **API/queue**, **TTS providers** ve **Cost/quota** olmak üzere dört görünümden oluşur. Production ve staging aynı panelde toplanmaz; varsayılan filtre production'dır.

## İlk alarm eşikleri

| Sinyal                      |            Uyarı |           Kritik | Pencere / aksiyon                                    |
| --------------------------- | ---------------: | ---------------: | ---------------------------------------------------- |
| Crash-free session          |           <%99,5 |           <%99,0 | 30 dk; sürüm/platform kırılımı, rollout durdur       |
| Dinleme başlatma başarısı   |             <%98 |             <%95 | 15 dk ve ≥50 deneme; cihaz TTS akışını kontrol et    |
| API 5xx oranı               |              >%2 |              >%5 | 5 dk ve ≥100 istek; on-call/rollback değerlendirmesi |
| API p95 gecikme             |            >1 sn |            >2 sn | 10 dk; endpoint/provider kırılımı                    |
| TTS job başarı oranı        |             <%98 |             <%95 | 15 dk ve ≥20 iş; circuit/fallback kontrolü           |
| En eski queued job          |           >60 sn |          >180 sn | 5 dk; worker kapasitesi/kuyruk kontrolü              |
| Provider timeout            |              >%3 |             >%10 | 10 dk ve ≥20 çağrı; circuit aç/fallback sun          |
| Günlük/aylık bütçe          |             ≥%70 |             ≥%90 | Anlık; %100'de yeni bulut işi durdur                 |
| Kota reddi                  | Baz değerin 2×'i | Baz değerin 5×'i | 30 dk; abuse veya yanlış plan kontrolü               |
| Gizli içerik/secret sinyali |                — |               ≥1 | Derhal; telemetry akışını durdur ve incident aç      |

Düşük beta trafiğinde minimum örnek koşulu karşılanmıyorsa oran alarmı yerine tekil kritik hata ve günlük manuel inceleme kullanılır. Eşikler dört haftalık beta baz değeri sonrası karar kaydıyla güncellenir.

## Alarm yönlendirme

- Kritik alarmlar incident sahibine anında; uyarılar çalışma saatlerinde operasyon kanalına gider.
- Aynı kök neden tek incident altında gruplanır; her kullanıcı/istek için ayrı bildirim üretilmez.
- Alarm; runbook bağlantısı, ortam, sürüm, sağlayıcı, başlangıç zamanı ve güvenli request ID örneği içerir.
- Bildirime payload, kullanıcı içeriği veya secret eklenmez.
- Gizlilik/veri kaybı ve yaygın açılmama SEV-1; temel akış/provider bozulması SEV-2; sınırlı bozulma SEV-3 olarak [`RELEASE_OPERATIONS.md`](RELEASE_OPERATIONS.md) sürecine girer.

## Kurulum kabul kapısı

Dashboard görevi ancak aşağıdakiler kanıtlandığında tamamlanmış sayılır:

1. Staging sentetik metinle her panelde veri üretir.
2. Uyarı ve kritik eşikleri kontrollü hata enjeksiyonuyla tetiklenir.
3. İçerik/secret canary değeri hiçbir log, metric, trace ve crash raporunda bulunmaz.
4. Bütçe %100 senaryosu bulut işini durdururken cihaz TTS çalışır.
5. Incident bildirimi doğru runbook ve sürüm bağlamını taşır.
