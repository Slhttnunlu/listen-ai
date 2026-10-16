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

## Platform davranışları

- Uygulama arka plana alınıp geri getirildiğinde veri kaybolmaz.
- Telefon çağrısı/ses kesintisi sonrası uygulama çökmemelidir.
- Büyük metin ve büyük yazı boyutunda ana aksiyonlar ekran dışında kalmamalıdır.
- VoiceOver/TalkBack açıkken etkileşimli kontroller anlaşılır adlarla okunmalıdır.
- İzin reddi veya dosya sağlayıcı iptali uygulamada hata/çökme oluşturmamalıdır.
