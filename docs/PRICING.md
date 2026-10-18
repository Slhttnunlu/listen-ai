# Listen AI Pro fiyatlandırma ve marj modeli

**Durum:** Karar modeli hazır; satış fiyatı ve sağlayıcı seçimi yapılmadı

**Fiyat kaynağı kontrol tarihi:** 18 Ekim 2026

Bu belge gelecekteki Pro katmanının fiyatını sağlayıcı maliyeti, mağaza kesintisi, altyapı, destek ve hedef katkı marjına göre doğrulamak için kullanılacak modeli tanımlar. Buradaki oranlar fiyat vaadi değildir; sağlayıcı ve mağaza tarifeleri değiştiği için production kararı öncesinde yeniden doğrulanır.

## Ön koşul

Kapalı betada abonelik veya ücretli bulut TTS bulunmaz. Fiyatlandırma ancak aşağıdaki girdiler staging ölçümleriyle elde edildikten sonra onaylanabilir:

- aynı Türkçe test setinde gerçek input/output token, karakter ve ses süresi;
- başarılı, tekrar denenmiş, iptal edilmiş ve cache'ten karşılanmış iş oranı;
- kullanıcı başına p50, p90 ve p95 aylık tüketim;
- ses depolama, indirme/egress ve job altyapısı maliyeti;
- destek talebi oranı ve talep başına ortalama maliyet;
- mağazanın gerçek ülke, vergi ve komisyon sonrası proceeds raporu.

Bir sağlayıcının liste fiyatını karakter/dakika tahminiyle doğrudan satış kotasına çevirmek kabul edilmez. Türkçe tokenizasyonu, konuşma hızı, noktalama, retry ve cache etkisi gerçek job telemetry'sinden ölçülür.

## 18 Ekim 2026 liste fiyatı anlık görüntüsü

| Sağlayıcı/model                 | Resmî ölçüm birimi        | Liste fiyatı                        | Karar notu                                                                    |
| ------------------------------- | ------------------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| OpenAI `tts-1`                  | 1 milyon input karakter   | 15 USD                              | 6 Ocak 2027 kaldırılacağı duyuruldu; yeni production seçimi olamaz            |
| OpenAI `gpt-4o-mini-tts`        | 1 milyon text/audio token | 0,60 USD input, 12 USD audio output | Mevcut snapshot'lar 6 Ocak 2027 deprecation listesinde; replacement ölçülmeli |
| Gemini 3.8 Flash-Lite TTS       | 1 milyon text/audio token | 0,50 USD input, 6 USD audio output  | Bu promosyon oranları 31 Aralık 2026'ya kadar; 2027'de 1/12 USD               |
| ElevenLabs Flash/Turbo          | 1.000 karakter            | 0,05 USD                            | Sayfa yaklaşık 1.000 karakter ≈ 1 dakika varsayımı gösteriyor                 |
| ElevenLabs v3 / v2 Multilingual | 1.000 karakter            | 0,10 USD                            | Vergiler hariç; Türkçe kalite ve uzun metin testi yapılmalı                   |

Gemini dokümantasyonu audio çıktısını saniyede 25 token olarak açıklar. Örneğin 200 dakika üretilmiş ses yaklaşık 300.000 audio token eder; 2026 sonuna kadarki 6 USD/milyon oranıyla yalnızca audio output maliyeti yaklaşık 1,80 USD, 2027 oranıyla yaklaşık 3,60 USD olur. Bu örnek input, retry, başarısız çağrı, vergi, depolama ve egress içermez.

ElevenLabs'ın yaklaşık 1.000 karakter/dakika varsayımıyla 200.000 karakterin liste maliyeti Flash/Turbo için 10 USD, v3/v2 Multilingual için 20 USD'dir. Bu, mevcut 200.000 karakterlik POC kotasının her sağlayıcıda aynı satış paketine dönüşemeyeceğini gösterir.

OpenAI deprecation takvimi nedeniyle replacement olarak belirtilen modelin güncel fiyatı ve metin → ses üretimine uygun endpoint'i POC başlamadan tekrar incelenmelidir. Deprecated modele göre uzun vadeli fiyat veya mimari taahhüdü verilmez.

## Mağaza ve dağıtım maliyetleri

- Apple Developer Program üyeliği şu anda yıllık 99 USD'dir.
- Apple genel dijital ürün komisyonu %30'dur; Small Business Program gibi uygun programlarda %15 olabilir. Programa kabul kanıtlanana kadar finansal model %30 senaryosunu taşır.
- Google Play otomatik yenilenen abonelikler için genel tabloda %15 hizmet bedeli gösterir. Bölgesel/yeni kurallar nedeniyle gerçek Play Console koşulu yayın öncesinde doğrulanır.
- Mağaza proceeds değeri müşteri fiyatından vergi ve komisyon düşüldükten sonradır. Finansal doğrulamada tahmini brüt fiyat yerine gerçek proceeds raporu kullanılır.
- İade, chargeback, kur dönüşümü ve stopaj/KDV etkisi ayrı rezerv olarak modele girer.

## Hesaplama modeli

Bir platform ve ay için:

```text
net_revenue
  = paid_users × localized_price × (1 - tax_rate) × (1 - store_fee_rate)

billable_tts_cost
  = provider_input_cost
  + provider_output_cost
  + retry_cost
  - cache_saving

contribution
  = net_revenue
  - billable_tts_cost
  - storage_and_egress
  - backend_and_observability
  - support_cost
  - refund_and_fx_reserve

contribution_margin
  = contribution / net_revenue
```

Sabit operasyon maliyeti aktif ödeme yapan kullanıcıya bölünür, ancak düşük kullanıcı sayısında yapay biçimde kaybolmaması için ayrıca toplam aylık nakit bütçesi olarak izlenir.

## Başlangıç karar kapıları

Aşağıdaki değerler ürün kararı için başlangıç varsayımıdır; beta verisiyle değiştirilebilir:

- p90 kullanıcı tüketiminde en az %65 katkı marjı;
- ortalama kullanıcı tüketiminde en az %75 katkı marjı;
- p95 tüketimde dahi kullanıcı başına maliyetin net geliri aşmaması;
- global sağlayıcı sert bütçesinin aşılamaması ve sessiz ek ücret oluşmaması;
- aylık planın tek kötüye kullanım kullanıcısında sınırsız maliyet üretmemesi;
- yıllık indirim sonrası p90 marjının aylık plandan belirlenen alt sınıra düşmemesi.

Bu eşikler muhasebe standardı değil, Listen AI için önerilen ürün güvenlik sınırıdır. Ürün sahibi gerçek edinme, destek ve retention verisiyle hedefleri yazılı olarak onaylar.

## Kota tasarımı

İlk ücretli paket “sınırsız” olarak sunulmaz. Satılabilir kota aşağıdaki yöntemle seçilir:

1. Aynı Türkçe corpus her aday sağlayıcıda en az üç kez üretilir.
2. Gerçek provider faturası/usage metriği job kimliğiyle eşleştirilir.
3. Cache hit, retry ve başarısız iş maliyetleri dahil etkin maliyet hesaplanır.
4. 10k, 50k, 100k ve 200k karakter senaryoları mağaza ve altyapı maliyetiyle modellenir.
5. Ortalama, p90 ve p95 kullanıcı için katkı marjı hesaplanır.
6. En düşük güvenli kota remote config/backend üzerinden tanımlanır; mobil build'e gömülmez.

Kota dolduğunda yeni cloud işi durur; kullanıcıdan otomatik aşım ücreti alınmaz ve cihaz TTS'i ücretsiz fallback olarak kalır.

## Aylık çalışma tablosu

Her fiyat incelemesinde aşağıdaki tablo gerçek verilerle doldurulur:

| Girdi                                       | iOS aylık | iOS yıllık/12 | Android aylık | Android yıllık/12 |
| ------------------------------------------- | --------: | ------------: | ------------: | ----------------: |
| Yerelleştirilmiş müşteri fiyatı             |           |               |               |                   |
| Vergi sonrası fiyat                         |           |               |               |                   |
| Mağaza kesintisi                            |           |               |               |                   |
| Net proceeds                                |           |               |               |                   |
| Ortalama/p90/p95 TTS maliyeti               |           |               |               |                   |
| Storage + egress                            |           |               |               |                   |
| Backend + gözlemlenebilirlik                |           |               |               |                   |
| Destek + iade/kur rezervi                   |           |               |               |                   |
| Katkı marjı                                 |           |               |               |                   |
| Kullanıcı başına aylık karakter/dakika kota |           |               |               |                   |

Boş hücreler tahminle tamamlanıp “doğrulandı” sayılmaz. Tarih, para birimi, kur kaynağı, sağlayıcı model sürümü ve mağaza programı her çalışma tablosuna eklenir.

## Onay ve değişiklik süreci

- Liste fiyatları ve deprecation sayfaları POC başlangıcında ve satışa açılmadan hemen önce yeniden kontrol edilir.
- Fiyat/kota değişikliği ürün, teknik ve finansal varsayımları içeren kısa bir karar kaydıyla yapılır.
- Mevcut abonenin korunmuş fiyatı ve mağaza onay/notification akışı `BILLING.md` ile birlikte değerlendirilir.
- Provider değişimi feature flag ile yapılır; marj ve kalite aynı test penceresinde karşılaştırılır.
- Maliyet metriği eksik veya gecikmişse cloud rollout büyütülmez.

## Fiyatı onaylamak için eksik kanıtlar

- OpenAI replacement, Gemini ve ElevenLabs Türkçe kalite/gecikme POC sonuçları;
- gerçek API usage/fatura eşleşmesi;
- staging backend, cache, storage ve egress ölçümleri;
- Apple/Google geliştirici hesabındaki geçerli komisyon ve ülke fiyat noktaları;
- beta kullanıcılarının aylık tüketim dağılımı ve ödeme isteği;
- destek, iade ve vergi/kur rezervi.

Bu kanıtlar olmadan `TASKS.md` içindeki fiyatlandırma görevi açık kalır.

## Resmî kaynaklar

- [OpenAI TTS model fiyatı](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts)
- [OpenAI model deprecation takvimi](https://developers.openai.com/api/docs/deprecations)
- [OpenAI text-to-speech rehberi](https://developers.openai.com/api/docs/guides/text-to-speech)
- [Gemini Developer API fiyatları](https://ai.google.dev/gemini-api/docs/pricing)
- [ElevenLabs API fiyatları](https://elevenlabs.io/pricing/api)
- [Apple Developer Program fiyat ve komisyon özeti](https://developer.apple.com/programs/whats-included/)
- [Apple proceeds açıklaması](https://developer.apple.com/help/app-store-connect/getting-paid/view-payments-and-proceeds)
- [Google Play hizmet bedelleri](https://support.google.com/googleplay/android-developer/answer/112622)
