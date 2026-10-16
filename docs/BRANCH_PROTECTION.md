# Ana dal ve pull request politikası

Bu politika `main` dalına kırık veya doğrulanmamış bir build girmesini önlemek için kullanılmalıdır.

## GitHub ruleset

Repository **Settings → Rules → Rulesets** altında `main` hedefli aktif bir branch ruleset oluşturun:

- Değişiklikleri yalnızca pull request ile kabul et.
- Bir onay iste; tek geliştiricili dönemde bu kural geçici olarak sıfır onayla kullanılabilir.
- Yeni commit geldiğinde eski onayı geçersiz kıl.
- Review konuşmalarının çözülmesini zorunlu tut.
- Merge öncesinde status check geçmesini zorunlu tut.
- Zorunlu status check olarak `CI / quality` seç.
- Dalın merge öncesinde güncel olmasını zorunlu tut.
- Force push ve dal silmeye izin verme.
- Yönetici bypass kullanımını yalnızca acil durumlarla sınırla.

`CI / quality`; lint, Prettier kontrolü, Jest testleri ve Expo iOS export adımlarının tamamını çalıştırır. İş adı değiştirilirse ruleset içindeki zorunlu kontrol de güncellenmelidir.

## Merge kuralı

- Tercih edilen yöntem **Squash and merge** yöntemidir.
- CI başarısızken merge yapılmaz; bypass kalıcı çözüm olarak kullanılmaz.
- Kullanıcı verisi, SQLite migration, TTS veya bağımlılık değişiklikleri PR açıklamasında risk ve geri alma adımı içermelidir.
- Merge sonrası `main` CI başarısız olursa yeni özellik geliştirmeden önce düzeltme veya revert hazırlanmalıdır.

## Kurulum doğrulaması

Ruleset etkinleştirildikten sonra geçici bir dalda kasıtlı olarak başarısız olan bir PR açıp merge düğmesinin engellendiğini doğrulayın. Doğrulama sonrasında geçici PR kapatılmalı; başarısız test `main` dalına alınmamalıdır.
