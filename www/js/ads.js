// Reklam katmanı. Web'de (GitHub Pages) hiçbir şey yapmaz, sadece telefondaki uygulamada çalışır.
// Üç reklam türü var:
//  - Ödüllü: canlar bitince "reklam izle, devam et" (odulluIzle)
//  - Geçiş: her 10 bölüm geçişinde bir (bolumGecti)
//  - Açılış (app open): uygulama açılınca ve arka plandan dönünce (acilisGoster)
// Banner YOK: oyunu reklamla boğmamak için kaldırıldı.
window.Ads = (() => {
  const C = window.OYUN_CONFIG.reklam;
  const cap = window.Capacitor;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const AdMob = native && window.capacitorStripe ? window.capacitorStripe.AdMob : null;

  // Google'ın resmi test kimlikleri (testModu açıkken bunlar kullanılır)
  const TEST = {
    gecis: "ca-app-pub-3940256099942544/1033173712",
    odullu: "ca-app-pub-3940256099942544/5224354917",
    acilis: "ca-app-pub-3940256099942544/9257395921"
  };
  const id = (k) => (C.testModu ? TEST[k] : C[k]);
  const opts = (k) => ({ adId: id(k), isTesting: C.testModu });

  let hazir = false;
  let mesgul = false;      // tam ekran reklam açıkken true (reklam kapanınca uygulamaya "dönüş" sayılmasın)
  let sonReklam = 0;       // en son reklamın kapandığı an
  let arkaPlandaydi = 0;   // uygulamanın arka plana gittiği an
  const SAYAC = "dpd_gecis_say";

  const say = () => { try { return +localStorage.getItem(SAYAC) || 0; } catch (e) { return 0; } };
  const sayYaz = (v) => { try { localStorage.setItem(SAYAC, v); } catch (e) {} };

  async function baslat() {
    if (!AdMob) return;
    try {
      await AdMob.initialize({ initializeForTesting: C.testModu });
      // AB kullanıcıları için izin formu (gerekirse gösterilir)
      try {
        const info = await AdMob.requestConsentInfo();
        if (info.isConsentFormAvailable && info.status === "REQUIRED") await AdMob.showConsentForm();
      } catch (e) {}
      hazir = true;
      gecisHazirla();
      acilisGoster(); // uygulama ilk açıldığında da göster

      // Arka plana atıp geri gelince açılış reklamı
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { arkaPlandaydi = Date.now(); return; }
        // Başka bir reklam kapandığında da sayfa "geri geldi" olur; onu sayma
        if (mesgul || Date.now() - sonReklam < 3000 || !arkaPlandaydi) return;
        if (Date.now() - arkaPlandaydi < 2000) return; // çok kısa ayrılmalar sayılmaz
        acilisGoster();
      });
    } catch (e) { console.warn("AdMob başlatılamadı", e); }
  }

  async function gecisHazirla() {
    if (!hazir) return;
    try { await AdMob.prepareInterstitial(opts("gecis")); } catch (e) {}
  }

  // Uygulama açılış reklamı (tam ekran, kapatılabilir)
  async function acilisGoster() {
    if (!hazir || mesgul) return;
    mesgul = true;
    try {
      await AdMob.loadAppOpen(opts("acilis"));
      await AdMob.showAppOpen();
    } catch (e) {}
    mesgul = false; sonReklam = Date.now();
  }

  // Bölüm geçilince çağır: her gecisSikligi bölümde bir geçiş reklamı gösterir.
  // Reklam kapanınca (ya da hiç gösterilemezse) döner; oyun bekler.
  async function bolumGecti() {
    const n = say() + 1;
    if (n < C.gecisSikligi) { sayYaz(n); return; }
    sayYaz(0);
    if (!hazir) return;
    mesgul = true;
    try { await AdMob.showInterstitial(); } catch (e) {}
    mesgul = false; sonReklam = Date.now();
    gecisHazirla();
  }

  // Ödüllü reklam: izlenirse true döner. Web'de test için direkt true döner.
  async function odulluIzle() {
    if (!native) return true;
    if (!hazir) return false;
    mesgul = true;
    let ok = false;
    try {
      await AdMob.prepareRewardVideoAd(opts("odullu"));
      ok = !!(await AdMob.showRewardVideoAd());
    } catch (e) {}
    mesgul = false; sonReklam = Date.now();
    return ok;
  }

  return { baslat, bolumGecti, odulluIzle, native };
})();
