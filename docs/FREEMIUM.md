# Listen AI freemium ve kapalı beta sınırları

**Durum:** Kapalı beta kararı  
**Kapsam:** Bulut TTS/AI ve mağaza aboneliği açılmadan önceki ürün

Bu belge ücretsiz ürün ile gelecekteki Pro katmanının sınırını tanımlar. Amaç, henüz çalışmayan veya maliyeti doğrulanmamış bir özelliği kullanıcıya satmamak ve temel erişilebilirlik akışını ödeme duvarının arkasına koymamaktır.

## Kapalı beta: ücretsiz ve cihaz içinde

Kapalı beta sürümünde abonelik, ödeme ekranı ve satın alma bulunmaz. Aşağıdaki özellikler ücretsizdir ve sağlayıcı kotası taşımaz:

| Alan               | Ücretsiz beta davranışı                                             | Teknik güvenlik sınırı                                    |
| ------------------ | ------------------------------------------------------------------- | --------------------------------------------------------- |
| Metin yaz/yapıştır | Cihazın sistem sesiyle sınırsız dinleme                             | Tek kütüphane kaydı en fazla 250.000 karakter             |
| Ses seçimi         | Cihazda kurulu Türkçe sistem seslerinin tümü                        | İşletim sisteminin sunduğu seslerle sınırlı               |
| Kütüphane          | Yerel kaydetme, ilerleme, favori, arama, JSON yedekleme             | Birleştirilen yedekte en fazla 5.000 kayıt ve 10 MB dosya |
| TXT                | Cihazda içe aktarma ve dinleme                                      | En fazla 2 MB                                             |
| DOCX/PDF           | Desteklenen metni cihazda çıkarma; büyük metni ayrı kayıtlara bölme | Dosya başına 10 MB; bölüm başına 250.000 karakter         |
| Kamera/galeri OCR  | Görseli cihaz içinde Türkçe metne çevirme                           | Görsel başına 15 MB; kaynak görsel kalıcı saklanmaz       |
| Offline kullanım   | Kütüphane ve cihaz TTS ağ olmadan çalışır                           | Bulut özelliğine bağımlı değildir                         |

Bu sınırlar gelir kısıtı değildir; cihaz belleğini, dosya işleme süresini ve bozuk/verimsiz girdileri kontrol eden teknik sınırlardır. Ücretsiz temel metin dinleme ve mevcut yerel erişilebilirlik özellikleri ileride de korunur.

MacBook Pro üzerinde çalışan Chatterbox servisi yalnızca geliştirme POC'sidir. Beta kullanıcılarına sunulan bir ücretsiz veya Pro özellik değildir; uygulama mağazası build'inde servis adresi yapılandırılmaz.

## Bulut TTS ve AI için gelecekteki Pro sınırı

Doğal bulut sesleri, AI özetleme ve podcast üretimi değişken sağlayıcı maliyeti oluşturur. Bu özellikler ancak backend, kullanıcı kimliği, kota, maliyet ölçümü, gizlilik onayı ve mağaza aboneliği birlikte hazır olduğunda Pro adayıdır.

İlk teknik POC üst sınırları şunlardır; bunlar satış paketine veya kullanıcı vaadine dönüşmüş fiyatlandırma değildir:

| Kontrol                           |       POC sınırı |
| --------------------------------- | ---------------: |
| Tek bulut TTS işi                 |  20.000 karakter |
| Kullanıcı başına günlük bulut TTS |  20.000 karakter |
| Kullanıcı başına aylık bulut TTS  | 200.000 karakter |
| Eşzamanlı aktif iş                |                2 |
| Tüm POC için aylık sert bütçe     |  50 USD eşdeğeri |

Satılabilir Pro kotası; OpenAI, Gemini, ElevenLabs ve uygun self-hosted seçeneğin aynı test setindeki kalite, gecikme ve gerçek maliyet ölçümleri tamamlandıktan sonra belirlenir. Kota uygulama içine sabit yazılmaz; backend/remote config üzerinden sürümlenir. Kullanıcı, satın almadan önce aylık karakter veya dakika hakkını, yenilenme tarihini ve kota aşımındaki davranışı açıkça görür.

## Kota bittiğinde davranış

- Yeni bulut işi başlamaz ve kullanıcıdan sessizce ek ücret alınmaz.
- Hazır ve süresi dolmamış ses segmentleri kullanılabilir kalır.
- Kullanıcıya kotanın ne zaman yenileneceği gösterilir.
- Aynı metin cihazın sistem sesiyle ücretsiz dinlenebilir.
- Metin başka bir cloud sağlayıcısına kullanıcı onayı olmadan aktarılmaz.
- Yerel kütüphane, belge içe aktarma ve cihaz OCR işlevleri etkilenmez.

## Pro'yu açma kapıları

Pro etiketi, ödeme ekranı veya deneme süresi ancak aşağıdakilerin tümü kanıtlandığında açılır:

1. Seçilen sağlayıcının Türkçe kalite ve lisans/gizlilik incelemesi tamamlanmıştır.
2. Kullanıcı başına atomik kota, maliyet rezervasyonu/uzlaştırması ve proje sert bütçe kesicisi staging'de test edilmiştir.
3. Provider secret'ları yalnızca backend secret manager'dadır; mobil build ve loglarda bulunmadığı doğrulanmıştır.
4. Bulut gönderimi için açık bilgilendirme/onay ve veri silme/saklama süreleri yayınlanmıştır.
5. StoreKit ve Google Play Billing satın alma, iptal ve geri yükleme akışları gerçek sandbox hesaplarında geçmiştir.
6. Provider veya backend hatasında cihaz TTS fallback'i ve kill switch doğrulanmıştır.
7. Sağlayıcı maliyeti, mağaza komisyonu, vergi ve destek dahil hedef brüt marj belgelenmiştir.

Bu kapılar geçilmeden uygulama yalnızca ücretsiz kapalı beta olarak dağıtılır; “Pro”, “ücretsiz deneme” veya sınırsız bulut ses vaadi kullanıcı arayüzünde gösterilmez.

StoreKit/Google Play Billing satın alma, iptal, deneme ve geri yükleme durumları [abonelik ve entitlement tasarımında](BILLING.md) tanımlanmıştır.

Satılabilir kota ve fiyatın hangi maliyet/marj kanıtlarıyla onaylanacağı [Pro fiyatlandırma modelinde](PRICING.md) açıklanmıştır.
