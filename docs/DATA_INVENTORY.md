# Veri envanteri ve yaşam döngüsü

**Son inceleme:** 17 Ekim 2026
**Kapsam:** `0.1.x` kapalı beta; yerel TTS, SQLite kütüphanesi, TXT/DOCX/PDF içe aktarma ve cihaz içi OCR

Bu envanter kaynak kodun mevcut davranışını belgeler. Gelecek planındaki hesap, bulut AI/TTS, mail, Drive, analytics ve crash reporting bu sürümde etkin değildir.

## Mevcut veri akışları

| Veri                                         | Kaynak                                      | Amaç                                           | Konum / aktarım                                                                                 | Saklama                                                  | Silme                                                                    |
| -------------------------------------------- | ------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Metin içeriği ve başlık                      | Kullanıcı yazma/yapıştırma                  | Seslendirme ve kütüphane                       | Cihaz içi SQLite; uygulama sunucusuna gönderilmez                                               | Kullanıcı silene veya uygulama verisini kaldırana kadar  | Tek kayıt silme 30 gün geri alınabilir; toplu kalıcı silme Ayarlar'dadır |
| Dinleme ilerlemesi                           | TTS kelime sınırı                           | Kaldığı yerden devam                           | Cihaz içi SQLite                                                                                | İlgili kayıtla aynı                                      | İlgili kayıtla birlikte                                                  |
| Favori/tamamlandı bilgisi ve zaman damgaları | Kullanıcı/uygulama                          | Filtreleme ve sıralama                         | Cihaz içi SQLite                                                                                | İlgili kayıtla aynı                                      | İlgili kayıtla birlikte                                                  |
| TXT/DOCX içeriği                             | Sistem dosya seçici                         | Editöre içerik aktarma                         | Seçilen dosyanın uygulama cache kopyası okunur; metin ancak kullanıcı kaydederse SQLite'a girer | Cache yaşam döngüsü işletim sistemi tarafından yönetilir | İşletim sistemi cache temizliği veya uygulama verisini kaldırma          |
| PDF içeriği                                  | Sistem dosya seçici                         | Dijital PDF metnini editöre aktarma            | PDFKit/PDFBox cihaz içinde metin çıkarır; metin ancak kullanıcı kaydederse SQLite'a girer       | Cache yaşam döngüsü işletim sistemi tarafından yönetilir | İşletim sistemi cache temizliği veya uygulama verisini kaldırma          |
| Kamera/galeri görseli                        | Kullanıcının açık kamera veya galeri seçimi | Cihaz içi OCR ile editöre metin aktarma        | Vision/ML Kit cihaz içinde işler; kaynak görsel kaydedilmez                                     | Yalnızca sistem picker/camera geçici yaşam döngüsü       | Seçimden sonra uygulama kalıcı görsel saklamaz                           |
| Pano metni                                   | Sistem panosu                               | Kullanıcı “Yapıştır” dediğinde editöre aktarma | Yalnızca cihaz belleği/editör; otomatik okunmaz                                                 | Kullanıcı kaydederse SQLite'a girer                      | Editörü temizleme veya kayıt silme                                       |
| Cihaz TTS ses listesi                        | İşletim sistemi                             | Türkçe/uygun sesi seçme                        | Bellekte; uygulama sunucusuna gönderilmez                                                       | Oturum süresince                                         | Uygulama kapanınca                                                       |
| Geri bildirim içeriği                        | Kullanıcının GitHub sayfasında yazdığı veri | Destek ve hata bildirimi                       | Uygulama GitHub issue sayfasını açar; veri GitHub'a kullanıcı tarafından gönderilir             | GitHub ve repository politikasına göre                   | Kullanıcı issue düzenleme/silme talebi veya repository yöneticisi        |

## Mevcut sürümde olmayan veri işlemleri

- Kullanıcı hesabı veya kimlik token'ı
- Reklam kimliği, hassas cihaz kimliği veya kişi listesi
- Konum, mikrofon veya e-posta erişimi
- Uygulama içi analytics, reklam veya üçüncü taraf crash reporting
- OpenAI, Google Gemini ya da başka bir AI/TTS sağlayıcısına içerik gönderimi
- Uygulama backend'i, senkronizasyon veya bulut yedekleme
- Ödeme ve abonelik verisi

## Saklama ve silme kuralları

### Kapalı beta

- Yerel kayıt kullanıcı kontrolündedir ve otomatik buluta yüklenmez.
- Kütüphanedeki tek kayıt silme 30 gün geri alınabilir; süre dolduğunda uygulama başlangıcında kalıcı temizlenir.
- Uygulamanın kaldırılması işletim sisteminin uygulama sandbox'ını ve SQLite verisini siler; cihaz yedeği davranışı iOS/Android ayarlarına bağlı olabilir.
- Destek issue'suna hassas metin veya belge yapıştırılmaması kullanıcıya bildirilir.

### Gelecek hesap/bulut özellikleri

- İçerik varsayılan olarak yüklenmez; özellik bazında açık kullanıcı aksiyonu gerekir.
- Normal hesap verisi silme talebinden sonra en geç 30 gün içinde aktif sistemlerden kaldırılır.
- Yedek, denetim kaydı ve yasal saklama istisnaları production altyapısı seçildiğinde ayrı retention tablosuyla kesinleştirilir.
- Hesap silme yeni oturumları engeller, aktif işleri iptal eder ve içerik/ses objelerini silme kuyruğuna alır.

## Dışa aktarma ve silme süreci

### Hesapsız/yerel kullanıcı

1. Ayarlar'daki dışa aktarma aksiyonu aktif kütüphaneyi JSON dosyası olarak sistem paylaşım ekranına verir.
2. Uyumlu JSON yedeği boyut ve şema doğrulamasından sonra mevcut kütüphaneyle tek transaction içinde birleştirilebilir; aynı içerikler atlanır.
3. Tek kayıt silme mevcut geri alınabilir akışla yapılır.
4. “Tüm yerel verileri sil” aksiyonu açık onaydan sonra metinleri ve ilerlemeyi SQLite'tan kalıcı kaldırır.
5. Uygulamayı kaldırma yerel uygulama verisini cihazdan temizler.

### Gelecek hesaplı kullanıcı

1. Kullanıcı Ayarlar'dan makine tarafından okunabilir dışa aktarma ister.
2. Backend sahipliği doğrular, kısa ömürlü indirme bağlantısı üretir ve içerikleri loglamaz.
3. Hesap silme yeniden doğrulama ve silinecek kategori özeti gerektirir.
4. Kullanıcı içerik taşımayan talep kimliğiyle süreci izler; tamamlanma ve istisnalar bildirilir.

Ayrıntılı kimlik ve hesap silme kararı [`AUTH.md`](AUTH.md) içindedir.

## İzin ve OAuth değerlendirmesi

| Özellik            | En az izin/kapsam                                                                   | Saklama kararı                                                 | Durum                             |
| ------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| TXT/DOCX/PDF seçme | Sistem document picker; geniş dosya sistemi izni yok                                | İçerik yalnızca kullanıcı kaydederse SQLite'a girer            | Mevcut                            |
| Kamera OCR         | Kamera yalnızca çekim anında; fotoğraf kitaplığı ayrı ve isteğe bağlı               | Kaynak görsel varsayılan olarak saklanmaz; OCR cihazda çalışır | Native build kabul testi bekliyor |
| Gmail              | Salt okunur ve mümkün olan en dar mesaj kapsamı; tam posta kutusu kapsamından kaçın | Mesaj varsayılan olarak kalıcı saklanmaz                       | Yayınlanmadı                      |
| Outlook            | Microsoft Graph için salt okunur, en dar mail kapsamı                               | Mesaj varsayılan olarak kalıcı saklanmaz                       | Yayınlanmadı                      |
| Drive              | Kullanıcının seçtiği dosyaya sınırlı picker/kapsam tercih edilir                    | Dosya yalnızca açık içe aktarma aksiyonuyla işlenir            | Yayınlanmadı                      |

Kamera, mail veya Drive özelliği bu tablo gerçek sağlayıcı kapsamları ve mağaza izin metinleriyle yeniden onaylanmadan açılamaz.

## Mağaza beyan taslağı

### Apple App Privacy — mevcut beta

Kaynak kodda geliştiriciye veya entegre üçüncü taraf SDK'ya otomatik veri aktarımı yoktur. Mevcut build için başlangıç beyanı **Data Not Collected** olabilir. GitHub geri bildirim bağlantısı uygulama dışı, kullanıcının isteğe bağlı işlemidir ve gizlilik politikasında ayrıca açıklanır.

### Google Play Data Safety — mevcut beta

Başlangıç beyanı: uygulama tarafından veri toplanmaz veya paylaşılmaz; temel işlev cihaz içinde çalışır. “Veri silme” açıklaması yerel veri ve uygulamayı kaldırma davranışını belirtmelidir.

Bu taslaklar yalnızca mevcut dependency ve ağ davranışı değişmediği sürece geçerlidir. Her release öncesi `package.json`, native izinler, privacy manifestleri ve gerçek ağ trafiği yeniden denetlenmelidir.

## Özellik açma kapısı

Aşağıdakilerden biri değiştiğinde bu belge, gizlilik politikası ve mağaza beyanları aynı PR içinde güncellenir:

- Yeni SDK veya native izin
- Yeni API hostname'ı ya da backend
- Analytics/crash reporting
- Hesap, OAuth, ödeme veya abonelik
- Kamera, fotoğraf, mail, Drive, OCR veya bulut AI/TTS
- Saklama süresi, veri bölgesi veya alt işleyen değişikliği
