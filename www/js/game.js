// DigPopeyeDug - kum fizikli kazı oyunu
//
// GENEL YAPI (neden böyle?):
// - Oyun alanı 120x144 hücrelik bir ızgara (this.g). Her hücre 6x6 piksel bir kum tanesi.
//   Kum fiziği hücre bazında çalışır; çünkü piksel bazında fizik telefonda çok yavaş olurdu,
//   hücre bazında ise 17 bin hücreyi her karede taramak rahatça yetişiyor.
// - Zemin tek bir canvas dokusuna elle piksel yazılarak çizilir (kumCiz). Her hücre için ayrı
//   sprite kullanmadık; binlerce sprite telefonda kasar. Sadece değişen ("kirli") hücreler
//   yeniden çizilir, böylece duran sahnede çizim maliyeti neredeyse sıfır.
// - Karakterler (Reis, düşmanlar, kaya, heykel) normal Phaser sprite'larıdır; ızgarayla
//   çarpışmayı govde() ile hücre kutusuna çevirerek yaparlar.
const W = 720, H = 1280;
const C = 6;                 // bir kum tanesi = 6 piksel
const HARITA_KARE = 6;       // haritadaki bir karakter = 6x6 kum tanesi (36px)
const SUTUN = 20, SATIR = 24; // harita boyutu
const KARE_PX = HARITA_KARE * C; // 36
const GX = SUTUN * HARITA_KARE; // 120
const GY = SATIR * HARITA_KARE; // 144
const OY = 130;              // oyun alanının ekrandaki üst kenarı
const ALAN_H = GY * C;       // 864
const ALT = OY + ALAN_H;     // 994
const KONTROL_Y = 1096;      // butonların ortası (altındaki 150px banner reklam için boş)

const BOS = 0, KUM = 1, KAYA = 2, KAPAK = 3, TOPRAK = 4, TAS = 5; // TAS = itilebilen kaya bloğu (hareket eder)

const REIS_OLCEK = 0.585, DUSMAN_OLCEK = 0.63;
const REIS_BOY = 126, REIS_EGIK_BOY = 85; // hitbox yükseklikleri (ayaktan yukarı px)
const EGIK_HIZ = 0.8, EGIK_OLCEK = 0.85;                       // eğik yürüme hızı çarpanı
const RUZGAR_HIZ = 110, RUZGAR_MENZIL = 84, PERVANE_OLCEK = 0.65; // rüzgar: itme hızı (px/sn), en uzun menzil (kum tanesi), pervane görsel ölçeği
const HEYKEL_BOY = 148 * PERVANE_OLCEK;          // taş heykel yüksekliği (px)
const HEYKEL_EN = HEYKEL_BOY * 0.709;             // taş heykel genişliği (görsel en/boy oranı korunur)
const HEYKEL_AGIZ_X = 0.39, HEYKEL_AGIZ_Y = 0.23; // açık ağzın merkeze göre konumu (genişlik / yükseklik oranı)
const PERVANE_YON = { ">": "r", "<": "l", "^": "u", "v": "d" };
const ZIPLA_V = 590;                        // zıplama hızı (px/sn): yaklaşık 125 px yüksekliğe çıkar
const KAYA_ITME = 0.6, KAYA_BOY = 12;       // kaya itilirken Reis hız çarpanı; kaya boyu (kum tanesi) = 2x2 harita karesi
const SALINIM_SURE = 3.8, SALINIM_ACI = 1.0;   // sallanan top: tam salınım süresi (sn) ve en büyük açı (radyan, ~57 derece)
const TESTERE_R = 28, TOP_R = 26, FIRLAMA_HIZ = 340, RAY_HIZ = 80;
const KUS_HAVA = 110;                       // kuşun hitbox alt kenarının zeminden yüksekliği (ayakta çarpar, eğikken geçer)
const YERCEKIMI = 1400, MAX_DUSME = 700;
const REIS_HIZ = 200, KAZMA_HIZ = 110;
// Pompa görselinde hortumun çıktığı nokta (görsel pikseli): [merkezden yatay, tabandan yukarı]
const POMPA_HORTUM_CIKIS = { reis_pump0: [37, 9], reis_pump1: [39, 15] };
// Boşta bekleme animasyonu zamanlaması (ms)
const IDLE_BEKLEME_MIN = 1400, IDLE_BEKLEME_MAX = 2800;           // poz 0<->1 arası bekleme
const IDLE_SABIR_ESIGI = 9000;                                     // bu kadar hareketsiz kalınca sabırsızlanır
const IDLE_SABIRSIZ_MIN = 150, IDLE_SABIRSIZ_MAX = 260;            // sabırsız pozlar (2<->3): pıt pıt pıt, ikisi de kısa ve eşit
const IDLE_KIRPMA_ARALIK_MIN = 3500, IDLE_KIRPMA_ARALIK_MAX = 7000; // normal beklemede ara sıra çift göz kırpma
const IDLE_KIRPMA_KARE_SURE = 110;                                  // kırpma: kapa-aç-kapa-aç, her kare kısa

const SPRITELAR = [
  ...[0, 1, 2, 3, 4, 5].map((i) => "reis_walk" + i),
  "reis_pump0", "reis_pump1", "reis_dus", "btn_tamekran", "kaya", "ball", "saw", "spike_up", "spike_dn",
  "pervane_kapali", "pervane_acik", // taş heykel üfleyici (ağzı kapalı / açık)
  ...[0, 1, 2, 3, 4].map((i) => "reis_egil" + i), "btn_egil", "btn_kalk",
  "reis_zipla", "reis_zipla_in", // zıplarken yükselme ve iniş pozları
  ...[0, 1, 2, 3].map((i) => "bird_walk" + i),
  ...[0, 1, 2, 3].map((i) => "bird_pump" + i), "bird_pop0",
  ...[0, 1, 2, 3, 4, 5].map((i) => "reis_idle" + i),
  ...[0, 1, 2, 3, 4, 5].map((i) => "reis_kaz" + i),
  ...[0, 1, 2, 3].map((i) => "reis_fall" + i),
  ...[0, 1, 2, 3, 4].map((i) => "crab_walk" + i),
  ...[0, 1, 2, 3].map((i) => "crab_pump" + i), "crab_pop0",
  ...[0, 1, 2].map((i) => "octo_walk" + i),
  ...[0, 1, 2, 3].map((i) => "octo_pump" + i), "octo_pop0",
  "btn_sol", "btn_sag", "btn_pompa", "btn_yeniden", "btn_bolumler", "btn_bolum_daire", "panel_bolumler", "btn_sayfa_sol", "btn_sayfa_sag",
  "bar_yesil", "bar_mor", "bar_turuncu", "panel",
  "doku_kum", "doku_tahta", "kapak_tahta", "btn_zipla"
];

const SESLER = [
  "ses_pompa", "ses_sisme", "ses_sonme", "ses_yengec_pop", "ses_ahtapot_pop",
  "ses_kum_kazma", "ses_kapak", "ses_adim1", "ses_adim2", "ses_adim3",
  "ses_dusme", "ses_dustu", "ses_kum_dokul", "ses_kum_dok", "ses_olme", "ses_kazandi",
  "ses_ayak_vur", "ses_ruzgar"
];

// Animasyon kare listeleri. Sabit tuttuk; her bölüm yeniden başlarken diziler yeniden üretilmesin.
const KARELER = {
  reis_walk: [0, 1, 2, 3, 4, 5].map((i) => "reis_walk" + i),
  reis_fall: [0, 1, 2, 3].map((i) => "reis_fall" + i),
  reis_pump: ["reis_pump0", "reis_pump1"],
  reis_kaz: [0, 1, 2, 3, 4, 5].map((i) => "reis_kaz" + i),
  crab_walk: [0, 1, 2, 3, 4].map((i) => "crab_walk" + i),
  octo_walk: [0, 1, 2].map((i) => "octo_walk" + i),
  bird_walk: [0, 1, 2, 3].map((i) => "bird_walk" + i),
  reis_egil: [0, 1, 2, 3, 4].map((i) => "reis_egil" + i)
};

const DUSMAN_TIP = {
  c: { ad: "crab", hiz: 65, w: 81, h: 63 },
  o: { ad: "octo", hiz: 48, w: 99, h: 66 },
  b: { ad: "bird", hiz: 115, w: 60, h: 46, ucar: true }
};

const YAZI = { fontFamily: "Arial Black, Arial", fontStyle: "bold", color: "#ffffff", stroke: "#3b2412", strokeThickness: 8 };

function kayitOku(k, v) { try { const x = localStorage.getItem(k); return x === null ? v : JSON.parse(x); } catch (e) { return v; } }
function kayitYaz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

// Oyuncunun ulaştığı en yüksek bölüm (1'den başlar). Eskiden aynı hesap 3 yerde tekrar ediyordu;
// tek fonksiyona aldık. Eski sürümlerin kayıt anahtarları (dpd_acilan_bolum, dpd_bolum) da okunur,
// böylece güncelleme gelince kimsenin ilerlemesi kaybolmaz. Kayıt sadece yükselir, asla düşmez.
function enYuksekBolum(enAz = 1) {
  const deger = Math.max(enAz, kayitOku("dpd_en_yuksek_bolum", 1), kayitOku("dpd_acilan_bolum", 1), kayitOku("dpd_bolum", 0) + 1);
  kayitYaz("dpd_en_yuksek_bolum", deger);
  return deger;
}

// Zemin dokuları (her malzemenin ekran boyutunda piksel kaynağı). Bir kere hesaplanır ve saklanır;
// çünkü 720x864 pikselin her bölümde yeniden işlenmesi yeniden başlatmada takılmaya yol açıyordu.
let DOKU_ONBELLEK = null;

// RGBA (little-endian) -> Uint32
const renk32 = (r, g, b, a = 255) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
// Rengi f ile çarp (ışık/gölge)
function carp(c, f) {
  let r = (c & 255) * f, g = ((c >>> 8) & 255) * f, b = ((c >>> 16) & 255) * f;
  if (r > 255) r = 255; if (g > 255) g = 255; if (b > 255) b = 255;
  return ((c & 0xff000000) | (b << 16) | (g << 8) | r) >>> 0;
}

class Oyun extends Phaser.Scene {
  constructor() { super("Oyun"); }

  init(data) {
    this.bolum = data && data.bolum !== undefined ? data.bolum : kayitOku("dpd_bolum", 0);
    if (this.bolum >= BOLUMLER.length) this.bolum = 0;
    this.skor = data && data.skor ? data.skor : 0;
    this.baslangicSkor = this.skor;
    // Tur: bütün bölümler bitince baştan başlanır, her turda hızlar %25 artar (100, 125, 150, 175...)
    this.tur = data && data.tur !== undefined ? data.tur : kayitOku("dpd_tur", 0);
    this.hizCarpan = 1 + 0.25 * this.tur;

    // Ulaşılan en yüksek bölüm kalıcı korunur (eski bir bölüm seçilse bile kaybolmaz)
    enYuksekBolum(this.bolum + 1);
  }

  preload() {
    SPRITELAR.forEach((k) => this.load.image(k, "assets/" + k + ".png"));
    SESLER.forEach((k) => this.load.audio(k, "assets/ses/" + k + ".mp3"));
  }

  // Ses çal (dosya yoksa ya da tarayıcı engellerse sessizce geç)
  ses(key, ayar) {
    try { if (this.cache.audio.exists(key)) this.sound.play(key, ayar); } catch (e) {}
  }

  // Düşme sesi: sadece havadayken çalar, yere değince kısa sürede kısılıp durur
  dusmeSesiDurdur() {
    const s = this.dusmeSes;
    if (!s) return;
    this.dusmeSes = null;
    try {
      this.tweens.add({ targets: s, volume: 0, duration: 80, onComplete: () => { try { s.stop(); s.destroy(); } catch (e) {} } });
    } catch (e) {}
  }

  // Bu sahnenin kendi ürettiği dokular (zemin, alt kaya, kapak tahtaları). Eskiden her yeniden
  // başlatmada "zemin"+Date.now() gibi yeni anahtarla üretilip hiç silinmiyordu; her bölümde
  // birkaç MB bellek birikiyordu. Artık takip edilip bir sonraki create()'te siliniyor.
  geciciDoku(key) { (this.geciciDokular || (this.geciciDokular = [])).push(key); return key; }
  geciciDokulariSil() {
    for (const k of this.geciciDokular || []) if (this.textures.exists(k)) this.textures.remove(k);
    this.geciciDokular = [];
  }

  create() {
    this.geciciDokulariSil(); // önceki bölümün sprite'ları zaten yok edildi, dokuları da boşaltılır
    if (this.dusmeSes) { try { this.dusmeSes.stop(); this.dusmeSes.destroy(); } catch (e) {} }
    if (this.ruzgarSes) { try { this.ruzgarSes.stop(); this.ruzgarSes.destroy(); } catch (e) {} }
    this.ruzgarSes = null;
    this.dusmeSes = null; this.kumSayac = 0; this.sonKumSes = 0; this.sonKazmaSes = 0;
    this.durum = "oyun";
    this.kare = 0;
    this.tuslar = { sol: false, sag: false };
    this.devamHakki = true;
    this.dokunulmaz = 0;

    this.kareler = KARELER;
    this.arkaPlan();
    this.haritaYukle(BOLUMLER[this.bolum]);
    this.dokulariHazirla();
    this.altKaya();

    // Zemin, ekran çözünürlüğünde (1:1) çizilir; büyütme yok, bulanıklık yok.
    // Piksel dizisi (Uint32Array) doğrudan ImageData'nın belleğini kullanır: renk yazmak tek atama.
    this.kumTex = this.textures.createCanvas(this.geciciDoku("zemin" + Date.now()), W, ALAN_H);
    this.add.image(0, OY, this.kumTex.key).setOrigin(0).setDepth(1);
    this.imgData = this.kumTex.context.createImageData(W, ALAN_H);
    this.piksel = new Uint32Array(this.imgData.data.buffer);

    this.kapakCizim = this.add.graphics().setDepth(2);
    this.kapakDegisti = true;
    this.kapakKur();
    this.hortum = this.add.graphics().setDepth(4);

    this.reis.spr = this.add.image(this.reis.x, this.reis.y, "reis_walk0").setOrigin(0.5, 1).setScale(REIS_OLCEK).setDepth(5);
    this.dusmanlar.forEach((d) => {
      d.spr = this.add.image(d.x, d.tip.ucar ? d.y - d.h / 2 : d.y, d.tip.ad + "_walk0").setOrigin(0.5, d.tip.ucar ? 0.5 : 1).setScale(DUSMAN_OLCEK).setDepth(3);
    });

    this.kayalar.forEach((k) => {
      k.sx = k.gx * C; k.sy = OY + k.gy * C;
      k.spr = this.add.image(k.sx, k.sy, "kaya").setOrigin(0, 0).setDisplaySize(k.w * C, k.h * C).setDepth(3.5);
    });
    this.tehlikeKur();
    this.pervaneKur();
    this.ruzgarCizim = this.add.graphics().setDepth(6);
    this.ruzgarSay = 0;
    this.parcacikKur();

    this.arayuz();
    this.kontroller();
    this.tumunuKirlet();
    this.kumCiz();
  }

  parcacikKur() {
    if (!this.textures.exists("p_kum")) {
      const cv = document.createElement("canvas");
      cv.width = 6; cv.height = 6;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#c79860";
      ctx.beginPath();
      ctx.arc(3, 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("p_kum", cv);
    }
    if (!this.textures.exists("p_pop")) {
      const cv = document.createElement("canvas");
      cv.width = 8; cv.height = 8;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("p_pop", cv);
    }
    try {
      this.kumParcacik = this.add.particles(0, 0, "p_kum", {
        speed: { min: 40, max: 130 },
        scale: { start: 1, end: 0.2 },
        alpha: { start: 0.9, end: 0 },
        lifespan: { min: 200, max: 400 },
        gravityY: 500,
        emitting: false
      }).setDepth(14);
      this.popParcacik = this.add.particles(0, 0, "p_pop", {
        speed: { min: 90, max: 260 },
        scale: { start: 1.3, end: 0.2 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 350, max: 600 },
        gravityY: 450,
        emitting: false
      }).setDepth(14);
    } catch (e) {}
  }

  arkaPlan() {
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x5bb8f0, 0x5bb8f0, 0xbfe9ff, 0xbfe9ff, 1);
    g.fillRect(0, 0, W, ALT);
  }

  // ---------- Dokular ----------
  // Her malzeme için ekran boyutunda bir piksel kaynağı hazırlanır
  dokulariHazirla() {
    if (DOKU_ONBELLEK) { this.src = DOKU_ONBELLEK; return; }
    const doku = (key) => {
      const img = this.textures.get(key).getSourceImage();
      const cv = document.createElement("canvas");
      cv.width = W; cv.height = ALAN_H;
      const cx = cv.getContext("2d");
      for (let y = 0; y < ALAN_H; y += img.height) for (let x = 0; x < W; x += img.width) cx.drawImage(img, x, y);
      return cx.getImageData(0, 0, W, ALAN_H).data;
    };
    const kum = doku("doku_kum"), tahta = doku("doku_tahta");
    const n = W * ALAN_H;
    const yap = (kaynak, f) => {
      const out = new Uint32Array(n);
      for (let i = 0, p = 0; i < n; i++, p += 4) out[i] = f(kaynak[p], kaynak[p + 1], kaynak[p + 2]);
      return out;
    };
    const sinir = (v) => (v > 255 ? 255 : v < 0 ? 0 : v) | 0;
    const orijinal = yap(kum, (r, g, b) => renk32(r, g, b));

    this.src = {
      [KUM]: yap(kum, (r, g, b) => renk32(sinir(r * 0.85), sinir(g * 1.0), sinir(b * 1.1))), // orijinal v0.26 doğal kum tonu
      [TOPRAK]: orijinal, // sabit kalan zemin: orijinal sarı kum
      [KAYA]: orijinal,
      [KAPAK]: yap(tahta, (r, g, b) => renk32(sinir(r * 1.45), sinir(g * 1.2), sinir(b * 0.95))),
      magara: yap(kum, (r, g, b) => renk32(sinir(r * 0.24), sinir(g * 0.16), sinir(b * 0.12)))
    };
    DOKU_ONBELLEK = this.src;
  }

  // Butonların arkası: oyun alanındaki gri kaya kesintisiz aşağı devam eder
  altKaya() {
    const yuk = H - ALT, img = this.textures.get("doku_kum").getSourceImage();
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = yuk;
    const cx = cv.getContext("2d");
    const bas = -(ALAN_H % img.height);
    for (let y = bas; y < yuk; y += img.height) for (let x = 0; x < W; x += img.width) cx.drawImage(img, x, y);
    const key = this.geciciDoku("altkaya" + Date.now());
    this.textures.addCanvas(key, cv);
    this.add.image(0, ALT, key).setOrigin(0).setDepth(0);
  }

  haritaYukle(bolum) {
    this.g = new Uint8Array(GX * GY);
    this.srcI = new Int32Array(GX * GY); // kum tanesinin dokudaki yeri (düşerken dokusunu taşır)
    this.engel = new Uint8Array(GX * GY);
    this.durgun = new Uint8Array(GX * GY); // kum tanesi kaç karedir hareketsiz
    this.kirli = new Uint8Array(GX * GY);
    this.dusmanlar = [];
    this.pervaneler = [];
    this.dikenler = []; this.testereler = []; this.toplar = [];
    this.ruzgarYon = new Uint8Array(GX * GY);
    this.reis = null;
    const satirlar = bolum.harita.slice();
    while (satirlar.length < SATIR) satirlar.push("#".repeat(SUTUN));

    for (let r = 0; r < SATIR; r++) {
      const s = satirlar[r].padEnd(SUTUN, "#");
      for (let c = 0; c < SUTUN; c++) {
        const ch = s[c];
        let tip = BOS;
        if (ch === "d") tip = TOPRAK;
        else if (ch === "s") tip = KUM;
        else if (ch === "#") tip = KAYA;
        else if (ch === "k") tip = KAPAK;
        for (let y = 0; y < HARITA_KARE; y++) for (let x = 0; x < HARITA_KARE; x++) {
          const i = (r * HARITA_KARE + y) * GX + c * HARITA_KARE + x;
          this.g[i] = tip;
          this.srcI[i] = i;
        }
        const px = c * KARE_PX + KARE_PX / 2, py = OY + (r + 1) * KARE_PX;
        if (ch === "R") this.reis = { x: px, y: py, w: 45, h: REIS_BOY, egik: false, vy: 0, yon: px > W / 2 ? -1 : 1, yerde: false, kare: 0, pompa: 0, olu: false };
        const tepe = OY + r * KARE_PX, taban = tepe + KARE_PX;
        if (ch === "A") this.dikenler.push({ tip: "yer", x: px, y0: taban - 48, y1: taban, gx: c * HARITA_KARE, gy: r * HARITA_KARE, aktif: true });
        if (ch === "W") this.dikenler.push({ tip: "tavan", x: px, y0: tepe, y1: tepe + 38, gx: c * HARITA_KARE, gy: r * HARITA_KARE, aktif: true });
        if (ch === "X") this.testereler.push({ mod: "sabit", x: px, y: taban - TESTERE_R, yon: 1, durum: "don", aci: 0 });
        if (ch === "N") this.testereler.push({ mod: "ray", x: px, y: taban - TESTERE_R, yon: 1, durum: "don", aci: 0 });
        if (ch === "Y" || ch === "Z") this.testereler.push({ mod: "firlat", x0: px, x: px, y: taban - TESTERE_R, yon: ch === "Y" ? 1 : -1, durum: "bekle", aci: 0 });
        if (ch === "S" || ch === "P") this.toplar.push({ mod: ch === "S" ? "oto" : "dokun", px, py: tepe + KARE_PX / 2, uz: (bolum.zincir || 4) * KARE_PX, amp: ch === "S" ? SALINIM_ACI : 0, acik: ch === "S", t: 0, x: px, y: tepe + KARE_PX / 2 });
        if (PERVANE_YON[ch]) this.pervaneler.push({ yon: PERVANE_YON[ch], px, py, acik: false });
        if (DUSMAN_TIP[ch]) {
          const t = DUSMAN_TIP[ch];
          this.dusmanlar.push({ tip: t, x: px, y: t.ucar ? py - KUS_HAVA : py, zemin: py, faz: Math.random() * 6.28, w: t.w, h: t.h, vy: 0, yon: bolum.dusmanYon || (Math.random() < 0.5 ? -1 : 1), kare: 0, sisme: 0, sonPompa: 0, olu: false });
        }
      }
    }
    // Kaya blokları: haritada 'T' ile işaretli 2x2 karelik kümeler
    this.kayalar = [];
    const alinmis = new Set();
    for (let r = 0; r < SATIR; r++) {
      const s = satirlar[r].padEnd(SUTUN, "#");
      for (let c = 0; c < SUTUN; c++) {
        if (s[c] !== "T" || alinmis.has(r * SUTUN + c)) continue;
        [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([a, b]) => alinmis.add((r + a) * SUTUN + c + b));
        const k = { gx: c * HARITA_KARE, gy: r * HARITA_KARE, w: KAYA_BOY, h: KAYA_BOY, vy: 0, dy: 0, rx: 0, ry: 0 };
        this.kayalar.push(k);
        this.kayaYaz(k, TAS);
      }
    }
    if (!this.reis) this.reis = { x: 60, y: OY, w: 45, h: REIS_BOY, egik: false, vy: 0, yon: 1, yerde: false, kare: 0, pompa: 0, olu: false };

    // Mağara arka planı: başlangıçta üstünde dolu bir şey olan boş kareler
    this.magara = new Uint8Array(GX * GY);
    for (let x = 0; x < GX; x++) {
      let yer = false;
      for (let y = 0; y < GY; y++) {
        // Kaya bloğu (TAS) mağara saymaz: hareket eden bir nesne. Açıktaki kaya kalkınca arkası gökyüzü olur, mağara izi kalmaz.
        if (this.g[y * GX + x] !== BOS && this.g[y * GX + x] !== TAS) yer = true;
        if (yer) this.magara[y * GX + x] = 1;
      }
    }
  }

  // ---------- Arayüz ----------
  arayuz() {
    this.add.text(24, 34, BOLUMLER[this.bolum].ad, { ...YAZI, fontSize: "38px" }).setDepth(10);
    this.skorYazi = this.add.text(W / 2 + 25, 34, "Skor: " + this.skor, { ...YAZI, fontSize: "38px", color: "#ffe066" }).setOrigin(0.5, 0).setDepth(10);
    this.ipucu = this.add.text(W / 2, 100, BOLUMLER[this.bolum].ipucu || "Kapaklara dokun, açılsın!", { ...YAZI, fontSize: "26px", color: "#fff3c4", strokeThickness: 6 }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: this.ipucu, alpha: 0, delay: 4000, duration: 800 });

    // Yeniden başla butonu
    this.ikonButon(W - 56, 62, "btn_yeniden", 84, () => this.scene.restart({ bolum: this.bolum, skor: this.baslangicSkor, tur: this.tur }));

    // Bölüm Seçme Menüsü (Mavi taş buton)
    this.ikonButon(W - 56 - 94, 62, "btn_bolumler", 84, () => this.bolumSecimEkraniAc());

    // Tam ekran (sadece tarayıcıda; telefondaki uygulamada zaten tam ekran)
    if (!Ads.native && this.sys.game.device.fullscreen.available) {
      this.ikonButon(W - 56 - 94 - 94, 62, "btn_tamekran", 84, () => {
        if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen();
      });
    }
  }

  bolumSecimEkraniAc() {
    if (this.bolumPaneliAcik) return;
    this.bolumPaneliAcik = true;

    const overlay = this.add.container(0, 0).setDepth(60);

    // Arka plan karartması
    const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65).setInteractive();
    overlay.add(bg);

    // Büyük ahşap pano (çapalı). Görselin en/boy oranı korunur ki çerçeve ve çapa yamulmasın.
    const panelH = 1000, panelW = Math.round(panelH * 0.582);
    const panelY = H / 2 - 15;
    const panel = this.add.image(W / 2, panelY, "panel_bolumler");
    panel.setDisplaySize(panelW, panelH);
    overlay.add(panel);

    // Başlık
    // Başlık, çapa ve ipin hemen altında, parşömenin üst kısmında
    const baslik = this.add.text(W / 2, panelY - 300, "BÖLÜMLER", {
      ...YAZI,
      fontSize: "44px",
      color: "#ffd670",
      stroke: "#3d240e",
      strokeThickness: 8
    }).setOrigin(0.5);
    overlay.add(baslik);

    // Kapatma butonu (Sağ üst "✖")
    const kapatBtn = this.add.text(W / 2 + panelW / 2 - 85, panelY - 300, "✖", {
      fontFamily: "Arial Black, Arial",
      fontSize: "40px",
      color: "#ff7675",
      stroke: "#2d1606",
      strokeThickness: 6
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    kapatBtn.on("pointerdown", () => {
      this.bolumPaneliAcik = false;
      overlay.destroy();
    });
    overlay.add(kapatBtn);

    // Sadece açılmış bölümler gösterilir (ulaşılan en yüksek bölüme kadar)
    const toplamGosterilecek = Math.min(enYuksekBolum(this.bolum + 1), BOLUMLER.length);

    // Sayfalı seviye ızgarası: 3 sütun x 4 satır, alttaki oklarla sayfa değişir
    const sutunSayisi = 3, satirSayisi = 4, sayfaBasi = sutunSayisi * satirSayisi;
    // Ölçüler parşömenin iç alanına (çerçevenin içi) sığacak şekilde seçildi
    const butonCapi = 116, aralikX = 146, aralikY = 145;
    const baslangicX = W / 2 - aralikX;
    const baslangicY = panelY - 200;
    const sayfaSayisi = Math.max(1, Math.ceil(toplamGosterilecek / sayfaBasi));
    let sayfa = Math.min(sayfaSayisi - 1, Math.floor(Math.min(this.bolum, toplamGosterilecek - 1) / sayfaBasi));

    const izgara = this.add.container(0, 0);
    overlay.add(izgara);

    const sayfaCiz = () => {
      izgara.removeAll(true);
      const ilk = sayfa * sayfaBasi, bitis = Math.min(toplamGosterilecek, ilk + sayfaBasi);
      for (let idx = ilk; idx < bitis; idx++) {
        const k = idx - ilk;
        const bx = baslangicX + (k % sutunSayisi) * aralikX;
        const by = baslangicY + Math.floor(k / sutunSayisi) * aralikY;

        const btnItem = this.add.image(bx, by, "btn_bolum_daire");
        btnItem.setDisplaySize(butonCapi, butonCapi).setInteractive({ useHandCursor: true });

        // Üzerindeki bölüm numarası
        const noTxt = this.add.text(bx, by, (idx + 1).toString(), {
          ...YAZI,
          fontSize: "46px",
          color: idx === this.bolum ? "#ffeaa7" : "#ffffff",
          stroke: "#3d240e",
          strokeThickness: 8
        }).setOrigin(0.5);

        // Aktif oynanan bölüm vurgusu
        if (idx === this.bolum) {
          btnItem.setTint(0xfffae6);
          this.tweens.add({
            targets: btnItem,
            scaleX: (butonCapi / btnItem.width) * 1.06,
            scaleY: (butonCapi / btnItem.height) * 1.06,
            yoyo: true,
            repeat: -1,
            duration: 600
          });
        }

        const hedefBolum = idx;
        btnItem.on("pointerdown", () => {
          this.ses("ses_kapak", { volume: 0.8 });
          this.bolumPaneliAcik = false;
          overlay.destroy();
          this.scene.restart({ bolum: hedefBolum, skor: 0, tur: this.tur });
        });

        izgara.add(btnItem);
        izgara.add(noTxt);
      }
      sayfaTxt.setText((sayfa + 1) + " / " + sayfaSayisi);
      solOk.setAlpha(sayfa > 0 ? 1 : 0.35);
      sagOk.setAlpha(sayfa < sayfaSayisi - 1 ? 1 : 0.35);
    };

    // Alt boşlukta sayfa okları ve sayfa numarası
    const okY = panelY + 352, okBoy = 100;
    const okButon = (x, key, yon) => {
      const b = this.add.image(x, okY, key).setInteractive({ useHandCursor: true });
      const olcek = okBoy / b.width;
      b.setScale(olcek);
      b.on("pointerdown", () => {
        b.setScale(olcek * 0.9);
        const yeni = sayfa + yon;
        if (yeni < 0 || yeni >= sayfaSayisi) return;
        sayfa = yeni;
        this.ses("ses_kapak", { volume: 0.5 });
        sayfaCiz();
      });
      const geri = () => b.setScale(olcek);
      b.on("pointerup", geri);
      b.on("pointerout", geri);
      overlay.add(b);
      return b;
    };
    const solOk = okButon(W / 2 - 150, "btn_sayfa_sol", -1);
    const sagOk = okButon(W / 2 + 150, "btn_sayfa_sag", 1);
    const sayfaTxt = this.add.text(W / 2, okY, "", {
      ...YAZI,
      fontSize: "38px",
      color: "#ffd670",
      stroke: "#3d240e",
      strokeThickness: 7
    }).setOrigin(0.5);
    overlay.add(sayfaTxt);

    sayfaCiz();
  }

  // Resimli buton: basınca küçülür
  ikonButon(x, y, key, boyut, bas, birak) {
    const b = this.add.image(x, y, key).setDepth(20).setInteractive({ useHandCursor: true });
    const olcek = boyut / b.width;
    b.setScale(olcek);
    b.on("pointerdown", () => { b.setScale(olcek * 0.9); bas && bas(); });
    const geri = () => { b.setScale(olcek); birak && birak(); };
    b.on("pointerup", geri);
    b.on("pointerout", geri);
    return b;
  }

  kontroller() {
    this.input.addPointer(3);
    // Butonlar (aralar sıkı): sol, sağ, eğil, pompa
    this.ikonButon(91, KONTROL_Y, "btn_sol", 170, () => (this.tuslar.sol = true), () => (this.tuslar.sol = false));
    this.ikonButon(265, KONTROL_Y, "btn_sag", 170, () => (this.tuslar.sag = true), () => (this.tuslar.sag = false));
    this.egilBtn = this.ikonButon(439, KONTROL_Y, "btn_egil", 170, () => this.egilTikla());
    this.ikonButon(618, KONTROL_Y, "btn_pompa", 180, () => this.pompala());
    this.ikonButon(618, 926, "btn_zipla", 120, () => this.zipla()).setAlpha(0.92); // zıpla
    this.add.text(W - 10, H - 8, (window.OYUN_CONFIG && OYUN_CONFIG.surum) || "v0.01", { fontFamily: "Arial", fontSize: "22px", color: "#ffffff", stroke: "#3b2412", strokeThickness: 4 }).setOrigin(1, 1).setDepth(30);

    // Kapaklara dokunma
    this.input.on("pointerdown", (p) => {
      if (this.durum !== "oyun" || p.y < OY || p.y >= ALT) return;
      const gx = Math.floor(p.x / C), gy = Math.floor((p.y - OY) / C);
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const x = gx + dx, y = gy + dy;
        if (x >= 0 && x < GX && y >= 0 && y < GY && this.g[y * GX + x] === KAPAK) { this.kapakAc(x, y); return; }
      }
    });

    // Bilgisayarda test için klavye
    const k = this.input.keyboard;
    if (k) {
      k.on("keydown-LEFT", () => (this.tuslar.sol = true));
      k.on("keyup-LEFT", () => (this.tuslar.sol = false));
      k.on("keydown-RIGHT", () => (this.tuslar.sag = true));
      k.on("keyup-RIGHT", () => (this.tuslar.sag = false));
      k.on("keydown-SPACE", () => this.pompala());
      k.on("keydown-DOWN", () => { if (!this.reis.egik) this.egilTikla(); });
      k.on("keydown-UP", () => { if (this.reis.egik) this.egilTikla(); else this.zipla(); });
      k.on("keydown-R", () => this.scene.restart({ bolum: this.bolum, skor: this.baslangicSkor, tur: this.tur }));
    }
  }

  // Eğil / kalk: bir kez basınca eğik kalır, tekrar basınca kalkar (tavan alçaksa kalkamaz)
  egilTikla() {
    const r = this.reis;
    if (this.durum !== "oyun" || r.olu) return;
    if (!r.egik) r.egik = true;
    else if (this.kalkabilir(r)) r.egik = false;
  }

  // Zıpla: sadece yerdeyken (eğikse önce kalkar)
  zipla() {
    const r = this.reis;
    if (this.durum !== "oyun" || r.olu || !r.yerde) return;
    if (r.egik) { if (this.kalkabilir(r)) r.egik = false; else return; }
    r.vy = -ZIPLA_V; r.yerde = false; r.zipliyor = true; r.ziplaGecen = 0;
    r.idleSure = 0;
    this.ses("ses_adim2", { volume: 0.7, detune: 400 });
  }

  // ---------- Kaya ----------
  kayaYaz(k, tip) {
    for (let y = k.gy; y < k.gy + k.h; y++) for (let x = k.gx; x < k.gx + k.w; x++) {
      if (y < 0 || y >= GY) continue;
      const i = y * GX + x;
      this.g[i] = tip; this.kirlet(i);
    }
  }

  // Reis'in hemen önündeki (1 px) kaya
  kayaOnde(r, yon) {
    const b = this.govde(r, yon);
    const sx = yon > 0 ? b.x1 : b.x0;
    for (const k of this.kayalar) {
      if (sx < k.gx || sx >= k.gx + k.w) continue;
      for (let y = b.y0; y <= b.y1; y++) if (y >= k.gy && y < k.gy + k.h) return k;
    }
    return null;
  }

  // Reis kayayı iter: kaya bir tane (6 px) ilerler, Reis arkasından yürür. Önü kumsa/kayaysa kaya sıkışır.
  kayaIt(r, k, yon, hizx) {
    const kenar = yon > 0 ? k.gx * C - (r.x + r.w / 2) : (r.x - r.w / 2) - (k.gx + k.w) * C;
    if (kenar < 1.5) this.kayaKay(k, yon, 0, true);
    return this.yatay(r, hizx * KAYA_ITME, false);
  }

  // Kayayı bir kum tanesi kaydır (sx,sy ∈ -1,0,1). Boşsa kayar, ezdiği düşmanı patlatır, üstündeki Reis'i taşır.
  kayaKay(k, sx, sy, reisItiyor) {
    if (k.gx + sx < 0 || k.gx + sx + k.w > GX) return false;
    if (sx) { const cx = sx > 0 ? k.gx + k.w : k.gx - 1; for (let y = k.gy; y < k.gy + k.h; y++) if (this.hucre(cx, y) !== BOS) return false; }
    if (sy) {
      const cy = sy > 0 ? k.gy + k.h : k.gy - 1;
      if (cy < 0) return false;
      for (let x = k.gx; x < k.gx + k.w; x++) if (this.hucre(x, cy) !== BOS) return false;
    }
    const r = this.reis;
    const nx0 = (k.gx + sx) * C, nx1 = (k.gx + sx + k.w) * C, ny0 = OY + (k.gy + sy) * C, ny1 = OY + (k.gy + sy + k.h) * C;
    // Reis kayanın üstünde mi duruyor (taşınacak)
    const uste = !r.olu && r.yerde && Math.floor((r.y - OY) / C) === k.gy && r.x + r.w / 2 > k.gx * C && r.x - r.w / 2 < (k.gx + k.w) * C;
    if (uste && sy < 0) { const bb = this.govde(r, 0, -C); for (let x = bb.x0; x <= bb.x1; x++) if (this.katiMi(x, bb.y0)) return false; } // üstündeki Reis tavana sıkışmasın
    if (!r.olu && !reisItiyor && !uste) {
      const ox = Math.min(nx1, r.x + r.w / 2) - Math.max(nx0, r.x - r.w / 2), oy = Math.min(ny1, r.y) - Math.max(ny0, r.y - r.h);
      if (ox > 2 && oy > 2) { if (sy > 0) { if (this.dokunulmaz <= 0) this.olum(); } else return false; }
    }
    // yeni hücreler
    if (sx) { const ex = sx > 0 ? k.gx : k.gx + k.w - 1, yx = sx > 0 ? k.gx + k.w : k.gx - 1; for (let y = k.gy; y < k.gy + k.h; y++) { this.g[y * GX + ex] = BOS; this.kirlet(y * GX + ex); this.g[y * GX + yx] = TAS; this.kirlet(y * GX + yx); } }
    if (sy) {
      const ey = sy > 0 ? k.gy : k.gy + k.h - 1, yy = sy > 0 ? k.gy + k.h : k.gy - 1;
      for (let x = k.gx; x < k.gx + k.w; x++) {
        this.g[ey * GX + x] = BOS; this.kirlet(ey * GX + x);
        if (yy < GY) { this.g[yy * GX + x] = TAS; this.kirlet(yy * GX + x); }
      }
    }
    k.gx += sx; k.gy += sy;
    if (uste) {
      if (sx) this.yatay(r, sx * C, false);
      if (sy) r.y += sy * C;
    }
    // ezilen düşmanlar
    for (const d of this.dusmanlar) {
      if (d.olu) continue;
      const ox = Math.min(nx1, d.x + d.w / 2) - Math.max(nx0, d.x - d.w / 2), oy = Math.min(ny1, d.y) - Math.max(ny0, d.y - d.h);
      if (ox > 4 && oy > 4) this.patlat(d, 300);
    }
    return true;
  }

  kayaGuncelle(dt) {
    for (const k of this.kayalar) {
      if (k.gy > GY + 2) { if (k.spr) { k.spr.destroy(); k.spr = null; } continue; }
      // rüzgar: kayanın hava alan yüzeyindeki hücreye bakılır (kayanın kendisi ışını durdurur)
      const ym = k.gy + (k.h >> 1), xm = k.gx + (k.w >> 1);
      let yukari = false;
      if (this.ruzgarAt(k.gx - 1, ym) === 1) k.rx += RUZGAR_HIZ * 0.7 * dt;
      else if (this.ruzgarAt(k.gx + k.w, ym) === 2) k.rx -= RUZGAR_HIZ * 0.7 * dt;
      else k.rx = 0;
      if (this.ruzgarAt(xm, k.gy + k.h) === 3) { yukari = true; k.ry += 85 * dt; } else k.ry = 0;
      while (Math.abs(k.rx) >= C) { const s = Math.sign(k.rx); if (!this.kayaKay(k, s, 0, false)) { k.rx = 0; break; } k.rx -= s * C; }
      if (yukari) { k.vy = 0; k.dy = 0; while (k.ry >= C) { if (!this.kayaKay(k, 0, -1, false)) { k.ry = 0; break; } k.ry -= C; } }
      else {
        let bos = true;
        for (let x = k.gx; x < k.gx + k.w && bos; x++) if (this.hucre(x, k.gy + k.h) !== BOS) bos = false;
        if (bos) {
          k.vy = Math.min(k.vy + YERCEKIMI * dt, MAX_DUSME); k.dy += k.vy * dt;
          while (k.dy >= C) { if (!this.kayaKay(k, 0, 1, false)) { k.vy = 0; k.dy = 0; break; } k.dy -= C; }
        } else {
          if (k.vy > 300) { this.cameras.main.shake(90, 0.004); this.ses("ses_dustu", { volume: 0.8 }); }
          k.vy = 0; k.dy = 0;
          // Altında destek yarıdan azsa (4 tane ve altı) kaya kenardan kayıp devrilir
          let sol = 0, sag = 0;
          for (let x = 0; x < k.w; x++) if (this.hucre(k.gx + x, k.gy + k.h) !== BOS) { if (x < k.w / 2) sol++; else sag++; }
          if (sol + sag > 0 && sol + sag <= 4) {
            const yon = sol > sag ? 1 : -1;
            k.dev = (k.dev || 0) + 150 * dt;
            while (k.dev >= C) { k.dev -= C; if (!this.kayaKay(k, yon, 0, false)) { k.dev = 0; break; } }
          } else k.dev = 0;
        }
      }
      // görsel: kaya hücre ızgarasına oturur (yarım hücrede durursa kum ile arasında boşluk görünür)
      k.sx = k.gx * C; k.sy = OY + k.gy * C;
      k.spr.setPosition(k.sx, k.sy);
    }
  }

  // ---------- Dikenler, testereler, sallanan toplar ----------
  tehlikeKur() {
    this.dikenler.forEach((d) => {
      const yer = d.tip === "yer";
      d.spr = this.add.image(d.x, yer ? d.y1 : d.y0, yer ? "spike_up" : "spike_dn").setOrigin(0.5, yer ? 1 : 0).setDisplaySize(36, yer ? 48 : 38).setDepth(3);
    });
    this.testereler.forEach((t) => {
      t.spr = this.add.image(t.x, t.y, "saw").setDisplaySize(68, 68).setDepth(3.6);
      if (t.mod === "firlat") {
        t.spr.setInteractive(new Phaser.Geom.Circle(64, 64, 90), Phaser.Geom.Circle.Contains);
        t.spr.on("pointerdown", () => this.testereFirlat(t));
      }
    });
    this.toplar.forEach((b) => {
      b.spr = this.add.image(b.px, b.py + b.uz, "ball").setDisplaySize(64, 64).setDepth(4);
      if (b.mod === "dokun") {
        b.spr.setInteractive(new Phaser.Geom.Circle(64, 64, 95), Phaser.Geom.Circle.Contains);
        b.spr.on("pointerdown", () => this.topDokun(b));
      }
    });
    this.zincirG = this.add.graphics().setDepth(3.9);
  }

  testereFirlat(t) {
    if (this.durum !== "oyun" || t.durum !== "bekle") return;
    t.durum = "ucus";
    this.ses("ses_kapak", { volume: 0.5, detune: 600 });
  }

  topDokun(b) {
    if (this.durum !== "oyun") return;
    b.acik = !b.acik;
    if (b.acik) b.t = 0;
  }

  reisOldur() { if (!this.reis.olu && this.dokunulmaz <= 0) this.olum(); }

  // Daire (cx,cy,rad) ile kutu kesişiyor mu
  daireKutu(cx, cy, rad, x0, y0, x1, y1) {
    const nx = Math.max(x0, Math.min(cx, x1)), ny = Math.max(y0, Math.min(cy, y1));
    return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) < rad * rad;
  }

  // Bir tehlike (daire) Reis'e ve düşmanlara değiyor mu: değerse Reis ölür, düşman patlar
  daireVurus(cx, cy, rad, dusmanlari = true) {
    const r = this.reis;
    if (!r.olu && this.daireKutu(cx, cy, rad, r.x - r.w / 2 + 5, r.y - r.h + 6, r.x + r.w / 2 - 5, r.y - 2)) this.reisOldur();
    if (!dusmanlari) return;
    for (const d of this.dusmanlar) {
      if (d.olu) continue;
      if (this.daireKutu(cx, cy, rad, d.x - d.w / 2 + 6, d.y - d.h + 6, d.x + d.w / 2 - 6, d.y - 2)) this.patlat(d, 250);
    }
  }

  dikenDoluluk(d) {
    let n = 0;
    for (let y = d.gy; y < d.gy + HARITA_KARE; y++) for (let x = d.gx; x < d.gx + HARITA_KARE; x++) if (this.hucre(x, y) !== BOS) n++;
    return n / (HARITA_KARE * HARITA_KARE);
  }

  tehlikeGuncelle(dt, zaman) {
    const r = this.reis;
    // Dikenler: kum / kaya ile örtülürse etkisiz olur
    for (const d of this.dikenler) {
      if (this.kare % 4 === 0) { d.aktif = this.dikenDoluluk(d) < 0.5; d.spr.setVisible(d.aktif); }
      if (!d.aktif) continue;
      const x0 = d.x - 12, x1 = d.x + 12, y0 = d.tip === "yer" ? d.y1 - 44 : d.y0, y1 = d.tip === "yer" ? d.y1 : d.y0 + 34;
      if (!r.olu && r.x + r.w / 2 - 6 > x0 && r.x - r.w / 2 + 6 < x1 && Math.min(y1, r.y) - Math.max(y0, r.y - r.h) > 5) this.reisOldur();
    }
    // Testereler
    for (const t of this.testereler) {
      if (t.mod === "ray") {
        const nx = t.x + t.yon * RAY_HIZ * dt, cx = Math.floor((nx + t.yon * TESTERE_R) / C);
        let engel = cx < 0 || cx >= GX;
        for (const oy of [-18, 0, 18]) if (this.hucre(cx, Math.floor((t.y + oy - OY) / C)) !== BOS) engel = true;
        if (engel) t.yon *= -1; else t.x = nx;
      } else if (t.mod === "firlat" && t.durum === "ucus") {
        let kalan = FIRLAMA_HIZ * dt;
        while (kalan > 0) {
          const ad = Math.min(2, kalan), nx = t.x + t.yon * ad, cx = Math.floor((nx + t.yon * TESTERE_R) / C);
          let engel = cx < 0 || cx >= GX, kapaga = false;
          for (const oy of [-18, 0, 18]) { const hv = this.hucre(cx, Math.floor((t.y + oy - OY) / C)); if (hv !== BOS) engel = true; if (hv === KAPAK) kapaga = true; }
          if (engel && kapaga) { t.durum = "bekle"; t.x = t.x0; break; }
          if (engel) { t.durum = "bitti"; t.spr.setTint(0x777777); break; }
          t.x = nx; kalan -= ad;
          this.daireVurus(t.x, t.y, TESTERE_R);
        }
      }
      t.aci += dt * (t.durum === "bekle" ? 1.4 : t.durum === "bitti" ? 0 : 9) * (t.mod === "firlat" ? t.yon : 1);
      t.spr.setPosition(t.x, t.y).setRotation(t.aci);
      if (t.durum !== "bekle" && t.durum !== "bitti") this.daireVurus(t.x, t.y, TESTERE_R, t.mod === "firlat");
    }
    // Sallanan toplar
    const g = this.zincirG;
    g.clear();
    for (const b of this.toplar) {
      b.t += dt;
      const hedef = b.acik ? SALINIM_ACI : 0;
      b.amp += Math.max(-0.7 * dt, Math.min(0.7 * dt, hedef - b.amp));
      const aci = b.amp * Math.sin(b.t * 2 * Math.PI / SALINIM_SURE);
      b.x = b.px + b.uz * Math.sin(aci); b.y = b.py + b.uz * Math.cos(aci);
      b.spr.setPosition(b.x, b.y).setRotation(aci * 0.4);
      if (b.amp > 0.15) this.daireVurus(b.x, b.y, TOP_R);
      this.zincirCiz(g, b);
    }
  }

  // Metal zincir: halkalar dönüşümlü yüzü/yan duran elipsler (sprite yerine çizim: zincir boyu bölüme göre değişiyor)
  zincirCiz(g, b) {
    const dx = b.x - b.px, dy = b.y - b.py, uz = Math.hypot(dx, dy), n = Math.max(2, Math.floor(uz / 13));
    const aa = Math.atan2(dy, dx), ca = Math.cos(aa), sa = Math.sin(aa);
    const elips = (cx, cy, a, bb, pts = 16) => { const o = []; for (let k = 0; k <= pts; k++) { const th = (k / pts) * Math.PI * 2, ex = Math.cos(th) * a, ey = Math.sin(th) * bb; o.push({ x: cx + ex * ca - ey * sa, y: cy + ex * sa + ey * ca }); } return o; };
    // birbirine geçmiş halkalar: dönüşümlü geniş (yüzü dönük) ve dar (yandan görünen) halka, sadece çerçeve
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n, cx = b.px + dx * f * 0.96, cy = b.py + dy * f * 0.96;
      const yuz = i % 2 === 0, bb = yuz ? 5.2 : 2.2, a = 9;
      const p = elips(cx, cy, a, bb);
      g.lineStyle(yuz ? 4.2 : 3.6, 0x1d2025, 1).strokePoints(p, true, true);
      g.lineStyle(yuz ? 2.2 : 1.8, yuz ? 0xaab2ba : 0x7d858d, 1).strokePoints(p, true, true);
    }
    // tavan bağlantısı
    g.fillStyle(0x3a3e44, 1).fillCircle(b.px, b.py, 8);
    g.fillStyle(0xaab2ba, 1).fillCircle(b.px - 1.5, b.py - 1.5, 4.5);
  }

  kalkabilir(r) {
    const b = this.govde({ x: r.x, y: r.y, w: r.w, h: REIS_BOY });
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) if (this.katiMi(x, y)) return false;
    return true;
  }

  // ---------- Rüzgar / taş heykel ----------
  // Heykel sabit durduğu için yönü ve ağız noktası burada bir kez hesaplanır. Eskiden bunlar
  // ve heykelin dokusu her karede yeniden ayarlanıyordu; artık doku sadece açılıp kapanınca değişir.
  pervaneKur() {
    const fw = HEYKEL_EN, fh = HEYKEL_BOY;
    const ax = fw * HEYKEL_AGIZ_X - 2, ay = fh * HEYKEL_AGIZ_Y - 6; // ağız deliğine ince ayar: 2 px geri, 6 px yukarı
    this.pervaneler.forEach((p) => {
      p.dx = p.yon === "r" ? 1 : p.yon === "l" ? -1 : 0;
      p.dy = p.yon === "d" ? 1 : p.yon === "u" ? -1 : 0;
      p.cx = p.px;
      if (p.dx) p.cy = p.py - fh / 2;                     // zemine oturur
      else if (p.yon === "u") p.cy = p.py - fw / 2;       // zeminden yukarı üfler
      else p.cy = p.py - KARE_PX + fw / 2;                // tavana asılı, aşağı üfler
      p.yari = fh * 0.38;                                 // rüzgar bandının yarı genişliği (px)
      p.on = fw / 2;                                      // ön kenara uzaklık (px)
      // Ağız noktası: sağa bakan heykelde (ax, ay); diğer yönlerde aynı nokta döndürülür
      if (p.yon === "r") { p.mx = p.cx + ax; p.my = p.cy + ay; }
      else if (p.yon === "l") { p.mx = p.cx - ax; p.my = p.cy + ay; }
      else if (p.yon === "u") { p.mx = p.cx + ay; p.my = p.cy - ax; }
      else { p.mx = p.cx - ay; p.my = p.cy + ax; }

      const spr = this.add.image(p.cx, p.cy, "pervane_kapali").setDisplaySize(fw, fh).setDepth(3);
      if (p.yon === "l") spr.setFlipX(true);
      if (p.yon === "u") spr.setAngle(-90);
      if (p.yon === "d") spr.setAngle(90);
      spr.setInteractive({ useHandCursor: true });
      spr.on("pointerdown", () => this.pervaneTikla(p));
      p.spr = spr;
      p.hucre = new Int32Array(0); p.menzil = [];
      p.isin = [];
      for (let n = 0; n < 32; n++) p.isin.push({ a: Math.random() * 2 - 1, t: Math.random(), v: 0.6 + Math.random() * 0.8 });
    });
  }

  pervaneTikla(p) {
    if (this.durum !== "oyun") return;
    p.acik = !p.acik;
    p.spr.setTexture(p.acik ? "pervane_acik" : "pervane_kapali").setDisplaySize(HEYKEL_EN, HEYKEL_BOY);
    this.ruzgarKur();
  }

  // Açık pervanelerin rüzgar bölgesini çıkarır (kayaya/toprağa/kapağa çarpan ışın durur; kum rüzgarı durdurmaz)
  ruzgarKur() {
    this.ruzgarYon.fill(0);
    const kod = { r: 1, l: 2, u: 3, d: 4 };
    for (const p of this.pervaneler) {
      p.hucre = new Int32Array(0); p.menzil = [];
      if (!p.acik) continue;
      const gx0 = Math.floor(p.cx / C), gy0 = Math.floor((p.cy - OY) / C), bh = Math.floor(p.yari / C);
      const dx = p.dx, dy = p.dy;
      p.adim = dx + dy * GX;
      const liste = [];
      for (let o = -bh; o <= bh; o++) {
        let x = gx0 + (dx ? 0 : o), y = gy0 + (dy ? 0 : o), n = 0;
        for (let k = 0; k < RUZGAR_MENZIL; k++, x += dx, y += dy) {
          if (x < 0 || x >= GX || y < 0 || y >= GY) break;
          const i = y * GX + x, h = this.g[i];
          if (h !== BOS && h !== KUM) break;
          liste.push(i); this.ruzgarYon[i] = kod[p.yon]; n++;
        }
        p.menzil.push(n * C);
      }
      p.hucre = Int32Array.from(liste);
    }
  }

  // Taş heykel üfleme sesi: en az bir heykel açıkken döngüde çalar, hepsi kapanınca (ya da oyun
  // bitince) yumuşakça kısılıp durur. Birden çok heykel açık olsa da tek ses çalar; üst üste
  // binen aynı ses hem gürültü yapar hem boşuna işlemci harcar.
  ruzgarSesiAyarla(acik) {
    if (acik) {
      if (this.ruzgarSes || !this.cache.audio.exists("ses_ruzgar")) return;
      try {
        const s = this.sound.add("ses_ruzgar", { loop: true, volume: 0 });
        s.play();
        this.tweens.add({ targets: s, volume: 0.45, duration: 300 }); // ani başlamasın, hafifçe açılsın
        this.ruzgarSes = s;
      } catch (e) { this.ruzgarSes = null; }
    } else if (this.ruzgarSes) {
      const s = this.ruzgarSes;
      this.ruzgarSes = null;
      try { this.tweens.add({ targets: s, volume: 0, duration: 250, onComplete: () => { try { s.stop(); s.destroy(); } catch (e) {} } }); } catch (e) {}
    }
  }

  ruzgarGuncelle(dt, zaman) {
    if (!this.pervaneler.length) return;
    this.ruzgarSay++;
    const aktif = this.pervaneler.some((p) => p.acik);
    this.ruzgarSesiAyarla(aktif && this.durum === "oyun");
    // Rüzgar bölgesi (önündeki engellere göre kısalan ışınlar) her 8 karede bir yeniden hesaplanır;
    // kum yavaş değiştiği için bu yeterli. Bölümde hareketli kaya varsa her karede: kaya hızlı
    // kayıp rüzgarı kesebiliyor.
    if (aktif && this.ruzgarSay % (this.kayalar.length ? 1 : 8) === 0) this.ruzgarKur();
    const g = this.ruzgarCizim;
    g.clear();
    if (!aktif) return;

    for (const p of this.pervaneler) {
      if (!p.acik) continue;
      const dx = p.dx, dy = p.dy, mx = p.mx, my = p.my; // rüzgar heykelin ağız deliğinden çıkar
      const nx = dy ? 1 : 0, ny = dx ? 1 : 0; // yana doğru birim vektör

      const maxUz = Math.max(...p.menzil, 0);
      if (maxUz > p.on + 20) {
        // 1. Dolgun, yumuşak, yarı saydam rüzgar hüzmesi (volumetric wind beam)
        const uLen = maxUz - p.on;
        const w0 = 10, w1 = p.yari * 0.85;
        const cone = [
          { x: mx - nx * w0, y: my - ny * w0 },
          { x: mx + dx * uLen - nx * w1, y: my + dy * uLen - ny * w1 },
          { x: mx + dx * uLen + nx * w1, y: my + dy * uLen + ny * w1 },
          { x: mx + nx * w0, y: my + ny * w0 }
        ];
        g.fillStyle(0xdff4ff, 0.08).fillPoints(cone);

        // İç parlak çekirdek hüzmesi
        const inner = [
          { x: mx - nx * (w0 * 0.5), y: my - ny * (w0 * 0.5) },
          { x: mx + dx * uLen - nx * (w1 * 0.45), y: my + dy * uLen - ny * (w1 * 0.45) },
          { x: mx + dx * uLen + nx * (w1 * 0.45), y: my + dy * uLen + ny * (w1 * 0.45) },
          { x: mx + nx * (w0 * 0.5), y: my + ny * (w0 * 0.5) }
        ];
        g.fillStyle(0xffffff, 0.06).fillPoints(inner);

        // 2. Ağız çıkışındaki basınç halkaları (pulsing shockwaves)
        for (let h = 0; h < 2; h++) {
          const ph = ((zaman / 360 + h * 0.5) % 1);
          const rRad = 4 + ph * 12;
          const rAlfa = (1 - ph) * 0.45;
          g.lineStyle(2.0, 0xffffff, rAlfa);
          g.strokeCircle(mx + dx * ph * 16, my + dy * ph * 16, rRad);
        }
      }

      // 3. Çok katmanlı blurlu hareket iplikleri (motion blur streaks)
      for (const s of p.isin) {
        s.t += dt * s.v;
        if (s.t > 1) { s.t = 0; s.a = Math.random() * 2 - 1; s.v = 0.6 + Math.random() * 0.8; }
        const bi = Math.round((s.a + 1) / 2 * (p.menzil.length - 1));
        const uz = p.menzil[bi] || 0;
        if (uz < p.on + 20) continue;
        const bas = s.t * (uz - p.on), alfa = Math.sin(Math.PI * s.t) * 0.42;
        const pts = [];
        for (let j = 0; j <= 7; j++) {
          const d = bas - 68 * j / 7;
          if (d < 0) continue;
          // Hafif dalgalı ve girdaplı akış
          const yan = s.a * (p.yari * (0.35 + 0.65 * (d / Math.max(1, uz - p.on)))) + Math.sin(d * 0.06 + s.t * 12) * 4.2;
          pts.push({ x: mx + dx * d + nx * yan, y: my + dy * d + ny * yan });
        }
        if (pts.length < 2) continue;

        // Dış yumuşak motion blur sisi
        g.lineStyle(6.5, 0xc5edff, alfa * 0.28).strokePoints(pts);
        // Orta dolgun rüzgar çizgisi
        g.lineStyle(3.0, 0xe0f5ff, alfa * 0.65).strokePoints(pts);
        // İç parlak çekirdek
        g.lineStyle(1.4, 0xffffff, Math.min(1, alfa * 1.35)).strokePoints(pts);
      }
    }
  }

  // Hücredeki rüzgar yönü (ızgara dışı = rüzgar yok)
  ruzgarAt(x, y) { return x < 0 || x >= GX || y < 0 || y >= GY ? 0 : this.ruzgarYon[y * GX + x]; }

  // Varlığın merkezindeki rüzgar: 0 yok, 1 sağ, 2 sol, 3 yukarı, 4 aşağı
  ruzgarKuvvet(e) {
    const cx = Math.floor(e.x / C), cy = Math.floor((e.y - e.h / 2 - OY) / C);
    if (cx < 0 || cx >= GX || cy < 0 || cy >= GY) return 0;
    return this.ruzgarYon[cy * GX + cx];
  }

  yukari(e, dy) {
    let n = dy;
    while (n > 0) {
      const adim = Math.min(1, n);
      const b = this.govde(e, 0, -adim);
      for (let x = b.x0; x <= b.x1; x++) if (this.katiMi(x, b.y0)) { e.vy = 0; return; }
      e.y -= adim; n -= adim;
    }
  }

  // Yürüyen / düşen varlıklar (Reis, yengeç, ahtapot) için rüzgar etkisi
  ruzgarUygula(e, dt) {
    const k = this.ruzgarKuvvet(e);
    if (!k) return 0;
    if (k === 1 || k === 2) this.yatay(e, (k === 1 ? 1 : -1) * RUZGAR_HIZ * dt, false);
    else if (k === 3) { this.yukari(e, 200 * dt); e.vy = 0; e.yerde = false; }
    else if (k === 4 && !e.yerde) e.vy = Math.min(e.vy + 2200 * dt, 900);
    return k;
  }

  // Her kapak kümesine tahta görseli (9 parça: çerçeve korunur, orta uzar)
  kapakKur() {
    this.kapaklar = [];
    const gor = new Uint8Array(GX * GY), src = this.textures.get("kapak_tahta").getSourceImage();
    const SW = src.width, SH = src.height, SB = 19; // kaynak çerçeve kalınlığı
    for (let i = 0; i < GX * GY; i++) {
      if (this.g[i] !== KAPAK || gor[i]) continue;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const yig = [i]; gor[i] = 1;
      while (yig.length) {
        const j = yig.pop(), x = j % GX, y = (j / GX) | 0;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        for (const n of [x > 0 ? j - 1 : -1, x < GX - 1 ? j + 1 : -1, j - GX, j + GX]) if (n >= 0 && n < GX * GY && !gor[n] && this.g[n] === KAPAK) { gor[n] = 1; yig.push(n); }
      }
      const w = (x1 - x0 + 1) * C, h = (y1 - y0 + 1) * C, b = Math.max(3, Math.round(SB * h / SH));
      const key = this.geciciDoku("kapak" + Date.now() + "_" + i), cv = this.textures.createCanvas(key, w, h), cx = cv.context;
      const p = (sx, sy, sw, sh, dx, dy, dw, dh) => cx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
      p(0, 0, SB, SB, 0, 0, b, b); p(SW - SB, 0, SB, SB, w - b, 0, b, b);
      p(0, SH - SB, SB, SB, 0, h - b, b, b); p(SW - SB, SH - SB, SB, SB, w - b, h - b, b, b);
      p(SB, 0, SW - 2 * SB, SB, b, 0, w - 2 * b, b); p(SB, SH - SB, SW - 2 * SB, SB, b, h - b, w - 2 * b, b);
      p(0, SB, SB, SH - 2 * SB, 0, b, b, h - 2 * b); p(SW - SB, SB, SB, SH - 2 * SB, w - b, b, b, h - 2 * b);
      p(SB, SB, SW - 2 * SB, SH - 2 * SB, b, b, w - 2 * b, h - 2 * b);
      cv.refresh();
      this.kapaklar.push({ i, spr: this.add.image(x0 * C, OY + y0 * C, key).setOrigin(0).setDepth(1.5) });
    }
  }

  kapakAc(sx, sy) {
    const yigin = [[sx, sy]];
    let n = 0;
    while (yigin.length) {
      const [x, y] = yigin.pop();
      if (x < 0 || x >= GX || y < 0 || y >= GY) continue;
      const i = y * GX + x;
      if (this.g[i] !== KAPAK) continue;
      this.g[i] = BOS; this.kirlet(i); n++;
      yigin.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    if (n) {
      // açılan kapağın sprite'ı ve dokusu hemen silinir (bellekte boşuna durmasın)
      this.kapaklar = this.kapaklar.filter((k) => {
        if (this.g[k.i] === KAPAK) return true;
        const key = k.spr.texture.key;
        k.spr.destroy();
        if (this.textures.exists(key)) this.textures.remove(key);
        return false;
      });
      this.kapakDegisti = true; this.cameras.main.shake(120, 0.004); this.ses("ses_kapak", { volume: 0.8 }); }
  }

  // ---------- Izgara yardımcıları ----------
  hucre(x, y) {
    if (x < 0 || x >= GX) return KAYA;
    if (y < 0) return BOS;
    if (y >= GY) return BOS; // haritanın altı açık: oradan düşen ölür (çukur bölümleri)
    return this.g[y * GX + x];
  }
  katiMi(x, y) { return this.hucre(x, y) !== BOS; }

  // İki varlık (düşman ve Reis) arasında, düşmanın gövde yüksekliği boyunca katı bir hücre var mı?
  aradaDuvarVarMi(d, r) {
    const y0 = Math.floor((d.y - d.h - OY) / C);
    const y1 = Math.floor((d.y - 1 - OY) / C);
    const x0 = Math.floor(Math.min(d.x, r.x) / C);
    const x1 = Math.floor(Math.max(d.x, r.x) / C);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (this.katiMi(x, y)) return true;
    return false;
  }

  // Değişen hücreyi ve komşularını yeniden çizilecek olarak işaretle.
  // Komşular da işaretlenir; çünkü bir hücrenin parlak üst kenarı / gölgeli alt kenarı komşusunun
  // dolu ya da boş olmasına bağlı. Sadece hücrenin kendisini çizseydik eski gölgeler ekranda kalırdı.
  kirlet(i) {
    const k = this.kirli;
    k[i] = 1;
    if (i >= GX) k[i - GX] = 1;
    if (i < GX * (GY - 1)) k[i + GX] = 1;
    const x = i % GX;
    if (x > 0) { k[i - 1] = 1; if (i >= GX) k[i - GX - 1] = 1; if (i < GX * (GY - 1)) k[i + GX - 1] = 1; }
    if (x < GX - 1) { k[i + 1] = 1; if (i >= GX) k[i - GX + 1] = 1; if (i < GX * (GY - 1)) k[i + GX + 1] = 1; }
    this.cizimGerek = true;
  }
  tumunuKirlet() { this.kirli.fill(1); this.cizimGerek = true; }

  govde(e, ox = 0, oy = 0) {
    return {
      x0: Math.floor((e.x + ox - e.w / 2) / C),
      x1: Math.floor((e.x + ox + e.w / 2 - 1) / C),
      y0: Math.floor((e.y + oy - e.h - OY) / C),
      y1: Math.floor((e.y + oy - 1 - OY) / C)
    };
  }

  zeminVar(e) {
    const b = this.govde(e);
    const y = Math.floor((e.y - OY) / C);
    for (let x = b.x0; x <= b.x1; x++) if (this.katiMi(x, y)) return true;
    return false;
  }

  // Küçük inişlerde (yamaç basamakları) düşmeye geçmeden yere yapışır. Yoksa yamaçtan inerken
  // her 6 px'lik basamakta bir kare "havada" sayılıp düşme pozu ve sesi tetikleniyordu.
  zemineYapis(e, maxPx) {
    if (this.zeminVar(e)) return true;
    const y0 = e.y;
    for (let d = 1; d <= maxPx; d++) {
      e.y = y0 + d;
      if (this.zeminVar(e)) return true;
    }
    e.y = y0;
    return false;
  }

  yercekimi(e, dt) {
    if (this.zeminVar(e)) { e.vy = 0; e.yerde = true; return; }
    e.yerde = false;
    e.vy = Math.min(e.vy + YERCEKIMI * dt, MAX_DUSME);
    let adim = e.vy * dt;
    while (adim > 0) {
      const d = Math.min(1, adim);
      e.y += d; adim -= d;
      if (this.zeminVar(e)) { e.y = Math.floor(e.y - OY) + OY; e.vy = 0; e.yerde = true; break; }
    }
    if (e.y > ALT + 200) e.y = ALT + 200;
  }

  // Yatay hareket. kazar=true ise kum ve toprağı kazar.
  yatay(e, dx, kazar) {
    const yon = Math.sign(dx);
    let kalan = Math.abs(dx);
    let kazdi = false, tur = null;
    while (kalan > 0) {
      const d = Math.min(1, kalan) * yon;
      const b = this.govde(e, d);
      const sx = yon > 0 ? b.x1 : b.x0;
      let engelSatir = -1, engelUst = 1e9, kazilacak = [];
      for (let y = b.y0; y <= b.y1; y++) {
        const h = this.hucre(sx, y);
        if (h === BOS) continue;
        if (kazar && (h === KUM || h === TOPRAK)) kazilacak.push(y);
        else { engelSatir = Math.max(engelSatir, y); engelUst = Math.min(engelUst, y); }
      }
      if (engelSatir >= 0) {
        // Basamak: sadece ayak hizasındaki en alt 2 hücre engelse karakter üstüne çıkar.
        // Böylece kum yamacına takılmadan tırmanır ama gerçek duvar (daha yüksek engel) onu durdurur.
        if (!(e.tip && e.tip.ucar) && engelSatir >= b.y1 - 1 && engelSatir <= b.y1 && engelUst >= b.y1 - 1) {
          const tir = b.y1 - engelSatir + 1;
          let bos = true;
          for (let y = b.y0 - tir; y < b.y0; y++) for (let x = b.x0; x <= b.x1; x++) if (this.katiMi(x, y)) bos = false;
          if (bos) { e.y -= tir * C; continue; }
        }
        return { durdu: true, kazdi, tur };
      }
      for (const y of kazilacak) {
        const i = y * GX + sx;
        if (this.g[i] === TOPRAK) tur = "toprak"; else if (!tur) tur = "kum";
        this.g[i] = BOS; this.kirlet(i); kazdi = true;
      }
      e.x += d; kalan -= 1;
    }
    return { durdu: false, kazdi, tur };
  }

  // ---------- Kum fiziği ----------
  // Klasik "düşen kum" hücre otomatı: alttan yukarı taranır ki bir tane aynı karede iki kez düşmesin.
  // Tarama yönü her karede sağ/sol değişir; tek yönde tarasaydık kum hep bir tarafa yığılırdı.
  // Reis'in gövdesi "engel" sayılır: kum karakterin içine akmaz, üstüne birikir.
  kumAdim() {
    const g = this.g, si = this.srcI, eng = this.engel;
    eng.fill(0);
    if (!this.reis.olu) {
      const b = this.govde(this.reis);
      for (let y = Math.max(0, b.y0); y <= Math.min(GY - 1, b.y1); y++)
        for (let x = Math.max(0, b.x0); x <= Math.min(GX - 1, b.x1); x++) eng[y * GX + x] = 1;
    }
    const sagdan = (this.kare & 1) === 1;
    let hareket = 0;
    for (let y = GY - 2; y >= 0; y--) {
      for (let k = 0; k < GX; k++) {
        const x = sagdan ? GX - 1 - k : k;
        const i = y * GX + x;
        if (g[i] !== KUM) continue;
        if (this.ruzgarYon[i] === 3) continue; // yukarı üfleyen rüzgarda kum havada asılı kalır
        const a = i + GX;
        let hedef = -1;
        // Kum doğrudan düşer ve tepe oluşturacak şekilde yana kayar
        if (g[a] === BOS && !eng[a]) {
          hedef = a;
        } else {
          // Önce rastgele bir yana, olmazsa öbür yana kayar. Yön rastgele; hep aynı yöne kaysa tepeler
          // yamuk birikir. (Eskiden burada her tane için [ilk, -ilk] dizisi üretiliyordu; bu döngü her
          // karede binlerce kez döndüğü için çöp toplayıcıyı yoruyordu, iki adımlı döngüye çevrildi.)
          let s = Math.random() < 0.5 ? -1 : 1;
          for (let deneme = 0; deneme < 2; deneme++, s = -s) {
            const nx = x + s;
            if (nx < 0 || nx >= GX) continue;
            const alt = a + s;
            if (g[alt] === BOS && !eng[alt] && g[i + s] === BOS) { hedef = alt; break; }
          }
        }
        if (hedef >= 0) {
          g[hedef] = KUM; si[hedef] = si[i];
          g[i] = BOS;
          this.durgun[hedef] = 0;
          this.kirlet(i); this.kirlet(hedef);
          hareket++;
        } else if (si[i] !== i && ++this.durgun[i] > 10) {
          // Düşen tane dokusunu yanında taşır (si), yoksa akarken kum deseni kayıp titrerdi.
          // Durulunca dokuyu kendi yerinden alır: yan yana taneler arasında dikiş/kare izi kalmaz.
          si[i] = i; this.kirlet(i);
        }
      }
    }
    // Rüzgar kum tanelerini savurur
    for (const p of this.pervaneler) {
      if (!p.acik) continue;
      const lst = p.hucre, st = p.adim;
      for (let n = lst.length - 1; n >= 0; n--) {
        const i = lst[n];
        if (g[i] !== KUM || Math.random() > 0.7) continue;
        const x = i % GX;
        if ((st === 1 && x === GX - 1) || (st === -1 && x === 0)) continue;
        const t = i + st;
        if (t < 0 || t >= GX * GY) continue;
        if (g[t] === BOS && !eng[t]) {
          g[t] = KUM; si[t] = si[i]; g[i] = BOS;
          this.durgun[t] = 0;
          this.kirlet(i); this.kirlet(t);
        }
      }
    }
    // Kum akış sesi: yeterince kum aktığında (kapak açılınca, göçünce) çalar
    this.kumSayac = (this.kumSayac || 0) * 0.93 + hareket;
    const simdi = this.time.now;
    if (this.durum === "oyun" && this.kare > 60 && this.kumSayac > 40 && simdi - (this.sonKumSes || 0) > 1300) {
      this.sonKumSes = simdi; this.kumSayac = 0;
      this.ses(Math.random() < 0.5 ? "ses_kum_dokul" : "ses_kum_dok", { volume: 0.6 });
    }
  }

  // Sadece değişen hücreleri yeniden çizer.
  // 3D görünüm: ışık üstten gelir. Havaya bakan üst kenar parlar, alt kenar gölgelenir,
  // her kum tanesinin kendi tonu var, mağara köşeleri karanlık (ortam gölgesi).
  kumCiz() {
    if (!this.cizimGerek) return;
    this.cizimGerek = false;
    const g = this.g, si = this.srcI, mg = this.magara, kir = this.kirli, px = this.piksel, src = this.src;
    const magaraSrc = src.magara;
    const UST = [1.32, 1.2, 1.08], ALTG = [0.88, 0.72, 0.55];
    const bosMu = (x, y) => x >= 0 && x < GX && y >= 0 && y < GY && g[y * GX + x] === BOS;
    const doluMu = (x, y) => x < 0 || x >= GX || y >= GY || (y >= 0 && g[y * GX + x] !== BOS);
    for (let i = 0; i < GX * GY; i++) {
      if (!kir[i]) continue;
      kir[i] = 0;
      const cx = i % GX, cy = (i / GX) | 0;
      const hedef0 = cy * C * W + cx * C;
      const tip = g[i];
      if (tip === BOS) {
        if (mg[i]) {
          // çevredeki dolu hücre sayısı kadar karart
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && doluMu(cx + dx, cy + dy)) n++;
          const f = 1 - n * 0.075;
          for (let yy = 0; yy < C; yy++) { const o = hedef0 + yy * W; for (let xx = 0; xx < C; xx++) px[o + xx] = carp(magaraSrc[o + xx], f); }
        } else {
          for (let yy = 0; yy < C; yy++) { const o = hedef0 + yy * W; for (let xx = 0; xx < C; xx++) px[o + xx] = 0; }
        }
        continue;
      }
      // Kaya bloğu ve kapak kendi sprite'larıyla çizilir; zemine onların ARKASINDA ne varsa o çizilir.
      // Mağaradaysa mağara dokusu, açıktaysa saydam (gökyüzü görünür). Eskiden hep saydam bırakılıyordu;
      // mağaradaki kayanın yuvarlak köşelerinden gökyüzü sızıyordu. Kaya kalkınca da aynı arka plan kalır.
      if (tip === TAS || tip === KAPAK) {
        for (let yy = 0; yy < C; yy++) { const o = hedef0 + yy * W; for (let xx = 0; xx < C; xx++) px[o + xx] = mg[i] ? magaraSrc[o + xx] : 0; }
        continue;
      }
      const s = tip === KUM ? si[i] : i;
      const kaynak0 = ((s / GX) | 0) * C * W + (s % GX) * C;
      const dz = src[tip];
      const ust = bosMu(cx, cy - 1) || cy === 0, alt = bosMu(cx, cy + 1);
      const sol = bosMu(cx - 1, cy), sag = bosMu(cx + 1, cy);

      // Tepe / yamaç rampa tespiti (basamak piksellerini görseldeki gibi pürüzsüz düz rampa çizgisine çevirir)
      let rampaTipi = 0; // 0: normal, 1: sola inen yamaç, 2: sağa inen yamaç, 3: tepe zirvesi
      if (tip === KUM && ust) {
        if (sol && sag) rampaTipi = 3;
        else if (sol && !sag) rampaTipi = 1;
        else if (sag && !sol) rampaTipi = 2;
      }

      for (let yy = 0; yy < C; yy++) {
        const o = hedef0 + yy * W, ko = kaynak0 + yy * W;
        let fy = 1;
        if (ust && yy < 3) fy *= UST[yy];
        if (alt && yy >= C - 3) fy *= ALTG[yy - (C - 3)];
        for (let xx = 0; xx < C; xx++) {
          if (rampaTipi > 0) {
            let cutoff = 0;
            if (rampaTipi === 1) cutoff = C - 1 - xx;
            else if (rampaTipi === 2) cutoff = xx;
            else if (rampaTipi === 3) cutoff = xx < 3 ? 2 - xx : xx - 3;

            if (yy < cutoff) {
              px[o + xx] = mg[i] ? magaraSrc[o + xx] : 0;
              continue;
            } else if (yy === cutoff) {
              px[o + xx] = carp(dz[ko + xx], 1.45);
              continue;
            }
          }

          let f = fy;
          if (sol && xx < 2) f *= xx === 0 ? 1.14 : 1.06;
          if (sag && xx >= C - 2) f *= xx === C - 1 ? 0.7 : 0.84;
          px[o + xx] = f === 1 ? dz[ko + xx] : carp(dz[ko + xx], f);
        }
      }
    }
    this.kumTex.context.putImageData(this.imgData, 0, 0);
    this.kumTex.refresh();
  }

  // ---------- Pompa ----------
  pompala() {
    if (this.durum !== "oyun" || this.reis.olu) return;
    const r = this.reis;
    if (r.egik && this.kalkabilir(r)) r.egik = false; // pompalamak için ayağa kalkar
    r.pompa = 0.35;
    this.ses("ses_pompa", { volume: 0.7 });
    let hedef = null, en = 1e9;
    for (const d of this.dusmanlar) {
      if (d.olu) continue;
      const dx = (d.x - r.x) * r.yon;
      const mesafe = dx - d.w / 2 - r.w / 2;
      const dikey = d.tip.ucar ? Math.abs((d.y - d.h / 2) - (r.y - 60)) < 95 : Math.abs(d.y - r.y) < 70;
      if (dx > 0 && mesafe < 190 && dikey && mesafe < en && this.gorusVar(r, d)) { en = mesafe; hedef = d; }
    }
    this.pompaHedef = hedef;
    if (!hedef) return;
    hedef.sisme++;
    hedef.sonPompa = this.time.now;
    if (hedef.sisme < 4) this.ses("ses_sisme", { volume: 0.8, detune: (hedef.sisme - 1) * 250 });
    if (hedef.sisme >= 4) this.patlat(hedef, 200);
  }

  gorusVar(r, d) {
    const y = Math.floor((Math.min(r.y, d.y) - 25 - OY) / C);
    const x0 = Math.floor(Math.min(r.x, d.x) / C), x1 = Math.floor(Math.max(r.x, d.x) / C);
    for (let x = x0; x <= x1; x++) if (this.katiMi(x, y)) return false;
    return true;
  }

  patlat(d, puan) {
    d.olu = true;
    this.ses(d.tip.ad === "octo" ? "ses_ahtapot_pop" : "ses_yengec_pop", { volume: 0.9 });
    // patlama, şişmiş gövdenin ortasında olsun (yarım karakter boyu yukarıda)
    d.spr.setTexture(d.tip.ad + "_pop0").setOrigin(0.5, 0.5).setY(d.tip.ucar ? d.y - d.h / 2 : d.y - (d.tip.ad === "octo" ? 58 : 70));
    this.tweens.add({ targets: d.spr, alpha: 0, scale: DUSMAN_OLCEK * 1.3, duration: 600, delay: 150, onComplete: () => d.spr.destroy() });
    if (this.popParcacik) {
      const renk = d.tip.ad === "crab" ? 0xee5253 : d.tip.ad === "octo" ? 0x9b59b6 : 0x0abde3;
      this.popParcacik.setParticleTint(renk);
      this.popParcacik.emitParticleAt(d.x, d.tip.ucar ? d.y - d.h / 2 : d.y - 35, 20);
    }
    this.puanEkle(puan, d.x, d.y - d.h);
    this.cameras.main.shake(100, 0.005);
  }

  puanEkle(p, x, y) {
    this.skor += p;
    this.skorYazi.setText("Skor: " + this.skor);
    const t = this.add.text(x, y, "+" + p, { ...YAZI, fontSize: "38px", color: "#ffe066", strokeThickness: 7 }).setOrigin(0.5).setDepth(15);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  // ---------- Döngü ----------
  update(zaman) {
    // dt en fazla 0,05 sn: telefon bir an takılırsa (bildirim, arka plan) karakterler duvarın
    // içinden geçecek kadar büyük bir adım atmasın.
    const simdi = performance.now();
    const dt = Math.min(this.sonZaman ? (simdi - this.sonZaman) / 1000 : 0.016, 0.05);
    this.sonZaman = simdi;
    this.kare++;
    this.kumAdim();
    this.ruzgarGuncelle(dt, zaman);
    if (this.durum === "oyun") {
      this.kayaGuncelle(dt);
      this.reisGuncelle(dt, zaman);
      this.dusmanGuncelle(dt, zaman);
      this.tehlikeGuncelle(dt, zaman);
      this.kontrolEt();
    } else if (this.durum === "olum") {
      this.reisGuncelle(dt, zaman);
    }
    this.kumCiz();
    this.kapakVurgu(zaman);
  }

  // Kapak kenarları: çizgiler sadece kapak değişince yeniden çizilir; yanıp sönme sadece alpha ile
  // yapılır. Her karede yeniden çizmek yerine bu yol çok daha ucuz.
  kapakVurgu(zaman) {
    const g = this.kapakCizim;
    g.setAlpha(0.5 + 0.4 * Math.sin(zaman / 250));
    if (!this.kapakDegisti) return;
    this.kapakDegisti = false;
    g.clear();
    g.lineStyle(4, 0xffe066, 1);
    for (let y = 0; y < GY; y++) for (let x = 0; x < GX; x++) {
      if (this.g[y * GX + x] !== KAPAK) continue;
      const px = x * C, py = OY + y * C;
      if (this.hucre(x, y - 1) !== KAPAK) g.lineBetween(px, py, px + C, py);
      if (this.hucre(x, y + 1) !== KAPAK) g.lineBetween(px, py + C, px + C, py + C);
      if (this.hucre(x - 1, y) !== KAPAK) g.lineBetween(px, py, px, py + C);
      if (this.hucre(x + 1, y) !== KAPAK) g.lineBetween(px + C, py, px + C, py + C);
    }
  }

  reisGuncelle(dt, zaman) {
    const r = this.reis;
    this.hortum.clear();
    if (r.olu) {
      r.kare += dt * 10;
      r.y += r.vy * dt; r.vy += YERCEKIMI * 0.5 * dt;
      r.spr.setTexture(this.kareler.reis_fall[Math.floor(r.kare) % 4]).setScale(REIS_OLCEK * 1.1).setPosition(r.x, r.y);
      return;
    }
    r.h = r.egik ? REIS_EGIK_BOY : REIS_BOY;
    if (this.egilBtn) { const k = r.egik ? "btn_kalk" : "btn_egil"; if (this.egilBtn.texture.key !== k) this.egilBtn.setTexture(k); }
    if (r.vy < 0) {
      // zıplama: yukarı çıkış (tavana çarparsa yukari() hızı sıfırlar)
      r.yerde = false; r.ziplaGecen = (r.ziplaGecen || 0) + dt;
      this.yukari(r, -r.vy * dt);
      if (r.vy < 0) r.vy = Math.min(0, r.vy + YERCEKIMI * dt);
    } else {
      // yerde yürürken 2 kum tanesine kadar inişlerde düşme yok, yamaçtan normal iner
      if (r.yerde && !r.zipliyor && r.vy === 0) this.zemineYapis(r, 2 * C);
      this.yercekimi(r, dt);
    }

    // Düşme sesi (bağırma): sadece yürürken bir yerden düşünce çalar. Zıplamanın inişinde bağırmaz;
    // çünkü zıplama oyuncunun isteğiyle yapılan bir hareket, düşme ise kazara. Yere değince biter,
    // iniş sesi çalar. (rüzgar bunun ardından uygulanır)
    if (!r.yerde) {
      if (r.zipliyor) r.ziplaGecen = (r.ziplaGecen || 0) + (r.vy < 0 ? 0 : dt);
      else r.havada = (r.havada || 0) + dt;
      if (r.havada > 0.12 && !this.dusmeSes && this.cache.audio.exists("ses_dusme")) {
        try { this.dusmeSes = this.sound.add("ses_dusme", { volume: 0.6 }); this.dusmeSes.play(); } catch (e) { this.dusmeSes = null; }
      }
    } else {
      if ((r.havada || 0) > 0.12) { this.dusmeSesiDurdur(); this.ses("ses_dustu", { volume: 0.8 }); }
      else if (r.zipliyor && r.ziplaGecen > 0.1) this.ses("ses_dustu", { volume: r.ziplaGecen > 0.6 ? 0.8 : 0.5 }); // zıplayıp derine inerse daha tok iniş
      r.havada = 0; r.zipliyor = false;
    }

    const rk = this.ruzgarUygula(r, dt);
    if (rk === 3) r.havada = 0;
    let yon = 0;
    if (this.tuslar.sol) yon = -1;
    if (this.tuslar.sag) yon = 1;
    r.pompa = Math.max(0, r.pompa - dt);
    if (!r.yerde && yon !== 0) r.yon = yon; // havadayken de basılan yöne bakar
    if (r.zipliyor && !r.yerde && rk !== 3 && yon !== 0) this.yatay(r, yon * REIS_HIZ * 0.9 * this.hizCarpan * dt, false); // zıplarken havada yönlendirme
    if (rk === 3 && yon !== 0) this.yatay(r, yon * REIS_HIZ * 0.6 * this.hizCarpan * dt, false); // yukarı rüzgarda havada yana süzülür

    let tex;
    if (yon !== 0 && r.pompa <= 0 && r.yerde && r.egik) {
      // eğik yürüme: kazma yok, kum/toprak engel olur
      r.yon = yon;
      this.yatay(r, yon * REIS_HIZ * EGIK_HIZ * this.hizCarpan * dt, false);
      r.kazdi = false;
      r.kare += dt * 10;
      const adimNo = Math.floor(r.kare / 2);
      if (adimNo !== r.sonAdim) { r.sonAdim = adimNo; this.ses("ses_adim" + Phaser.Math.Between(1, 3), { volume: 0.5 }); }
      tex = this.kareler.reis_egil[Math.floor(r.kare) % this.kareler.reis_egil.length];
      r.idleSure = 0; r.blinkAsama = 0; r.blinkZaman = undefined;
    } else if (yon !== 0 && r.pompa <= 0 && r.yerde) {
      r.yon = yon;
      const hizx = yon * (r.kazdi ? KAZMA_HIZ : REIS_HIZ) * this.hizCarpan * dt, kk = this.kayaOnde(r, yon);
      const sonuc = kk ? this.kayaIt(r, kk, yon, hizx) : this.yatay(r, hizx, true); // kayayı iterken kazma yok
      r.kazdi = sonuc.kazdi;
      if (r.kazdi) r.kazZaman = zaman;
      if (r.kazdi && this.kumParcacik && zaman - (this.sonKumPartik || 0) > 80) {
        this.sonKumPartik = zaman;
        this.kumParcacik.emitParticleAt(r.x + yon * 18, r.y - 20, 2);
      }
      if (r.kazdi && zaman - (this.sonKazmaSes || 0) > 420) {
        this.sonKazmaSes = zaman;
        this.ses("ses_kum_kazma", { volume: 0.7, detune: Phaser.Math.Between(-120, 120) });
      }
      r.kare += dt * (r.kazdi ? 8 : 12);
      const kaziyor = zaman - (r.kazZaman || -1e9) < 250;
      // adım sesi: yürüme döngüsünde her yarım turda bir (kazarken yok)
      const adimNo = Math.floor(r.kare / 3);
      if (adimNo !== r.sonAdim) {
        r.sonAdim = adimNo;
        if (!kaziyor) this.ses("ses_adim" + Phaser.Math.Between(1, 3), { volume: 0.6 });
      }
      tex = kaziyor ? this.kareler.reis_kaz[Math.floor(r.kare) % 6] : this.kareler.reis_walk[Math.floor(r.kare) % 6];
      r.idleSure = 0; r.blinkAsama = 0; r.blinkZaman = undefined;
    } else if (r.pompa > 0) {
      tex = this.kareler.reis_pump[Math.floor(zaman / 120) % 2];
      r.idleSure = 0; r.blinkAsama = 0; r.blinkZaman = undefined;
    } else if (r.yerde && r.egik) {
      tex = "reis_egil0";
      r.idleSure = 0; r.blinkAsama = 0; r.blinkZaman = undefined;
    } else if (r.yerde) {
      // Boşta bekleme: ilk iki poz arasında aralıklarla geçiş yapar (peş peşe değil).
      // Uzun süre kıpırdamazsa sabırsızlanıp ayağını yere vurma moduna (2-3, pıt pıt pıt) geçer.
      r.idleSure = (r.idleSure || 0) + dt * 1000;
      const sabirsiz = r.idleSure > IDLE_SABIR_ESIGI;
      if (r.idleDegisim === undefined || zaman > r.idleDegisim || r.idleSabirsizDi !== sabirsiz) {
        r.idlePoz = r.idlePoz === 0 ? 1 : 0;
        r.idleSabirsizDi = sabirsiz;
        const minB = sabirsiz ? IDLE_SABIRSIZ_MIN : IDLE_BEKLEME_MIN;
        const maxB = sabirsiz ? IDLE_SABIRSIZ_MAX : IDLE_BEKLEME_MAX;
        r.idleDegisim = zaman + Phaser.Math.Between(minB, maxB);
        if (sabirsiz) this.ses("ses_ayak_vur", { volume: 0.8 });
      }
      if (sabirsiz) {
        tex = r.idlePoz === 0 ? "reis_idle2" : "reis_idle3";
        r.blinkAsama = 0; r.blinkZaman = undefined;
      } else {
        // Normal beklemede ara sıra çift göz kırpma: kapa-aç-kapa-aç, sonra açık devam
        if (r.blinkZaman === undefined) r.blinkZaman = zaman + Phaser.Math.Between(IDLE_KIRPMA_ARALIK_MIN, IDLE_KIRPMA_ARALIK_MAX);
        if (!r.blinkAsama && zaman > r.blinkZaman) { r.blinkAsama = 1; r.blinkDegisim = zaman + IDLE_KIRPMA_KARE_SURE; }
        if (r.blinkAsama && zaman > r.blinkDegisim) {
          r.blinkAsama++;
          r.blinkDegisim = zaman + IDLE_KIRPMA_KARE_SURE;
          if (r.blinkAsama > 4) {
            r.blinkAsama = 0;
            r.blinkZaman = zaman + Phaser.Math.Between(IDLE_KIRPMA_ARALIK_MIN, IDLE_KIRPMA_ARALIK_MAX);
          }
        }
        if (r.blinkAsama === 1 || r.blinkAsama === 3) tex = "reis_idle5";       // göz kapalı
        else if (r.blinkAsama === 2 || r.blinkAsama === 4) tex = "reis_idle4"; // göz açık (kırpma pozu)
        else tex = r.idlePoz === 0 ? "reis_idle0" : "reis_idle1";
      }
    } else {
      tex = "reis_walk0";
    }
    // Havada iki ayrı durum: zıplama (yükselirken zıplama pozu, inerken iniş pozu) ve kazara düşme
    // (eski bağıran düşme pozu). İniş pozuna tepe noktasından biraz önce geçilir, hareket akıcı görünsün.
    const havada = !r.yerde;
    const ziplamaPozu = havada && r.zipliyor;
    if (havada) tex = ziplamaPozu ? (r.vy < -120 ? "reis_zipla" : "reis_zipla_in") : "reis_dus";
    if (r.yerde) { r.sonGuvenliX = r.x; r.sonGuvenliY = r.y; }

    if (this.dokunulmaz > 0) { this.dokunulmaz -= dt; r.spr.setAlpha(Math.floor(zaman / 100) % 2 ? 0.4 : 1); }
    else r.spr.setAlpha(1);

    // Basamak inip çıkarken görsel yükseklik yumuşak geçer (6 px'lik sıçrama görünmez)
    if (havada || r.gorselY === undefined || Math.abs(r.y - r.gorselY) > 3 * C) r.gorselY = r.y;
    else r.gorselY += (r.y - r.gorselY) * Math.min(1, dt * 18);
    if (havada && !ziplamaPozu) r.spr.setOrigin(0.5, 0.5).setTexture(tex).setFlipX(r.yon > 0).setScale(REIS_OLCEK * 0.8).setPosition(r.x, r.y - 58);
    else r.spr.setOrigin(0.5, 1).setTexture(tex).setFlipX(r.yon < 0).setScale(tex.startsWith("reis_egil") ? REIS_OLCEK * EGIK_OLCEK : REIS_OLCEK).setPosition(r.x, havada ? r.y : r.gorselY);

    // Pompa hortumu: pompanın alt ucundan çıkar, yerde kıvrılarak düşmana gider
    const h = this.pompaHedef;
    if (r.pompa > 0 && h && !h.olu) {
      // hortum, pompa görselindeki hortum çıkış (soket) noktasından başlar: [merkezden yatay px, tabandan yukarı px] (görsel pikseli)
      const cikis = POMPA_HORTUM_CIKIS[tex] || POMPA_HORTUM_CIKIS.reis_pump0;
      const sx = r.x + r.yon * cikis[0] * REIS_OLCEK, sy = r.y - cikis[1] * REIS_OLCEK;
      const ex = h.x - r.yon * h.w * 0.28, ey = h.tip.ucar ? h.y - h.h / 2 : h.y - 14;
      const yer = Math.min(r.y, h.y) - 3;
      const kontrol = new Phaser.Math.Vector2((sx + ex) / 2, Math.min(yer, Math.max(sy, ey) + 10));
      const egri = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(sx, sy), kontrol, new Phaser.Math.Vector2(ex, ey));
      const nok = egri.getPoints(20);
      // 3D boru: kontur, gövde, alt gölge, üst parlama
      const kay = (dy) => nok.map((p) => new Phaser.Math.Vector2(p.x, p.y + dy));
      const hg = this.hortum;
      // hortum: pompa butonundaki koyu kömür grisi (pompanın eski hortumuna bakılarak kalınlaştırıldı)
      hg.lineStyle(6.4, 0x0e0d0d, 1).strokePoints(nok);
      hg.lineStyle(4.6, 0x383634, 1).strokePoints(nok);
      hg.lineStyle(1.9, 0x1e1d1c, 1).strokePoints(kay(1.3));
      hg.lineStyle(1.4, 0x6f6b67, 1).strokePoints(kay(-1));
      hg.lineStyle(0.9, 0xa29d97, 0.7).strokePoints(kay(-1.5));
      // düşman tarafındaki uç: koyu sarı pirinç başlık
      const t = egri.getTangent(1);
      const L = 7.5, bx = ex - t.x * L, by = ey - t.y * L;
      const nx = -t.y, ny = t.x;
      hg.lineStyle(6.4, 0x2e2010, 1).lineBetween(bx, by, ex, ey);
      hg.lineStyle(5.2, 0x9a7638, 1).lineBetween(bx, by, ex, ey);
      hg.lineStyle(1.8, 0x5e4520, 1).lineBetween(bx + nx * 1.4, by + ny * 1.4, ex + nx * 1.4, ey + ny * 1.4);
      hg.lineStyle(1.4, 0xd8b673, 1).lineBetween(bx - nx * 1.1, by - ny * 1.1, ex - nx * 1.1, ey - ny * 1.1);
      hg.lineStyle(0.6, 0xf4e2b0, 0.9).lineBetween(bx - nx * 1.7, by - ny * 1.7, ex - nx * 1.7, ey - ny * 1.7);
      // halka
      const hx = bx + t.x * 2.3, hy = by + t.y * 2.3;
      hg.lineStyle(1.2, 0x4a3518, 1).lineBetween(hx + nx * 2.6, hy + ny * 2.6, hx - nx * 2.6, hy - ny * 2.6);
    }
  }

  dusmanGuncelle(dt, zaman) {
    const r = this.reis;
    for (const d of this.dusmanlar) {
      if (d.olu) continue;
      if (d.tip.ucar) d.yerde = true; else this.yercekimi(d, dt);

      // kumun altında kaldı mı
      const b = this.govde(d);
      let dolu = 0, top = 0;
      for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) { top++; if (this.hucre(x, y) === KUM) dolu++; }
      if (top && dolu / top > 0.45) { this.patlat(d, 300); continue; }

      if (d.y > ALT + 100) { d.olu = true; d.spr.destroy(); this.puanEkle(150, d.x, ALT); continue; }

      // rüzgar
      const rk = this.ruzgarKuvvet(d);
      if (d.tip.ucar) {
        if (rk === 1 || rk === 2) this.yatay(d, (rk === 1 ? 1 : -1) * RUZGAR_HIZ * dt, false);
        if (rk === 4) d.hoverEk = Math.max((d.hoverEk || 0) - 160 * dt, -85);
        else if (d.hoverEk) d.hoverEk += Math.sign(-d.hoverEk) * Math.min(Math.abs(d.hoverEk), 70 * dt);
      } else if (rk) this.ruzgarUygula(d, dt);

      // sönme: pompalama bıraktıktan 0,5 sn sonra başlar, sonra hızlıca (0,35 sn'de bir kademe) söner
      if (d.sisme > 0 && zaman - d.sonPompa > 500 && zaman - (d.sonSonme || 0) > 350) { d.sisme--; d.sonSonme = zaman; this.ses("ses_sonme", { volume: 0.6 }); }

      if (d.sisme > 0) {
        d.spr.setTexture(d.tip.ad + "_pump" + Math.min(3, d.sisme)).setPosition(d.x, d.tip.ucar ? d.y - d.h / 2 : d.y);
        continue;
      }

      if (d.tip.ucar) {
        // Uçan kuş: aynı hizadaysa Reis'e doğru süzülür, geçtikten sonra (280 px) dönüp tekrar gelir; duvara çarpınca döner
        d.faz += dt * 3.2;
        d.y = d.zemin - KUS_HAVA - (d.hoverEk || 0) + Math.sin(d.faz) * 2.5;
        const gor = !r.olu && Math.abs(r.y - d.zemin) < 70 && !this.aradaDuvarVarMi(d, r);
        if (gor && !d.hedefAldi) { d.yon = Math.sign(r.x - d.x) || d.yon; d.hedefAldi = true; }
        if (gor && (r.x - d.x) * d.yon < -280) d.yon *= -1;
        if (!gor) d.hedefAldi = false;
        const s = this.yatay(d, d.yon * d.tip.hiz * this.hizCarpan * dt, false);
        if (s.durdu) d.yon *= -1;
        d.kare += dt * 12;
        const kk = this.kareler.bird_walk;
        d.spr.setTexture(kk[Math.floor(d.kare) % kk.length]).setFlipX(d.yon < 0).setPosition(d.x, d.y - d.h / 2);
        continue;
      }

      if (Math.abs(r.y - d.y) < 70 && Math.abs(r.x - d.x) < 420 && !r.olu && !this.aradaDuvarVarMi(d, r)) d.yon = Math.sign(r.x - d.x) || d.yon;

      if (d.yerde) {
        const s = this.yatay(d, d.yon * d.tip.hiz * this.hizCarpan * dt, false);
        if (s.durdu) d.yon *= -1;
      }
      d.kare += dt * 8;
      const kr = this.kareler[d.tip.ad + "_walk"];
      d.spr.setTexture(kr[Math.floor(d.kare) % kr.length]).setFlipX(d.yon < 0).setPosition(d.x, d.y);
    }
  }

  kontrolEt() {
    const r = this.reis;
    if (r.y > ALT + 50) return this.olum();
    if (this.dokunulmaz <= 0) {
      for (const d of this.dusmanlar) {
        if (d.olu || d.sisme > 0) continue;
        if (d.tip.ucar) {
          // kuş: ayakta kafaya çarpar, eğikken altından geçilir
          const oy = Math.min(d.y, r.y) - Math.max(d.y - d.h, r.y - r.h);
          if (Math.abs(d.x - r.x) < (d.w + r.w) / 2 - 14 && oy > 6) return this.olum();
          continue;
        }
        if (Math.abs(d.x - r.x) < (d.w + r.w) / 2 - 18 && Math.abs((d.y - d.h / 2) - (r.y - r.h / 2)) < (d.h + r.h) / 2 - 15) return this.olum();
      }
    }
    if (this.dusmanlar.every((d) => d.olu)) this.bolumBitti();
  }

  olum() {
    if (this.durum !== "oyun") return;
    this.durum = "olum";
    this.reis.olu = true;
    this.reis.vy = -400;
    this.dusmeSesiDurdur();
    this.ses("ses_olme", { volume: 0.9 });
    this.time.delayedCall(1200, () => this.bitisEkrani(false));
  }

  bolumBitti() {
    if (this.durum !== "oyun") return;
    this.durum = "kazandi";
    enYuksekBolum(this.bolum + 2); // sonraki bölümün kilidi açılır

    // Eski bölüm tekrar oynanıyorsa en son kalınan yüksek ana kayıt düşürülmesin
    const mevcutKayitli = kayitOku("dpd_bolum", 0);
    if (this.bolum >= mevcutKayitli) {
      if (this.bolum + 1 >= BOLUMLER.length) {
        kayitYaz("dpd_bolum", 0);
        kayitYaz("dpd_tur", this.tur + 1);
      } else {
        kayitYaz("dpd_bolum", this.bolum + 1);
      }
    }
    this.ses("ses_kazandi", { volume: 0.9 });
    this.time.delayedCall(700, () => this.bitisEkrani(true));
  }

  bitisEkrani(kazandi) {
    Ads.oyunBitti();
    const grup = this.add.container(0, 0).setDepth(50);
    grup.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setInteractive());
    const panel = this.add.image(W / 2, 430, "panel");
    panel.setScale(640 / panel.width);
    grup.add(panel);
    grup.add(this.add.text(W / 2, 370, kazandi ? "Bölüm Tamam!" : "Yakalandın!", { ...YAZI, fontSize: "64px" }).setOrigin(0.5));
    grup.add(this.add.text(W / 2, 470, "Skor: " + this.skor, { ...YAZI, fontSize: "48px", color: "#ffe066" }).setOrigin(0.5));

    if (kazandi) {
      const son = this.bolum + 1 >= BOLUMLER.length;
      grup.add(this.barButon(W / 2, 820, "bar_yesil", son ? "Daha Zor Baştan Başla" : "Sonraki Bölüm", () =>
        this.scene.restart({ bolum: son ? 0 : this.bolum + 1, skor: this.skor, tur: son ? this.tur + 1 : this.tur })));
    } else {
      grup.add(this.barButon(W / 2, 820, "bar_yesil", "Tekrar Dene", () => this.scene.restart({ bolum: this.bolum, skor: this.baslangicSkor, tur: this.tur })));
      if (this.devamHakki) {
        grup.add(this.barButon(W / 2, 1000, "bar_mor", "Reklam izle, devam et", async () => {
          const izlendi = await Ads.odulluIzle();
          if (!izlendi) return;
          this.devamHakki = false;
          grup.destroy();
          this.dirilt();
        }));
      }
    }
  }

  // Uzun buton (yazı üstüne kodla eklenir)
  barButon(x, y, key, yazi, tik, yaziKaydir = 0) {
    const c = this.add.container(x, y);
    const arka = this.add.image(0, 0, key).setInteractive({ useHandCursor: true });
    const olcek = 460 / arka.width;
    arka.setScale(olcek);
    const t = this.add.text(yaziKaydir, -4, yazi, { ...YAZI, fontSize: yazi.length > 16 ? "31px" : "42px", strokeThickness: 7 }).setOrigin(0.5);
    arka.on("pointerdown", () => { c.setScale(0.94); });
    arka.on("pointerout", () => c.setScale(1));
    arka.on("pointerup", () => { c.setScale(1); tik(); });
    c.add([arka, t]);
    return c;
  }

  dirilt() {
    const r = this.reis;
    r.olu = false; r.vy = 0;
    if (r.y > ALT || !this.zeminVar(r)) { r.y = r.sonGuvenliY || OY + 120; r.x = r.sonGuvenliX || 60; }
    this.dokunulmaz = 2.5;
    this.durum = "oyun";
  }
}

window.oyun = new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: "oyun",
  backgroundColor: "#2b1d12",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [Oyun]
});

Ads.baslat();
