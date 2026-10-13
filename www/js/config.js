// Oyunun tüm ayarları burada. AdMob ID'lerini buraya yaz.
window.OYUN_CONFIG = {
  oyunAdi: "DigPopeyeDug",
  surum: "v0.12", // sağ altta görünür
  paketAdi: "com.jawk.digpopeyedug", // Play Store'a yüklendikten sonra DEĞİŞTİRİLEMEZ

  reklam: {
    // true iken Google'ın test reklamları gösterilir (tıklamak güvenli).
    // Yayın sürümünde false yap.
    testModu: true,

    uygulamaId: "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX", // AdMob uygulama ID (~ işaretli)
    banner: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
    gecis: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",   // interstitial
    odullu: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",  // rewarded

    gecisSikligi: 3 // kaç oyun bitişinde bir geçiş reklamı
  }
};
