# Sürüm ve geri alma operasyonu

Bu süreç kapalı beta sürümleri için asgari kalite, dağıtım ve olay yönetimi standardıdır. Mağaza/EAS hesabı gerektiren adımlar ancak yetkili kişi tarafından yürütülür.

## Sürüm hazırlığı

1. `main` temiz ve CI yeşil olmalıdır.
2. `app.json` içindeki kullanıcı sürümü semantik sürümlemeyle artırılır; EAS production profili build numarasını otomatik artırır.
3. [`QUALITY.md`](QUALITY.md) kalite kapısı ve [`ACCEPTANCE_TESTS.md`](ACCEPTANCE_TESTS.md) gerçek cihaz senaryoları tamamlanır.
4. Veri modeli, izin, SDK veya ağ davranışı değiştiyse gizlilik ve veri güvenliği beyanları aynı sürümde güncellenir.
5. Aşağıdaki sürüm notu doldurulur; bilinen sorunlar saklanmaz.
6. İmzalı artifact önce internal/preview kanalında, sonra TestFlight ve Play Internal Testing'de küçük beta grubuna verilir.

## Sürüm notu şablonu

```md
# Listen AI vX.Y.Z (build N) — YYYY-AA-GG

## Kullanıcıya yansıyan değişiklikler

-

## Düzeltmeler

-

## Veri / migration etkisi

- Yok | SQLite vN → vN+1, geri uyumluluk: ...

## İzin, SDK ve gizlilik etkisi

- Yok | ...

## Doğrulama

- CI bağlantısı:
- iOS cihaz / sürüm / sonuç:
- Android cihaz / sürüm / sonuç:
- TestFlight / Play Internal Testing sonucu:

## Bilinen sorunlar

-

## Geri alma adayı

- Son sağlıklı sürüm/build:
- Revert commit veya düzeltme PR'ı:
```

## Yayını durdurma ölçütleri

Aşağıdakilerden biri görülürse yeni katılımcılara dağıtım durdurulur:

- uygulamanın açılamaması veya tekrarlayan çökme;
- yerel kütüphane kaybı, bozuk migration ya da yanlış kalıcı silme;
- metin içeriğinin beklenmeyen ağ aktarımı veya hassas veri sızıntısı;
- temel metin kaydetme/dinleme akışının çalışmaması;
- önceki sağlıklı sürüme göre kritik erişilebilirlik gerilemesi.

## Rollback akışı

1. Dağıtım mağaza konsolunda duraklatılır; etkilenen build, platform ve kapsam kaydedilir.
2. Veri güvenliği şüphesi varsa özellik kullanılmaması beta katılımcılarına hemen bildirilir.
3. Son sağlıklı tag/build belirlenir. Git geçmişi yeniden yazılmaz; hatalı değişiklik yeni bir `revert` veya düzeltme commit'iyle geri alınır.
4. SQLite migration geriye doğru çalıştırılmaz. Eski build yeni şemayı okuyamıyorsa ileri uyumlu hotfix hazırlanır ve veri silme çözüm olarak kullanılmaz.
5. Kalite kapısı ve kritik gerçek cihaz senaryoları tekrar çalıştırılır.
6. Yeni build internal kanalda doğrulanır ve mağaza kanalına gönderilir. Kullanıcıya uygulamayı güncelleme yönlendirmesi yapılır.
7. Olay kaydı, kök neden ve kalıcı aksiyonlar tamamlanmadan olay kapatılmaz.

Bu repoda uzaktan özellik bayrağı veya doğrulanmış OTA rollback altyapısı yoktur; varmış gibi kullanılmamalıdır. Mevcut güvenli yöntem mağaza dağıtımını durdurmak ve doğrulanmış yeni build yayınlamaktır.

## Incident iletişim şablonu

```md
# INC-YYYY-AA-GG-N — Kısa başlık

- Durum: Araştırılıyor | Azaltıldı | Çözüldü
- Şiddet: SEV-1 | SEV-2 | SEV-3
- Başlangıç / tespit zamanı (UTC):
- Incident sahibi:
- Etkilenen platform ve sürüm:
- Kullanıcı etkisi ve tahmini kapsam:
- Veri/gizlilik etkisi: Yok | Araştırılıyor | Doğrulandı
- Mevcut azaltma:
- Kullanıcının yapması gereken:
- Sonraki güncelleme zamanı:
- İlgili issue/PR/build (gizli bilgi içermeyen):
```

İletişimde kullanıcı metni, belge adı, token, cihaz kimliği veya başka kişisel veri paylaşılmaz. SEV-1; veri kaybı/sızıntısı veya uygulamanın yaygın açılamaması, SEV-2 temel akışın önemli kullanıcı grubunda bozulması, SEV-3 sınırlı ve geçici bozulmadır.

## Olay sonrası

En geç beş iş günü içinde zaman çizelgesi, kök neden, tespit boşluğu, işe yarayan/yaramayan müdahaleler ve sahibi/tarihi olan aksiyonlar yazılır. Benzer hatayı yakalayan otomatik test eklenmeden düzeltme tamamlanmış sayılmaz.
