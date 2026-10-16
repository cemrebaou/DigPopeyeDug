// Oyunun tüm ayarları burada. AdMob ID'leri de burada.
window.OYUN_CONFIG = {
  oyunAdi: "DigPopeyeDug",
  surum: "v0.53", // sağ altta görünür
  paketAdi: "com.jawk.digpopeyedug", // Play Store'a yüklendikten sonra DEĞİŞTİRİLEMEZ

  // Pasif özellikler: kod duruyor, sadece kapalı. true yapınca geri gelir.
  ozellik: {
    bolumSecimi: false, // üstteki bölüm seçme butonu + paneli
    tamEkran: false     // tarayıcıda tam ekran butonu (telefonda zaten tam ekran)
  },

  // Can sistemi: bölüm içinde ölünce 1 can gider. Canlar bitince oyun baştan başlar
  // ya da ödüllü reklam izlenip kalınan bölümden tam canla devam edilir.
  canSayisi: 3,

  reklam: {
    // true iken Google'ın test reklamları gösterilir (tıklamak güvenli).
    // Yayın sürümünde false yap.
    testModu: true,

    uygulamaId: "ca-app-pub-7983529419004158~9043242260",
    odullu: "ca-app-pub-7983529419004158/1164752246",   // canlar bitince "reklam izle, devam et"
    acilis: "ca-app-pub-7983529419004158/9178973631",   // uygulamaya dönünce / açılınca (app open)
    gecis: "ca-app-pub-7983529419004158/3926646959",    // geçiş reklamı (interstitial)

    gecisSikligi: 10 // kaç bölüm geçişinde bir geçiş reklamı
  }
};
