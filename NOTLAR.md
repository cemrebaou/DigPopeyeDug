# DigPopeyeDug – Notlar

## Bekleyenler

## Yapılanlar (önizlemede, GitHub'a henüz gönderilmedi)
- Yeniden başla butonu (sağ üst, yeşil). Bölümü baştaki skorla yeniden başlatır.
- Arayüz ikonları: oklar, pompa, yeniden başla, bitiş paneli ve butonlar yeni görsellerle.
- Pompa hortumu pompanın alt ucundan çıkıyor, yerde kıvrılarak düşmana gidiyor.
- Kum artık puslu değil: zemin ekran çözünürlüğünde çiziliyor.
- Kum dokusu verilen görselden. Toprak, kaya ve mağara aynı dokudan renklendirildi. Kapaklar tahta dokulu.
- 3D görünüm: yeni 3D kum dokusu, üst kenarlarda parlama, alt kenarlarda gölge, tane tane ton farkı, mağara köşelerinde karanlık. (Eski koyu kontur kaldırıldı.)
- Zemin renkleri: canlı kahve toprak, parlak gri kaya, açık tahta kapak; mağara koyu kaldı.
- Karakterlerin altındaki gri gölge kaldırıldı.
- Yeni çakıllı kum dokusu. Butonların arkasındaki tahta kaldırıldı, gri kaya kesintisiz aşağı devam ediyor.
- Pompa hortumu ince, pompa butonundaki koyu kömür grisi; düşman ucunda koyu sarı pirinç başlık.
- Düşman sönmesi: pompalamayı bırakınca 0,5 sn bekler, sonra 0,35 sn'de bir kademe hızlı söner.
- Kazma animasyonu: kum/toprak kazarken Reis eller havada kazma hareketi yapıyor (6 kare).
- Yeni sesler (kullanıcının ürettikleri): kum kazma, toprak kazma, kapak, adım x3, düşerken (sadece havadayken), iniş, kum akışı x2, sönme, ölme, bölüm tamam; pompa ve patlamalar yenilendi. Şişirme sesi bekleniyor.
- Eski sesler (ilk 5): pompa, şişme (her kademede incelir), yengeç patlaması, ahtapot patlaması, kazma. Kayıttan kesildi, kayıt çok kısık olduğu için gürültülü olabilir.

- Düşerken yeni düşme görseli (reis_dus). Tüm sabit zemin (toprak, kaya) orijinal sarı kum dokusu; dökülecek kum zeytin yeşili. Kazma sesi: sadece kum kazma sesi.

- Tam ekran düğmesi (restart'ın solunda, sadece tarayıcıda). Toplam 10 bölüm.

- Son bölümden sonra "Daha Zor Baştan Başla": her turda Reis ve düşman hızı %10 artar. Yön okları 208 px, pompa 221 px, oklar arası 10 px boşluk; sağ altta sürüm yazısı (v0.01, config.js).

## Vazgeçilenler
- Basılı tutulan pompa: mevcut pompa hali beğenildi, aynen kalacak.

## v0.12 — Kuş + Eğilme
- Yeni düşman `b` (uçan kuş): zeminden 110 px yukarıda uçar, ayakta kafaya çarpar; eğilince altından geçilir. Sprite: `bird_walk0-3`, `bird_pump0-3`, `bird_pop0`.
- Eğilme: buton (aşağı ok) bir kez basınca eğik kalır, tekrar basınca (yukarı ok) kalkar. Eğikken kazılmaz, hız x0.8, hitbox 100 px (ayakta 126). Tavan alçaksa kalkılamaz. Pompalayınca otomatik kalkar. Sprite: `reis_egil0-3`.
- Bölüm 11-15: kuş bölümleri. `##` asılı bloklar altında 3 satırlık alçak tünel (kuş giremez, eğik Reis girer).
- Butonlar sıkıştırıldı: sol, sağ, eğil, pompa (170/170/170/180 px).
