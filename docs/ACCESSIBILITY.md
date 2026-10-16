# Erişilebilirlik kontrol listesi

Bu belge otomatik kontroller ile gerçek cihaz doğrulamasını birbirinden ayırır. Gerçek cihaz maddeleri tamamlanmadan `TASKS.md` içindeki erişilebilirlik işi bitmiş sayılmaz.

## Kod tabanında uygulanan kurallar

- Etkileşimli kontroller anlamlı erişilebilirlik adı ve role sahip olmalıdır.
- Seçili sekme ve filtreler `accessibilityState.selected` ile bildirilmelidir.
- Yalnızca dekoratif semboller ekran okuyucudan gizlenmelidir.
- Metin ölçekleme React Native varsayılanıyla açık tutulmalıdır; `allowFontScaling={false}` kullanılmaz.
- Ana dokunma hedefleri en az 44 × 44 pt olmalıdır.
- Hata ve boş durumları yalnızca renkle anlatılmamalıdır.

## Yayın öncesi gerçek cihaz kontrolü

- [ ] iOS VoiceOver ile Ana Sayfa → Metin ekle → Dinle → Kütüphane akışını tamamla.
- [ ] Android TalkBack ile aynı temel akışı tamamla.
- [ ] iOS ve Android'de sistem metin boyutunu en büyük erişilebilir boyuta getir; kesilen ana aksiyon olmadığını doğrula.
- [ ] Açık ve koyu oynatıcı ekranlarında metin/ikon kontrastını WCAG AA aracıyla ölç.
- [ ] Tüm etkileşimli hedefleri dokunma alanı denetleyicisiyle kontrol et.
- [ ] Harici klavye ile odak sırası ve görünür odak durumunu doğrula.

Sonuçlar cihaz, işletim sistemi sürümü ve uygulama build numarasıyla kabul testi kaydına eklenmelidir.
