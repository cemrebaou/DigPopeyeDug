# DigPopeyeDug

HTML5 (Phaser) mobil oyun. Capacitor ile Android'e, AdMob reklamlarıyla derlenir.

## Klasörler
- `www/` – oyunun kendisi (HTML/JS). GitHub Pages'te web önizlemesi olarak yayınlanır.
- `www/js/config.js` – oyun adı, paket adı ve AdMob ID'leri.
- `www/js/game.js` – oyun mantığı.
- `www/js/ads.js` – reklamlar (sadece telefondaki uygulamada çalışır).
- `scripts/hazirla.js` – Android projesini otomatik ayarlar.
- `.github/workflows/derle.yml` – her güncellemede web önizlemesini ve Android dosyalarını bulutta üretir.

## Çıktılar
Her güncellemeden sonra **Releases → Son sürüm** sayfasında:
- `oyun-test.apk` – telefona direkt kurulup denenir.
- `oyun-yayin.aab` – Play Console'a yüklenir (imza ayarlandıysa).

## Yayın imzası (bir kez)
Repo → Settings → Secrets and variables → Actions içine:
`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
