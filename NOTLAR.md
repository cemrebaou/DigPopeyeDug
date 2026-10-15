# DigPopeyeDug – Notlar

## Bekleyenler

## v0.41 — Yeni Üfleme Sesi
- Heykel üfleme sesi (ses_ruzgar) yeni rüzgar sesiyle değiştirildi; 28 sn'lik kesintisiz döngü, mono 80 kbps.

## v0.40 — Heykel Üfleme Sesi
- Taş heykel açıkken rüzgar sesi (ses_ruzgar) döngüde çalar; kapanınca, ölünce ya da bölüm bitince yumuşakça kısılıp durur. Birden çok heykel açıksa tek ses çalar.
- Ses dosyası kesintisiz döngü olacak şekilde hazırlandı (sonu başına yumuşak geçişle bağlandı), mono 96 kbps: ~73 KB.

## v0.39 — Yeni Eğilme ve Zıplama Pozları
- Eğik yürüyüş yeni 5 karelik animasyonla değiştirildi (reis_egil0-4).
- Zıplarken yükselme pozu (reis_zipla) ve inerken iniş pozu (reis_zipla_in) eklendi.
- Zıplamanın inişinde artık bağırma (ses_dusme) yok; derine zıplayıp inerse iniş sesi daha tok.
- Yürürken bir yerden düşerse eskisi gibi bağırarak düşer ve eski düşme pozu (reis_dus) kullanılır.

## v0.38 — Bölüm Seçme Ekranı Görselleri
- Çapalı ahşap pano (panel_bolumler) ve yuvarlak ipli tahta bölüm butonu (btn_bolum_daire) gerçek görsellerle değiştirildi; panonun en/boy oranı korunuyor.
- Başlık, kapatma, ızgara ve oklar panonun iç parşömen alanına göre yeniden yerleştirildi.
- Artık gerekmeyen kodla çizilen yedek bölüm görselleri silindi.

## v0.37 — Heykel Oyukları, Kaya Arka Planı, Bölüm Butonu
- Taş heykel eski pervaneden geniş/uzun; sığmadığı oyuklar açıldı: Bölüm 26 (heykel 1 kare aşağı, etrafı 3 kare genişliğinde; üstteki dar yarık kaya düşmesin diye korundu), Bölüm 43 ve 45 (heykelin arkasındaki sol duvar 1 sütun açıldı). Tüm heykeller kontrol edildi, hepsi sığıyor.
- Kaya bloğunun (ve kapağın) arkasına, bulunduğu yerin arka planı çizilir: açıktaysa gökyüzü, mağaradaysa mağara. Kaya kalkınca da aynı kalır. Mağaradaki kayanın köşelerinden gökyüzü sızması giderildi.
- Bölüm seçme butonu (btn_bolumler) gerçek görselle değiştirildi (mavi taş, sarı noktalı ızgara).

## v0.36 — Kod Revizyonu, Optimizasyon ve Temizlik
- Kullanılmayan görseller silindi: btn_durdur, btn_ev, btn_oyna, btn_ses, btn_sessiz, fan0-7 (eski pervane), model_1..5 ve ufleyici_modeller (heykel seçimi bitti).
- Oyunla ilgisi olmayan araç sayfaları www/ içinden silindi (APK'ya giriyordu): arkaplan-silici, bolum-paneli-yukle, heykeli-yukle, pervane-modelleri. Gerekirse git geçmişinden geri alınabilir.
- Tüm PNG'ler kayıpsız sıkıştırıldı (görüntü birebir aynı): ~4,6 MB → ~4,2 MB.
- Bellek sızıntısı giderildi: her bölüm başında üretilen zemin / alt kaya / kapak dokuları artık siliniyor (eskiden her yeniden başlatmada birikiyordu). Açılan kapağın dokusu da hemen silinir.
- Zemin dokuları bir kez hesaplanıp saklanıyor: bölüm geçişleri hızlandı.
- Heykel: yön ve ağız noktası bir kez hesaplanıyor; doku sadece açılıp kapanınca değişiyor (eskiden her kare).
- Kum fiziği sıcak döngüsünde her tane için dizi üretimi kaldırıldı (çöp toplayıcı takılmaları azalır).
- En yüksek bölüm hesabı 3 yerden tek fonksiyona (enYuksekBolum) alındı; eski kayıtlar korunuyor.
- Ölü kod silindi: kullanılmayan parlama katmanı, eski fan yedeği; animasyon listesi her bölümde yeniden kurulmuyor. (Bölüm paneli görselleri hâlâ 1x1 yer tutucu olduğu için kodla çizim korundu.)
- Kodun kritik yerlerine "neden böyle yaptık" açıklamaları eklendi.

## v0.35 — Rüzgar Çıkışı 3 px Daha Yukarı
- Heykelin rüzgar çıkışı ağız deliğine tam denk gelsin diye 3 px daha yukarı alındı (toplam 6 px yukarı, 2 px geri).

## v0.34 — Rüzgar Çıkış İnce Ayarı
- Heykelin rüzgarı ağız deliğinden tam çıksın diye 3 px yukarı, 2 px geri alındı.

## v0.33 — Yeni Taş Heykel Üfleyici
- Rüzgar veren karakter yeni taş heykel görseliyle değiştirildi: kapalıyken ağzı kapalı, açılınca ağzı açık (pervane_kapali / pervane_acik).
- Rüzgar ağzın deliğinden çıkar; heykel en/boy oranı korunur.

## v0.32 — Sayfalı Bölüm Seçimi
- Bölüm paneli kaydırmalı listeden 3 sütun x 4 satırlık sayfalı ızgaraya çevrildi.
- Alt boşluğa sol/sağ ok butonları (btn_sayfa_sol / btn_sayfa_sag) ve sayfa numarası eklendi; panel oynanan bölümün sayfasıyla açılır.

## v0.31 — Kalıcı En Yüksek Bölüm Koruması & Heykel Üfleyici Boyutlandırması
- Bölüm seçme menüsünde 1. seviye veya eski bir seviye seçildiğinde en yüksek ulaşılan bölümün silinmesi engellendi (`dpd_en_yuksek_bolum` koruması).
- Kullanıcı hangi bölümü seçerse seçsin, ulaştığı en yüksek seviyeye kadar olan tüm butonlar daima açık kalır.
- Eski seviyeler tekrar oynanıp kazanıldığında en yüksek bölüm kaydı ezilmez.
- Heykel üfleyici görseli için sabit hücre ölçeklemesi (`setDisplaySize`) eklendi, yüksek çözünürlüklü görsellerin ekranı taşması engellendi.
- Heykel yükleme aracına (`heykeli-yukle.html`) doğrudan panodan yapıştırma (Ctrl+V) ve GitHub'a otomatik push entegrasyonu eklendi.

## v0.30 — Kaydırmalı Bölüm Seçme Paneli & Gelişmiş Üfleme Rüzgarı
- Oyun ekranına mavi kare taş bölüm menüsü butonu eklendi (sağ üst bar).
- Büyük dikey ahşap panolu, dokunarak kaydırılabilir (scroll) bölüm seçme ekranı yapıldı.
- Her satırda 3 adet tahta yuvarlak buton; üzerinde bölüm numarası yazar.
- Bölüm açılma mantığı: İlk başta yalnızca 1. bölüm butonu vardır; oyuncu bölüm geçtikçe yeni buton üretilir ve kalıcı olarak (`dpd_acilan_bolum`) kaydedilir.
- Aktif bulunulan bölüm altın ışıltılı nabız efektiyle vurgulanır.
- Üfleme karakterinin ağız hizasına tam oturan, çok katmanlı ve blurlu/saydam akışkan rüzgar efekti (hacimsel koni, basınç dalgaları ve ipliksi akış çizgileri) eklendi.

## v0.29 — Yamaçta Akıcı Yürüyüş
- Reis yamaçtan inerken 2 kum tanesine kadar basamaklarda düşme pozuna geçmez, yere yapışarak yürür.
- Basamak inip çıkarken Reis'in görsel yüksekliği yumuşak geçer.

## v0.28 — Pürüzsüz Rampa & Akıcı Kum Yamaçları
- Kum yamaçlarındaki 6 piksellik merdiven/basamak tırtıkları kaldırıldı; referans görsele uygun pürüzsüz düz rampa yüzeyi ve parlak sarı üst kontur çizgisi uygulandı.
- Tepe zirvesi sivri üçgen kavisle bağlandı.
- Kum akış ve dökülme fiziği optimize edildi.

## v0.27 — Akışkan Altın Kum Fiziği & Parçacık Efektleri
- Kum rengi donuk zeytin yeşilinden canlı, sıcak altın çöl kumu tonuna çevrildi (yapay zeka / modern mobil kum oyunları hissi).
- Kum tanelerine 3D yuvarlak taneleme efekti verildi (köşe yumuşatma ve tane grenleri).
- Kum akış fiziği çift adımlı akışkan hıza yükseltildi; eğimlerden su gibi kesintisiz ve akıcı dökülüyor.
- Reis kum/toprak kazdığında kazılan yöne doğru sıçrayan kum zerrecikleri ve toz parçacıkları eklendi.
- Düşman patladığında etrafa saçılan renkli patlama parçacıkları eklendi.

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

## v0.16 — Rüzgar / pervane (bölüm 16-20)
- Haritada `>` `<` `^` `v` = pervane (sağa/sola/yukarı/aşağı). Başta kapalı, dokununca açılır/kapanır. Görsel: taş heykel (`pervane_kapali` ağzı kapalı / `pervane_acik` ağzı açık), rüzgar ağzından çıkar.
- Rüzgar bölgesi: pervane merkezinden başlayan ışınlar (en çok 84 kum tanesi), kaya/toprak/kapağa çarpınca durur, kum rüzgarı durdurmaz. Bant yüksekliği pervane boyu (~96 px); pervanenin yüksekliği hangi varlıkların etkileneceğini belirler (zemindeki pervane yürüyenleri iter, kuş etkilenmez; yüksek pervane kuşu iter).
- Etki: Reis/yengeç/ahtapot yatayda 110 px/sn itilir, yukarı rüzgarda 200 px/sn süzülür (yana dönebilir), aşağı rüzgarda düşüş hızlanır, kuş aşağı rüzgarda alçalır. Kum taneleri savrulur (yukarı rüzgarda havada asılı kalır).
- Haritanın altı artık açık: çukurdan (24. satıra kadar açık sütun) düşen ölür (düşman +150 puan).
- Bölümler: 16 çukura itme, 17 yukarı süzülme, 18 kumu çukura savurma, 19 kapak+rüzgar+kuş, 20 karışık final.
- Bölümlerde `ipucu` alanı ekran ipucunu değiştirir.

## v0.21 — Kaya itme + zıplama (bölüm 21-30)
- Zıpla: yukarı ok butonu (pompanın üstünde, geçici), PC: yukarı ok (eğikken kalkar). ZIPLA_V=590 → ~125 px yükseklik, ~4 kare uzaklık. Havada yön verilir.
- Kaya: haritada 2x2'lik `T` kümesi. Izgarada TAS(5) olarak yazılır, 1 kum tanesi (6 px) adımlarla kayar. Yerçekimi, itme (Reis iterken kazmaz, hızı %60), sıkışma (önü toprak/kum/kaya ise kıpırdamaz), altında destek 4 tane ve altına düşerse kenardan devrilir.
- Düşen/kayan kaya düşmanı ezer; üstüne düşen Reis ölür. Üstündeki Reis kayayla taşınır.
- Rüzgar kayayı iter; yukarı rüzgar kayayı kaldırır (kaya rüzgarı kapatır: ışın kayada durur). Kaya her karede ışın yeniden kurulur.
- yatay(): basamak çıkma artık sadece alttaki 2 tane yüksekliğindeki engellerde (yüksek kayaya tırmanmaz).
- Kum yayılıp ince tabaka olur, bu yüzden kayayı sıkıştıran engel TOPRAK (d) blok (L22, L29).
- Bölümler: 21 it-düşür, 22 toprağa sıkış+zıpla, 23 buldozer (taşla ez, çukura tıkaç, zıpla), 24 kuşa düşür (2 kaya), 25 rüzgar kayayı iter, 26 kaya asansörü (yukarı rüzgar), 27 kaya merdiven, 28 direk aşma, 29 iki kaya, 30 final (köprü+kapak+kuş).
- Düşmanların çukura/kenara düşmemesi için 1 karelik `d` kenar (lip) kullanıldı; pompa görüş çizgisi lip'e takılır, lip'in üstünden pompalanır.
- v0.22: bölüm 23 yenilendi; kaya arkasında mağara gölgesi izi kalmıyor (TAS magara sayılmaz).

## v0.23 — Dikenler, testereler, sallanan toplar (bölüm 31-45)
- Bölüm 20: başlangıç sütun 1'e alındı. Kayanın gri izi (magara) kaldırıldı: kaya hücreleri şeffaf çiziliyor.
- `A` yer dikeni, `W` tavan dikeni: sadece Reis'i öldürür; kum/kaya hücrenin >=%50'sini örterse etkisiz olur.
- `X` sabit testere, `N` raydaki testere (sadece Reis'i öldürür). `Y`/`Z` dokununca sağa/sola fırlayan testere (Reis'i ve düşmanları keser; kapağa çarparsa yerine döner, başka yere çarparsa durur).
- `S` sürekli sallanan, `P` dokununca sallanan dikenli top (düşmanları da öldürür). Zincir boyu bölümde `zincir` (kare). Metal zincir + parlama efekti.
- 31-35 dikenler, 36-40 testereler, 41-45 toplar; öncekiler (kaya, kapak, pervane, eğilme, zıplama) karışık kullanıldı.

## v0.24
- Bölüme `dusmanYon: -1` eklenebilir (düşmanlar sola, Reis'e doğru başlar). 16 ve 20'de kullanıldı; 20'de düşman alanı yeniden düzenlendi.
- 22: toprak engel çukurun hemen yanına alındı. 32: çukur 6 geniş (atlanamaz, kaya şart).
- 34, 35, 42, 44, 45: ahtapot alanı genişletildi (çıkıntının sağı 5-6 kare). 35'e kuş eklendi, 34'ten zemin dikeni çıkarıldı.
- Zincir gerçek halkalı zincir çiziliyor, parlama efekti kaldırıldı.
