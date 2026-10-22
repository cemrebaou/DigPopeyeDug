// Reklam katmanı. Web'de (GitHub Pages) hiçbir şey yapmaz, sadece telefondaki uygulamada çalışır.
// Üç reklam türü var:
//  - Ödüllü: canlar bitince "reklam izle, devam et" (odulluIzle)
//  - Geçiş: her 10 bölüm geçişinde bir (bolumGecti)
//  - Açılış (app open): uygulama açılınca ve arka plandan dönünce (acilisGoster)
// Banner YOK: oyunu reklamla boğmamak için kaldırıldı.
//
// ÖNEMLİ: Eklenti "göster" çağrısını reklam kapanmadan da bitirebiliyor. Bu yüzden her reklamın
// gerçekten KAPANDIĞINI olaylardan (Dismissed / Closed) bekliyoruz. Yoksa reklam kapanır kapanmaz
// uygulamaya "geri döndün" sanılıp üst üste ikinci (açılış) reklamı çıkıyordu.
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

  const ACILIS_ARALIK = 60000; // iki açılış reklamı arası en az 60 sn
  let hazir = false;
  let mesgul = false;      // tam ekran reklam açıkken true
  let sonReklam = 0;       // en son reklamın kapandığı an
  let sonAcilis = 0;       // en son açılış reklamının gösterildiği an
  let arkaPlandaydi = 0;   // uygulamanın arka plana gittiği an
  const SAYAC = "dpd_gecis_say";

  const say = () => { try { return +localStorage.getItem(SAYAC) || 0; } catch (e) { return 0; } };
  const sayYaz = (v) => { try { localStorage.setItem(SAYAC, v); } catch (e) {} };

  // Eklenti olayına abone ol; hata olursa boş bir "kaldır" döner
  const dinle = async (ad, f) => {
    try { return await AdMob.addListener(ad, f); } catch (e) { return { remove: () => {} }; }
  };
  // Verilen olaylardan biri gelene (ya da süre dolana) kadar bekler. Önce abone olunur, sonra
  // { bitti: Promise } döner; reklam gösterilmeden ÖNCE çağrılmalı ki olay kaçmasın.
  async function kapanmayiBekle(olaylar, sureMs) {
    let bit;
    const bitti = new Promise((r) => { bit = r; });
    const tutacaklar = [];
    let kapali = false;
    const son = () => { if (kapali) return; kapali = true; tutacaklar.forEach((t) => { try { t.remove(); } catch (e) {} }); bit(); };
    for (const o of olaylar) tutacaklar.push(await dinle(o, son));
    setTimeout(son, sureMs);
    return { bitti };
  }

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
        // Başka bir reklam kapanınca da sayfa "geri geldi" olur; onu sayma
        if (mesgul || Date.now() - sonReklam < 4000 || !arkaPlandaydi) return;
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
    if (!hazir || mesgul || Date.now() - sonAcilis < ACILIS_ARALIK) return;
    mesgul = true;
    try {
      await AdMob.loadAppOpen(opts("acilis"));
      const kapandi = await kapanmayiBekle(["appOpenAdClosed", "appOpenAdFailedToShow"], 60000);
      await AdMob.showAppOpen();
      sonAcilis = Date.now();
      await kapandi.bitti;
    } catch (e) {}
    mesgul = false; sonReklam = Date.now();
  }

  // Bölüm geçilince çağır: her gecisSikligi bölümde bir geçiş reklamı gösterir.
  // Reklam KAPANINCA döner; oyun o zamana kadar bekler. Reklam gösterilemezse (internet yok / yüklenmedi)
  // sayaç sıfırlanmaz, bir sonraki bölümde tekrar denenir.
  async function bolumGecti() {
    const n = say() + 1;
    sayYaz(n);
    if (n < C.gecisSikligi || !hazir || mesgul) return;
    mesgul = true;
    let gosterildi = false;
    try {
      const kapandi = await kapanmayiBekle(["interstitialAdDismissed", "interstitialAdFailedToShow"], 120000);
      await AdMob.showInterstitial();
      gosterildi = true;
      await kapandi.bitti;
    } catch (e) {}
    mesgul = false; sonReklam = Date.now();
    if (gosterildi) sayYaz(0);
    gecisHazirla(); // bir sonraki için yükle (başarısız olduysa tekrar dene)
  }

  // Ödüllü reklam: sadece ödül kazanıldıysa true döner (reklam yarıda kapatılırsa false).
  // Web'de test için direkt true döner.
  async function odulluIzle() {
    if (!native) return true;
    if (!hazir || mesgul) return false;
    mesgul = true;
    let odul = false;
    const h = await dinle("onRewardedVideoAdReward", () => { odul = true; });
    try {
      const kapandi = await kapanmayiBekle(["onRewardedVideoAdDismissed", "onRewardedVideoAdFailedToShow"], 300000);
      await AdMob.prepareRewardVideoAd(opts("odullu"));
      AdMob.showRewardVideoAd().then((r) => { if (r) odul = true; }, () => {});
      await kapandi.bitti;
    } catch (e) {}
    try { h.remove(); } catch (e) {}
    mesgul = false; sonReklam = Date.now();
    return odul;
  }

  return { baslat, bolumGecti, odulluIzle, native };
})();
