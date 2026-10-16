# Yedekleme, geri yükleme ve veri kaybı tasarımı

## Mevcut kapalı beta

Kütüphane yalnızca cihazdaki SQLite veritabanında tutulur. Ayarlar'daki JSON dışa aktarma kullanıcı kontrollü taşınabilir kopyadır; otomatik bulut yedeği değildir. Mevcut sürüm JSON'u uygulamaya geri içe aktarmadığı için dışa aktarma bir kurtarma garantisi olarak sunulmaz.

### Riskler ve mevcut davranış

| Senaryo                         | Mevcut sonuç                | Kullanıcı yönlendirmesi                                    | Ürün aksiyonu                               |
| ------------------------------- | --------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| Tek kaydı yanlışlıkla silme     | 30 gün soft-delete          | Hemen **Geri al** kullan                                   | Süre dolana kadar başlangıçta temizleme     |
| “Tüm yerel verileri sil”        | Onay sonrası kalıcı silme   | İşlem öncesi JSON dışa aktar                               | Otomatik geri yükleme yok                   |
| Uygulamayı kaldırma/cihaz kaybı | Sandbox verisi kaybolabilir | Önemli içeriği kaynak dosyada ve dışa aktarımda tut        | Bulut yedeği varmış gibi vaat etme          |
| SQLite migration hatası         | Açılış/kütüphane hatası     | Uygulamayı silmemesini, destek kanalını kullanmasını söyle | Veri silmeden ileri uyumlu hotfix çıkar     |
| Bozuk dışa aktarma dosyası      | Geri içe aktarma yok        | Orijinal dosyayı koru                                      | Gelecek import'ta bütünlük doğrulaması ekle |

## Yerel geri yükleme özelliği için kabul tasarımı

Geri yükleme geliştirildiğinde aşağıdaki kurallar birlikte uygulanmalıdır:

1. Yalnızca uygulamanın sürümlenmiş JSON şeması kabul edilir; boyut, alan tipi ve zorunlu alanlar doğrulanır.
2. Dosya önce bellekte/geçici alanda parse edilir; mevcut kütüphane doğrulama bitmeden değiştirilmez.
3. Kullanıcıya eklenecek, atlanacak ve çakışan kayıt sayısı gösterilir; **birleştir** varsayılandır, **tümünü değiştir** ayrıca açık onay ister.
4. İçerik hash'iyle aynı kayıtlar çoğaltılmaz. Kimlikler dosyadan güvenilir kabul edilmez; cihazda yeniden üretilir.
5. İçe aktarma tek SQLite transaction'ında yapılır. Hata halinde tamamı rollback edilir.
6. Şema sürümü daha yeniyse işlem güvenli biçimde reddedilir; bilinmeyen alanlar loglanmaz.
7. Geri yükleme öncesi mevcut kütüphanenin yeni bir dışa aktarımı önerilir.
8. Bozuk, aşırı büyük, kötü amaçlı ve hassas içerikli fixture'larla otomatik test ve iki platform gerçek cihaz testi gerekir.

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
