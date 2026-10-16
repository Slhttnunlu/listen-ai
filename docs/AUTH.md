# Kimlik doğrulama ve hesap yaşam döngüsü

## Temel karar

Listen AI hesap açmadan kullanılabilmelidir. Yerel metin, kütüphane ve cihaz TTS özellikleri anonim/çevrimdışı çalışır. Kullanıcıdan yalnızca bulut TTS, AI, cihazlar arası senkronizasyon veya satın alma durumunu hesaba bağlamak istediğinde giriş istenir.

İlk backend sürümünde yönetilen, OpenID Connect uyumlu bir kimlik sağlayıcı kullanılmalıdır. Parola doğrulama ve parola saklama uygulamanın kendi backend'inde geliştirilmez.

## Kimlik seçenekleri

1. **Hesapsız kullanım:** Sunucu hesabı oluşturulmaz. Yerel kayıtlar SQLite içinde kalır.
2. **Apple ile giriş:** iOS için birincil sosyal giriş yöntemidir.
3. **Google ile giriş:** iOS ve Android'de desteklenir.
4. **E-posta:** Parola yerine süresi kısa magic link veya tek kullanımlık kod kullanılır.

Sosyal giriş sunuluyorsa iOS mağaza gereksinimleri release kontrolünde yeniden doğrulanmalı ve Apple ile giriş aynı sürümde hazır olmalıdır.

## Token güvenliği

- Access token kısa ömürlüdür; hedef süre 15 dakikadır.
- Refresh token rotasyonludur ve yeniden kullanım tespitinde token ailesi iptal edilir.
- Token'lar düz AsyncStorage veya SQLite içinde tutulmaz; iOS Keychain/Android Keystore kullanan güvenli depolama adaptöründe saklanır.
- Mobil log, analytics, crash report ve URL query parametrelerine token yazılmaz.
- Logout cihazdaki token'ları siler ve mümkünse refresh oturumunu backend'de iptal eder.
- Kritik hesap işlemleri yakın zamanda doğrulanmış oturum gerektirir.

## Hesapsız kullanımdan hesaba geçiş

- Giriş ekranından önce hangi yerel verinin yüklenebileceği ve hangisinin cihazda kalacağı açıklanır.
- İlk sürüm otomatik içerik yüklemez. Kullanıcı her kayıt veya toplu senkronizasyon için açık seçim yapar.
- Sunucudaki ve cihazdaki kayıtlar UUID ile ayrılır. Aynı başlık veya metin otomatik olarak aynı kayıt kabul edilmez.
- Çatışmada iki kopya korunur; kullanıcı onayı olmadan içerik üzerine yazılmaz veya silinmez.
- Giriş başarısız olursa yerel uygulama kullanılmaya devam eder.

## Yetkilendirme

- Backend her istekte kaynak sahipliğini doğrular; istemciden gelen `user_id` güven kaynağı değildir.
- Job, ses dosyası ve doküman URL'leri yalnızca sahibi için erişilebilir, kısa ömürlü ve imzalıdır.
- Yönetici/support erişimi varsayılan olarak kapalıdır; gerektiğinde süreli, denetim kayıtlı ve en az ayrıcalıklı rol kullanılır.
- Kullanıcı başına kota, rate limit ve maliyet bütçesi doğrulanmış backend kimliğine bağlanır.

## Hesap silme

1. Ayarlar içinde mağaza dışına yönlendirmeden bulunabilen **Hesabı sil** aksiyonu sunulur.
2. Kullanıcı yeniden doğrulanır ve silinecek veri kategorileri gösterilir.
3. Backend silme isteğini idempotent olarak kabul eder, yeni token üretimini engeller ve aktif oturumları iptal eder.
4. Aktif işler iptal edilir; metadata, yüklenen içerik ve üretilen sesler saklama politikasındaki süre içinde silinir.
5. Yasal olarak tutulması zorunlu minimal kayıtlar içerikten ayrılır ve son silme tarihi kullanıcıya bildirilir.
6. İşlem durumu, içerik taşımayan silme talebi kimliğiyle sorgulanabilir.

Hedef: normal kullanıcı verisini 30 gün içinde silmek. Yedeklerden düşme süresi ayrıca veri saklama politikasında tanımlanır.

## Hesap kurtarma ve destek

- Apple private relay ve değişen e-posta adresleri kalıcı kullanıcı kimliği olarak kullanılmaz; sağlayıcının kararlı subject değeri kullanılır.
- Hesap birleştirme otomatik yapılmaz. Aynı e-posta iddiası tek başına iki kimliği birleştirmek için yeterli değildir.
- Destek ekibi kullanıcı içeriğini istemez. Sorun araştırması request ID, uygulama sürümü ve kontrollü hata kodlarıyla yapılır.

## Uygulama sırası

- [ ] Kimlik sağlayıcısı ve AB veri bölgesi seçimini ADR ile kaydet.
- [ ] Redirect URI, universal/app link ve development/staging/production client'larını ayır.
- [ ] Secure storage adaptörü ve token yenileme kilidi ekle.
- [ ] Backend yetkilendirme ve kaynak sahipliği entegrasyon testlerini yaz.
- [ ] Hesapsız → hesaplı geçiş ve logout testlerini ekle.
- [ ] Hesap silme API'si, uygulama ekranı ve uçtan uca silme kanıtını tamamla.
- [ ] App Store/Play gizlilik beyanlarını gerçek veri akışına göre güncelle.
