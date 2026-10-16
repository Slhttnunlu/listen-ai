# Kapalı beta geri bildirim süreci

## Kanallar

- Ayarlar'daki **Yardım ve geri bildirim**, yapılandırılmış beta geri bildirim formunu açar.
- Tekrarlanabilir teknik sorunlar **Beta hata bildirimi** formuyla kaydedilir.
- Güvenlik ve gizlilik şüpheleri herkese açık issue'ya değil GitHub private security advisory kanalına yönlendirilir.

Formlar kullanıcı metni, belge adı, token ve kişisel bilgi istemez. Issue incelenirken yanlışlıkla eklenmiş hassas veri alıntılanmaz; erişim sınırlandırma/silme süreci başlatılır.

## Haftalık değerlendirme

Kapalı beta boyunca haftada bir kez 30–45 dakikalık değerlendirme yapılır:

1. Yeni issue'lar mükerrer, hata, erişilebilirlik, ürün önerisi ve destek olarak sınıflandırılır.
2. Hatalar etki × sıklık ile önceliklendirilir; veri kaybı/gizlilik ve temel akış bozulması aynı gün incident sürecine alınır.
3. Aşağıdaki içerik taşımayan metrikler kaydedilir:
   - aktif beta katılımcısı ve geri bildirim veren kişi sayısı;
   - yeni/açık/kapanan hata sayısı;
   - temel akış başarı oranı ve bildirilen çökme sayısı;
   - en sık tekrar eden üç problem/istek.
4. Bir sonraki haftaya en fazla üç ürün veya kalite aksiyonu seçilir; her birine sahip ve hedef tarih atanır.
5. Alınan karar, varsayım ve ölçülecek sonuç haftalık kayda yazılır.

## Haftalık kayıt şablonu

```md
# Beta değerlendirmesi — YYYY-AA-GG

- Katılımcı / geri bildirim veren:
- Yeni / açık / kapanan hata:
- Temel akış başarı sinyali:
- Çökme bildirimi:
- En sık üç konu: 1. 2. 3.
- Bu haftanın kararları (sahip / tarih / başarı ölçütü):
- Gizlilik veya veri olayı: Yok | INC-...
- Gelecek değerlendirme:
```

Kullanıcı içerikleri ve kişisel veriler haftalık kayda kopyalanmaz. İlk beta metriği iyileştirme kararı, yeterli örnek oluşmadan başarı olarak işaretlenmez.
