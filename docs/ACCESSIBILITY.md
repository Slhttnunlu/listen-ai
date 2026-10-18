# Erişilebilirlik kontrol listesi

Bu belge otomatik kontroller ile gerçek cihaz doğrulamasını birbirinden ayırır. Gerçek cihaz maddeleri tamamlanmadan `TASKS.md` içindeki erişilebilirlik işi bitmiş sayılmaz.

## Kod tabanında uygulanan kurallar

- Etkileşimli kontroller anlamlı erişilebilirlik adı ve role sahip olmalıdır.
- Seçili sekme ve filtreler `accessibilityState.selected` ile bildirilmelidir.
- Yalnızca dekoratif semboller ekran okuyucudan gizlenmelidir.
- Metin ölçekleme React Native varsayılanıyla açık tutulmalıdır; `allowFontScaling={false}` kullanılmaz.
- Banner, alt navigasyon ve kurtarma ekranı gibi metin taşıyan ana yüzeyler sabit yüksekliğe zorlanmamalı; içerik büyümeli veya kaydırılabilmelidir.
- Ayar değerleri, kütüphane başlıkları ve metin aksiyonları erişilebilir yazı boyutunda tek satıra zorlanmamalı; satırlar gerektiğinde sarılmalıdır.
- Ana dokunma hedefleri en az 44 × 44 pt olmalıdır.
- Sembol/ikon tabanlı kritik kontrollerin iki ekseni ve metin tabanlı aksiyonların yüksekliği otomatik stil testiyle en az 44 pt olarak korunur.
- Hata ve boş durumları yalnızca renkle anlatılmamalıdır.
- Küçük/normal metin ile zemini en az WCAG AA 4,5:1 kontrast oranını sağlamalıdır; kritik stil çiftleri otomatik regresyon testiyle korunur.
- Koyu oynatıcıdaki süre/ilerleme metni doğrudan `Text` bileşenine renk vermelidir; React Native'de üst `View` rengi alt metne miras kalmaz.
- Ana ekranların font scaling'i kapatmaması, büyüyebilen yüzeylerin sabit `height` kullanmaması ve kritik satırların sarılabilmesi otomatik regresyon testiyle korunur.

## Yayın öncesi gerçek cihaz kontrolü

- [ ] iOS VoiceOver ile Ana Sayfa → Metin ekle → Dinle → Kütüphane akışını tamamla.
- [ ] Android TalkBack ile aynı temel akışı tamamla.
- [ ] iOS ve Android'de sistem metin boyutunu en büyük erişilebilir boyuta getir; kesilen ana aksiyon olmadığını doğrula.
- [ ] Açık ve koyu oynatıcı ekranlarında metin/ikon kontrastını WCAG AA aracıyla ölç.
- [ ] Tüm etkileşimli hedefleri dokunma alanı denetleyicisiyle kontrol et.
- [ ] Harici klavye ile odak sırası ve görünür odak durumunu doğrula.

Sonuçlar cihaz, işletim sistemi sürümü ve uygulama build numarasıyla kabul testi kaydına eklenmelidir.
