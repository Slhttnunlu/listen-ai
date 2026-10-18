# Mobil Kabul Testleri

Her release adayı en az bir güncel iPhone ve bir güncel Android gerçek cihazda test edilir. Sonuç; cihaz, işletim sistemi, uygulama sürümü, test eden kişi ve tarih ile kaydedilir.

## Temel akışlar

1. Uygulama temiz kurulumla açılır; ana ekran ve alt menü görünür.
2. Metin alanına Türkçe karakter ve emoji içeren metin yazılır.
3. Klavye açıkken **Kaydet ve Dinle** erişilebilir ve çalışır.
4. Okunan kelime sarı vurguyla takip edilir.
5. Hız değiştirilir; oynatıcı kapanmaz ve metin başa dönmez.
6. Dinleme durdurulup kütüphaneden açılır; kayıtlı ilerlemeden devam eder.
7. Dinleme tamamlanır; kayıt **Tamamlandı** filtresinde görünür.
8. TXT dosyası seçilir, editörde görüntülenir ve dinletilir.
9. Türkçe paragraflar içeren DOCX seçilir, biçim metne dönüştürülür ve dinletilir.
10. Boş, desteklenmeyen, 2 MB'dan büyük TXT ve 10 MB'dan büyük DOCX dosyasında anlaşılır hata görülür.
11. Kayıt aranır, yeniden adlandırılır, favorilenir, silinir ve **Geri al** ile geri getirilir.
12. 250.000 karakteri aşan belge içe aktarılır; bölümler kütüphanede sıralı ve ayrı kayıtlar olarak görünür.
13. Kütüphane JSON olarak dışa aktarılır, bir kayıt silindikten sonra yedek birleştirilir; kayıt geri gelir ve mevcut/mükerrer kayıtlar korunur.
14. Ayarlar'dan varsayılan Türkçe ses ve hız değiştirilir; uygulama yeniden açıldığında tercihler korunur ve yeni dinleme bu tercihlerle başlar.

## Platform davranışları

- Uygulama arka plana alınıp geri getirildiğinde veri kaybolmaz.
- Telefon çağrısı/ses kesintisi sonrası uygulama çökmemelidir.
- Büyük metin ve büyük yazı boyutunda ana aksiyonlar ekran dışında kalmamalıdır.
- VoiceOver/TalkBack açıkken etkileşimli kontroller anlaşılır adlarla okunmalıdır.
- İzin reddi veya dosya sağlayıcı iptali uygulamada hata/çökme oluşturmamalıdır.

## Ses dosyası tabanlı sağlayıcı — development/staging

Bu senaryolar yalnızca Chatterbox geliştirme servisi veya ilerideki cloud TTS gibi gerçek bir ses dosyası üreten sağlayıcı yapılandırıldığında uygulanır. Cihazın `expo-speech` motoru henüz kilit ekranı kontrolü sunmaz.

1. Ses dosyası oynarken uygulama arka plana alınır ve ekran kilitlenir; ses kesilmeden devam eder.
2. Kilit ekranında metin başlığı, **Listen AI** sanatçı bilgisi ve oynat/duraklat kontrolü görünür.
3. Kilit ekranından duraklatılıp devam edildiğinde ses aynı konumdan sürer.
4. Uygulama içinden dinleme durdurulduğunda veya ses tamamlandığında kilit ekranı metadata'sı temizlenir.
5. Başka bir uygulama ses odağını aldığında Listen AI çökmez; sistem kesintisi davranışı iOS ve Android'de kaydedilir.
6. Android'de uygulama en az beş dakika arka planda bırakılır; media playback foreground service üzerinden sesin sürdüğü doğrulanır.
