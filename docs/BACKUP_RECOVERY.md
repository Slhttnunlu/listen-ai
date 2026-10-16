# Yedekleme, geri yükleme ve veri kaybı tasarımı

## Mevcut kapalı beta

Kütüphane yalnızca cihazdaki SQLite veritabanında tutulur. Ayarlar'daki JSON dışa aktarma kullanıcı kontrollü taşınabilir kopyadır; otomatik bulut yedeği değildir. Kullanıcı aynı şema sürümündeki JSON'u mevcut kayıtları silmeden geri içe aktarabilir; dosya kaybolursa veya dışa aktarma güncel değilse kurtarma garanti edilemez.

### Riskler ve mevcut davranış

| Senaryo                         | Mevcut sonuç                | Kullanıcı yönlendirmesi                                    | Ürün aksiyonu                                 |
| ------------------------------- | --------------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| Tek kaydı yanlışlıkla silme     | 30 gün soft-delete          | Hemen **Geri al** kullan                                   | Süre dolana kadar başlangıçta temizleme       |
| “Tüm yerel verileri sil”        | Onay sonrası kalıcı silme   | İşlem öncesi JSON dışa aktar                               | Uyumlu JSON yedeğini birleştirerek geri yükle |
| Uygulamayı kaldırma/cihaz kaybı | Sandbox verisi kaybolabilir | Önemli içeriği kaynak dosyada ve dışa aktarımda tut        | Bulut yedeği varmış gibi vaat etme            |
| SQLite migration hatası         | Açılış/kütüphane hatası     | Uygulamayı silmemesini, destek kanalını kullanmasını söyle | Veri silmeden ileri uyumlu hotfix çıkar       |
| Bozuk dışa aktarma dosyası      | İçe aktarma reddedilir      | Orijinal dosyayı koru                                      | Mevcut kütüphaneyi değiştirme                 |

## Yerel geri yükleme kabul kuralları

Mevcut birleştirme akışı aşağıdaki kuralları uygular; gelecekte “tümünü değiştir” seçeneği eklenirse aynı güvenlik sınırları korunmalıdır:

1. Yalnızca uygulamanın sürümlenmiş JSON şeması kabul edilir; boyut, alan tipi ve zorunlu alanlar doğrulanır.
2. Dosya önce bellekte/geçici alanda parse edilir; mevcut kütüphane doğrulama bitmeden değiştirilmez.
3. Kullanıcıya eklenecek ve mükerrer olduğu için atlanacak kayıt sayısı gösterilir; yalnızca **birleştir** desteklenir.
4. İçerik hash'iyle aynı kayıtlar çoğaltılmaz. Kimlikler dosyadan güvenilir kabul edilmez; cihazda yeniden üretilir.
5. İçe aktarma tek SQLite transaction'ında yapılır. Hata halinde tamamı rollback edilir.
6. Şema sürümü daha yeniyse işlem güvenli biçimde reddedilir; bilinmeyen alanlar loglanmaz.
7. Geri yükleme mevcut kayıtları silmez; “tümünü değiştir” ileride eklenirse önce yeni dışa aktarım önerilir ve ayrı açık onay gerekir.
8. Bozuk, aşırı büyük ve kötü amaçlı fixture'larla otomatik test; iki platform gerçek cihaz kabul testi release öncesi gerekir.

## Gelecek backend yedekleri

Hesap/senkronizasyon devreye girmeden önce altyapı ADR'siyle şu değerler kesinleştirilir:

- EU bölgesinde, servis verisinden ayrı hesapta şifreli ve erişimi en dar yedek;
- production verisinin development/staging'e kopyalanmaması;
- ilk hedef olarak metadata için **RPO ≤ 24 saat**, **RTO ≤ 8 saat**;
- günlük otomatik yedek, en az 30 günlük retention ve sağlayıcı bağımsız kurtarma kopyası;
- anahtar rotasyonu, yedek erişim audit kaydı ve iki kişili production onayı;
- hesap silme/retention yükümlülüklerinin yedeklerde uygulanacağı süre ve yöntem;
- üç ayda bir izole ortama geri yükleme tatbikatı; kayıt sayısı/hash ve referans bütünlüğü doğrulaması.

Ham metin veya üretilmiş ses bulutta tutulmuyorsa yedeğe de girmez. Tutulması gerekirse amaç, süre, bölge, şifreleme ve silme davranışı [`DATA_INVENTORY.md`](DATA_INVENTORY.md) ile gizlilik politikasında önceden açıklanır.

## Kurtarma tatbikatı kaydı

Her tatbikatta tarih, artifact kimliği, hedef ortam, geri yükleme süresi, doğrulanan kayıt sayısı, başarısız kontroller ve düzeltme sahibi kaydedilir. Gerçek kullanıcı içeriği ekran görüntüsüne veya issue'ya eklenmez.
