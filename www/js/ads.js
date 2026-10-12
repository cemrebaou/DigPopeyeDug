// Reklam katmanı. Web'de (GitHub Pages) hiçbir şey yapmaz, sadece telefondaki uygulamada çalışır.
window.Ads = (() => {
  const C = window.OYUN_CONFIG.reklam;
  const cap = window.Capacitor;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const AdMob = native && window.capacitorStripe ? window.capacitorStripe.AdMob : null;

  const TEST = {
    banner: "ca-app-pub-3940256099942544/9214589741",
    gecis: "ca-app-pub-3940256099942544/1033173712",
    odullu: "ca-app-pub-3940256099942544/5224354917"
  };
  const id = (k) => (C.testModu ? TEST[k] : C[k]);
  const opts = (k) => ({ adId: id(k), isTesting: C.testModu });

  let hazir = false;
  let bitisSayaci = 0;

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
      await AdMob.showBanner({ ...opts("banner"), adSize: "ADAPTIVE_BANNER", position: "BOTTOM_CENTER", margin: 0 });
      gecisHazirla();
    } catch (e) { console.warn("AdMob başlatılamadı", e); }
  }

  async function gecisHazirla() {
    if (!hazir) return;
    try { await AdMob.prepareInterstitial(opts("gecis")); } catch (e) {}
  }

  // Oyun bitince çağır: belirli sıklıkta geçiş reklamı gösterir
  async function oyunBitti() {
    if (!hazir) return;
    bitisSayaci++;
    if (bitisSayaci % C.gecisSikligi !== 0) return;
    try { await AdMob.showInterstitial(); } catch (e) {}
    gecisHazirla();
  }

  // Ödüllü reklam: izlenirse true döner. Web'de test için direkt true döner.
  async function odulluIzle() {
    if (!native) return true;
    if (!hazir) return false;
    try {
      await AdMob.prepareRewardVideoAd(opts("odullu"));
      const odul = await AdMob.showRewardVideoAd();
      return !!odul;
    } catch (e) { return false; }
  }

  return { baslat, oyunBitti, odulluIzle, native };
})();
