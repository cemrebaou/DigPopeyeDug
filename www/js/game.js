// DigPopeyeDug - kum fizikli kazı oyunu
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
const PERVANE_YON = { ">": "r", "<": "l", "^": "u", "v": "d" };
const ZIPLA_V = 590;                        // zıplama hızı (px/sn): yaklaşık 125 px yüksekliğe çıkar
const KAYA_ITME = 0.6, KAYA_BOY = 12;       // kaya itilirken Reis hız çarpanı; kaya boyu (kum tanesi) = 2x2 harita karesi
const KUS_HAVA = 110;                       // kuşun hitbox alt kenarının zeminden yüksekliği (ayakta çarpar, eğikken geçer)
const YERCEKIMI = 1400, MAX_DUSME = 700;
const REIS_HIZ = 200, KAZMA_HIZ = 110;
// Boşta bekleme animasyonu zamanlaması (ms)
// Pompa görselinde hortumun çıktığı nokta (görsel pikseli): [merkezden yatay, tabandan yukarı]
const POMPA_HORTUM_CIKIS = { reis_pump0: [37, 9], reis_pump1: [39, 15] };
const IDLE_BEKLEME_MIN = 1400, IDLE_BEKLEME_MAX = 2800;           // poz 0<->1 arası bekleme
const IDLE_SABIR_ESIGI = 9000;                                     // bu kadar hareketsiz kalınca sabırsızlanır
const IDLE_SABIRSIZ_MIN = 150, IDLE_SABIRSIZ_MAX = 260;            // sabırsız pozlar (2<->3): pıt pıt pıt, ikisi de kısa ve eşit
const IDLE_KIRPMA_ARALIK_MIN = 3500, IDLE_KIRPMA_ARALIK_MAX = 7000; // normal beklemede ara sıra çift göz kırpma
const IDLE_KIRPMA_KARE_SURE = 110;                                  // kırpma: kapa-aç-kapa-aç, her kare kısa

const SPRITELAR = [
  ...[0, 1, 2, 3, 4, 5].map((i) => "reis_walk" + i),
  "reis_pump0", "reis_pump1", "reis_dus", "btn_tamekran", "kaya",
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => "fan" + i),
  ...[0, 1, 2, 3].map((i) => "reis_egil" + i), "btn_egil", "btn_kalk",
  ...[0, 1, 2, 3].map((i) => "bird_walk" + i),
  ...[0, 1, 2, 3].map((i) => "bird_pump" + i), "bird_pop0",
  ...[0, 1, 2, 3, 4, 5].map((i) => "reis_idle" + i),
  ...[0, 1, 2, 3, 4, 5].map((i) => "reis_kaz" + i),
  ...[0, 1, 2, 3].map((i) => "reis_fall" + i),
  ...[0, 1, 2, 3, 4].map((i) => "crab_walk" + i),
  ...[0, 1, 2, 3].map((i) => "crab_pump" + i), "crab_pop0",
  ...[0, 1, 2].map((i) => "octo_walk" + i),
  ...[0, 1, 2, 3].map((i) => "octo_pump" + i), "octo_pop0",
  "btn_sol", "btn_sag", "btn_pompa", "btn_yeniden",
  "bar_yesil", "bar_mor", "bar_turuncu", "panel",
  "doku_kum", "doku_tahta"
];

const SESLER = [
  "ses_pompa", "ses_sisme", "ses_sonme", "ses_yengec_pop", "ses_ahtapot_pop",
  "ses_kum_kazma", "ses_kapak", "ses_adim1", "ses_adim2", "ses_adim3",
  "ses_dusme", "ses_dustu", "ses_kum_dokul", "ses_kum_dok", "ses_olme", "ses_kazandi",
  "ses_ayak_vur"
];

const DUSMAN_TIP = {
  c: { ad: "crab", hiz: 65, w: 81, h: 63 },
  o: { ad: "octo", hiz: 48, w: 99, h: 66 },
  b: { ad: "bird", hiz: 115, w: 60, h: 46, ucar: true }
};

const YAZI = { fontFamily: "Arial Black, Arial", fontStyle: "bold", color: "#ffffff", stroke: "#3b2412", strokeThickness: 8 };

function kayitOku(k, v) { try { const x = localStorage.getItem(k); return x === null ? v : JSON.parse(x); } catch (e) { return v; } }
function kayitYaz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

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

  create() {
    if (this.dusmeSes) { try { this.dusmeSes.stop(); this.dusmeSes.destroy(); } catch (e) {} }
    this.dusmeSes = null; this.kumSayac = 0; this.sonKumSes = 0; this.sonKazmaSes = 0;
    this.durum = "oyun";
    this.kare = 0;
    this.tuslar = { sol: false, sag: false };
    this.devamHakki = true;
    this.dokunulmaz = 0;

    this.animasyonlar();
    this.arkaPlan();
    this.haritaYukle(BOLUMLER[this.bolum]);
    this.dokulariHazirla();
    this.altKaya();

    // Zemin, ekran çözünürlüğünde (1:1) çizilir; büyütme yok, bulanıklık yok
    this.kumTex = this.textures.createCanvas("zemin" + Date.now(), W, ALAN_H);
    this.add.image(0, OY, this.kumTex.key).setOrigin(0).setDepth(1);
    this.imgData = this.kumTex.context.createImageData(W, ALAN_H);
    this.piksel = new Uint32Array(this.imgData.data.buffer);

    this.kapakCizim = this.add.graphics().setDepth(2);
    this.kapakDegisti = true;
    this.hortum = this.add.graphics().setDepth(4);

    this.reis.spr = this.add.image(this.reis.x, this.reis.y, "reis_walk0").setOrigin(0.5, 1).setScale(REIS_OLCEK).setDepth(5);
    this.dusmanlar.forEach((d) => {
      d.spr = this.add.image(d.x, d.tip.ucar ? d.y - d.h / 2 : d.y, d.tip.ad + "_walk0").setOrigin(0.5, d.tip.ucar ? 0.5 : 1).setScale(DUSMAN_OLCEK).setDepth(3);
    });

    this.kayalar.forEach((k) => {
      k.sx = k.gx * C; k.sy = OY + k.gy * C;
      k.spr = this.add.image(k.sx, k.sy, "kaya").setOrigin(0, 0).setDisplaySize(k.w * C, k.h * C).setDepth(3.5);
    });
    this.pervaneKur();
    this.ruzgarCizim = this.add.graphics().setDepth(6);
    this.ruzgarSay = 0;

    this.arayuz();
    this.kontroller();
    this.tumunuKirlet();
    this.kumCiz();
  }

  animasyonlar() {
    this.kareler = {
      reis_walk: [0, 1, 2, 3, 4, 5].map((i) => "reis_walk" + i),
      reis_fall: [0, 1, 2, 3].map((i) => "reis_fall" + i),
      reis_pump: ["reis_pump0", "reis_pump1"],
      reis_kaz: [0, 1, 2, 3, 4, 5].map((i) => "reis_kaz" + i),
      crab_walk: [0, 1, 2, 3, 4].map((i) => "crab_walk" + i),
      octo_walk: [0, 1, 2].map((i) => "octo_walk" + i),
      bird_walk: [0, 1, 2, 3].map((i) => "bird_walk" + i),
      reis_egil: [0, 1, 2, 3].map((i) => "reis_egil" + i)
    };
  }

  arkaPlan() {
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x5bb8f0, 0x5bb8f0, 0xbfe9ff, 0xbfe9ff, 1);
    g.fillRect(0, 0, W, ALT);
    // Alt kontrol bandı: tahta
  }

  // ---------- Dokular ----------
  // Her malzeme için ekran boyutunda bir piksel kaynağı hazırlanır
  dokulariHazirla() {
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
      [KUM]: yap(kum, (r, g, b) => renk32(sinir(r * 0.85), sinir(g * 1.0), sinir(b * 1.1))), // dökülecek kum: zeytin yeşili
      [TOPRAK]: orijinal, // sabit kalan zemin: orijinal sarı kum
      [KAYA]: orijinal,
      [KAPAK]: yap(tahta, (r, g, b) => renk32(sinir(r * 1.45), sinir(g * 1.2), sinir(b * 0.95))),
      magara: yap(kum, (r, g, b) => renk32(sinir(r * 0.24), sinir(g * 0.16), sinir(b * 0.12)))
    };
  }

  // Butonların arkası: oyun alanındaki gri kaya kesintisiz aşağı devam eder
  altKaya() {
    const yuk = H - ALT, img = this.textures.get("doku_kum").getSourceImage();
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = yuk;
    const cx = cv.getContext("2d");
    const bas = -(ALAN_H % img.height);
    for (let y = bas; y < yuk; y += img.height) for (let x = 0; x < W; x += img.width) cx.drawImage(img, x, y);
    const key = "altkaya" + Date.now();
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
        if (PERVANE_YON[ch]) this.pervaneler.push({ yon: PERVANE_YON[ch], px, py, acik: false });
        if (DUSMAN_TIP[ch]) {
          const t = DUSMAN_TIP[ch];
          this.dusmanlar.push({ tip: t, x: px, y: t.ucar ? py - KUS_HAVA : py, zemin: py, faz: Math.random() * 6.28, w: t.w, h: t.h, vy: 0, yon: Math.random() < 0.5 ? -1 : 1, kare: 0, sisme: 0, sonPompa: 0, olu: false });
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
        if (this.g[y * GX + x] !== BOS && this.g[y * GX + x] !== TAS) yer = true; // kaya mağara sayılmaz (arkasında gölge izi kalmasın)
        if (yer) this.magara[y * GX + x] = 1;
      }
    }
  }

  // ---------- Arayüz ----------
  arayuz() {
    this.add.text(24, 34, BOLUMLER[this.bolum].ad, { ...YAZI, fontSize: "38px" }).setDepth(10);
    this.skorYazi = this.add.text(W / 2 + 40, 34, "Skor: " + this.skor, { ...YAZI, fontSize: "38px", color: "#ffe066" }).setOrigin(0.5, 0).setDepth(10);
    this.ipucu = this.add.text(W / 2, 100, BOLUMLER[this.bolum].ipucu || "Kapaklara dokun, açılsın!", { ...YAZI, fontSize: "26px", color: "#fff3c4", strokeThickness: 6 }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: this.ipucu, alpha: 0, delay: 4000, duration: 800 });

    // Yeniden başla
    this.ikonButon(W - 56, 62, "btn_yeniden", 84, () => this.scene.restart({ bolum: this.bolum, skor: this.baslangicSkor, tur: this.tur }));

    // Tam ekran (sadece tarayıcıda; telefondaki uygulamada zaten tam ekran)
    if (!Ads.native && this.sys.game.device.fullscreen.available) {
      this.ikonButon(W - 56 - 98, 62, "btn_tamekran", 84, () => {
        if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen();
      });
    }
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
    this.ikonButon(618, 926, "btn_kalk", 120, () => this.zipla()).setAlpha(0.92); // zıpla (geçici: yukarı ok)
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
      const rz = (x, y) => (x < 0 || x >= GX || y < 0 || y >= GY ? 0 : this.ruzgarYon[y * GX + x]);
      let yukari = false;
      if (rz(k.gx - 1, ym) === 1) k.rx += RUZGAR_HIZ * 0.7 * dt;
      else if (rz(k.gx + k.w, ym) === 2) k.rx -= RUZGAR_HIZ * 0.7 * dt;
      else k.rx = 0;
      if (rz(xm, k.gy + k.h) === 3) { yukari = true; k.ry += 85 * dt; } else k.ry = 0;
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
      // görsel: hücre konumuna yumuşak yaklaş
      const hx = k.gx * C, hy = OY + k.gy * C, f = Math.min(1, dt * 28);
      k.sx += (hx - k.sx) * f; k.sy += (hy - k.sy) * f;
      k.spr.setPosition(k.sx, k.sy);
    }
  }

  kalkabilir(r) {
    const b = this.govde({ x: r.x, y: r.y, w: r.w, h: REIS_BOY });
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) if (this.katiMi(x, y)) return false;
    return true;
  }

  // ---------- Rüzgar / pervane ----------
  pervaneKur() {
    const fw = 121 * PERVANE_OLCEK, fh = 148 * PERVANE_OLCEK; // görsel boyutu (79 x 96)
    this.pervaneler.forEach((p) => {
      const yatayMi = p.yon === "r" || p.yon === "l";
      p.cx = p.px;
      if (yatayMi) p.cy = p.py - fh / 2;                 // zemine oturur
      else if (p.yon === "u") p.cy = p.py - fw / 2;       // zeminden yukarı üfler
      else p.cy = p.py - KARE_PX + fw / 2;                // tavana asılı, aşağı üfler
      p.yari = fh * 0.42;                                 // rüzgar bandının yarı genişliği (px)
      p.on = fw / 2;                                      // ön kenara uzaklık (px)
      const spr = this.add.image(p.cx, p.cy, "fan0").setScale(PERVANE_OLCEK).setDepth(3);
      if (p.yon === "l") spr.setFlipX(true);
      if (p.yon === "u") spr.setAngle(-90);
      if (p.yon === "d") spr.setAngle(90);
      spr.setInteractive({ useHandCursor: true });
      spr.on("pointerdown", () => this.pervaneTikla(p));
      p.spr = spr;
      p.hucre = new Int32Array(0); p.menzil = [];
      p.isin = [];
      for (let n = 0; n < 16; n++) p.isin.push({ a: Math.random() * 2 - 1, t: Math.random(), v: 0.5 + Math.random() * 0.6 });
    });
  }

  pervaneTikla(p) {
    if (this.durum !== "oyun") return;
    p.acik = !p.acik;
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
      const dx = p.yon === "r" ? 1 : p.yon === "l" ? -1 : 0, dy = p.yon === "d" ? 1 : p.yon === "u" ? -1 : 0;
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

  ruzgarGuncelle(dt, zaman) {
    if (!this.pervaneler.length) return;
    this.ruzgarSay++;
    const aktif = this.pervaneler.some((p) => p.acik);
    if (aktif && this.ruzgarSay % (this.kayalar.length ? 1 : 8) === 0) this.ruzgarKur();
    const g = this.ruzgarCizim;
    g.clear();
    for (const p of this.pervaneler) {
      p.spr.setTexture("fan" + (p.acik ? Math.floor(zaman / 45) % 8 : 0));
      if (!p.acik) continue;
      const dx = p.yon === "r" ? 1 : p.yon === "l" ? -1 : 0, dy = p.yon === "d" ? 1 : p.yon === "u" ? -1 : 0;
      const nx = dy ? 1 : 0, ny = dx ? 1 : 0; // yana doğru birim vektör
      for (const s of p.isin) {
        s.t += dt * s.v;
        if (s.t > 1) { s.t = 0; s.a = Math.random() * 2 - 1; s.v = 0.5 + Math.random() * 0.6; }
        const bi = Math.round((s.a + 1) / 2 * (p.menzil.length - 1));
        const uz = p.menzil[bi] || 0;
        if (uz < p.on + 20) continue;
        const bas = p.on + s.t * (uz - p.on), alfa = Math.sin(Math.PI * s.t) * 0.34;
        const pts = [];
        for (let j = 0; j <= 6; j++) {
          const d = bas - 56 * j / 6;
          if (d < p.on) continue;
          const yan = s.a * p.yari + Math.sin(d * 0.07 + s.t * 10) * 3.5;
          pts.push({ x: p.cx + dx * d + nx * yan, y: p.cy + dy * d + ny * yan });
        }
        if (pts.length < 2) continue;
        g.lineStyle(3.2, 0xffffff, alfa).strokePoints(pts);
        g.lineStyle(1.4, 0xd8f0ff, Math.min(1, alfa * 1.4)).strokePoints(pts);
      }
    }
  }

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
    if (n) { this.kapakDegisti = true; this.cameras.main.shake(120, 0.004); this.ses("ses_kapak", { volume: 0.8 }); }
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

  // Değişen hücreyi ve komşularını yeniden çizilecek olarak işaretle
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
        // basamak: sadece en alttaki 2 kare engelse yukarı çık
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
        if (g[a] === BOS && !eng[a]) hedef = a;
        else {
          const ilk = Math.random() < 0.5 ? -1 : 1;
          for (const s of [ilk, -ilk]) {
            const nx = x + s;
            if (nx < 0 || nx >= GX) continue;
            const yan = i + s, alt = a + s;
            if (g[alt] === BOS && !eng[alt] && g[yan] === BOS) { hedef = alt; break; }
          }
        }
        if (hedef >= 0) {
          g[hedef] = KUM; si[hedef] = si[i];
          g[i] = BOS;
          this.durgun[hedef] = 0;
          this.kirlet(i); this.kirlet(hedef);
          hareket++;
        } else if (si[i] !== i && ++this.durgun[i] > 20) {
          // durulan kum, dokuyu kendi yerinden alır: yan yana taneler arasında dikiş/çizgi kalmaz
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
      if (tip === TAS) { const c = renk32(112, 94, 70); for (let yy = 0; yy < C; yy++) { const o = hedef0 + yy * W; for (let xx = 0; xx < C; xx++) px[o + xx] = c; } continue; }
      const s = tip === KUM ? si[i] : i;
      const kaynak0 = ((s / GX) | 0) * C * W + (s % GX) * C;
      const dz = src[tip];
      const ton = 1;
      const ust = bosMu(cx, cy - 1) || cy === 0, alt = bosMu(cx, cy + 1);
      const sol = bosMu(cx - 1, cy), sag = bosMu(cx + 1, cy);
      for (let yy = 0; yy < C; yy++) {
        const o = hedef0 + yy * W, ko = kaynak0 + yy * W;
        let fy = ton;
        if (ust && yy < 3) fy *= UST[yy];
        if (alt && yy >= C - 3) fy *= ALTG[yy - (C - 3)];
        for (let xx = 0; xx < C; xx++) {
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
      this.kontrolEt();
    } else if (this.durum === "olum") {
      this.reisGuncelle(dt, zaman);
    }
    this.kumCiz();
    this.kapakVurgu(zaman);
  }

  // Kapak kenarları: sadece kapak değişince yeniden çizilir, yanıp sönme alpha ile
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
      r.spr.setTexture(this.kareler.reis_fall[Math.floor(r.kare) % 4]).setPosition(r.x, r.y);
      return;
    }
    r.h = r.egik ? REIS_EGIK_BOY : REIS_BOY;
    if (this.egilBtn) { const k = r.egik ? "btn_kalk" : "btn_egil"; if (this.egilBtn.texture.key !== k) this.egilBtn.setTexture(k); }
    if (r.vy < 0) {
      // zıplama: yukarı çıkış (tavana çarparsa yukari() hızı sıfırlar)
      r.yerde = false; r.ziplaGecen = (r.ziplaGecen || 0) + dt;
      this.yukari(r, -r.vy * dt);
      if (r.vy < 0) r.vy = Math.min(0, r.vy + YERCEKIMI * dt);
    } else this.yercekimi(r, dt);

    // Düşme sesi: havadayken çalar, yere değince biter; iniş sesi çalar  (rüzgar bunun ardından uygulanır)
    if (!r.yerde) {
      if (r.zipliyor) r.ziplaGecen = (r.ziplaGecen || 0) + (r.vy < 0 ? 0 : dt);
      if (!r.zipliyor || r.vy > 500) r.havada = (r.havada || 0) + dt;
      if (r.havada > 0.12 && !this.dusmeSes && this.cache.audio.exists("ses_dusme")) {
        try { this.dusmeSes = this.sound.add("ses_dusme", { volume: 0.6 }); this.dusmeSes.play(); } catch (e) { this.dusmeSes = null; }
      }
    } else {
      if ((r.havada || 0) > 0.12) { this.dusmeSesiDurdur(); this.ses("ses_dustu", { volume: 0.8 }); }
      else if (r.zipliyor && r.ziplaGecen > 0.1) this.ses("ses_dustu", { volume: 0.5 });
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
      tex = this.kareler.reis_egil[Math.floor(r.kare) % 4];
      r.idleSure = 0; r.blinkAsama = 0; r.blinkZaman = undefined;
    } else if (yon !== 0 && r.pompa <= 0 && r.yerde) {
      r.yon = yon;
      const hizx = yon * (r.kazdi ? KAZMA_HIZ : REIS_HIZ) * this.hizCarpan * dt, kk = this.kayaOnde(r, yon);
      const sonuc = kk ? this.kayaIt(r, kk, yon, hizx) : this.yatay(r, hizx, true); // kayayı iterken kazma yok
      r.kazdi = sonuc.kazdi;
      if (r.kazdi) r.kazZaman = zaman;
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
    const havada = !r.yerde;
    if (havada) tex = "reis_dus";
    if (r.yerde) { r.sonGuvenliX = r.x; r.sonGuvenliY = r.y; }

    if (this.dokunulmaz > 0) { this.dokunulmaz -= dt; r.spr.setAlpha(Math.floor(zaman / 100) % 2 ? 0.4 : 1); }
    else r.spr.setAlpha(1);

    if (havada) r.spr.setOrigin(0.5, 0.5).setTexture(tex).setFlipX(r.yon > 0).setScale(REIS_OLCEK * 0.8).setPosition(r.x, r.y - 58);
    else r.spr.setOrigin(0.5, 1).setTexture(tex).setFlipX(r.yon < 0).setScale(tex.startsWith("reis_egil") ? REIS_OLCEK * EGIK_OLCEK : REIS_OLCEK).setPosition(r.x, r.y);

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
    if (this.bolum + 1 >= BOLUMLER.length) { kayitYaz("dpd_bolum", 0); kayitYaz("dpd_tur", this.tur + 1); }
    else kayitYaz("dpd_bolum", this.bolum + 1);
    this.ses("ses_kazandi", { volume: 0.9 });
    this.time.delayedCall(700, () => this.bitisEkrani(true));
  }

  bitisEkrani(kazandi) {
    Ads.oyunBitti();
    const grup = this.add.container(0, 0).setDepth(50);
    grup.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setInteractive());
    const panel = this.add.image(W / 2, 470, "panel");
    panel.setScale(640 / panel.width);
    grup.add(panel);
    grup.add(this.add.text(W / 2, 400, kazandi ? "Bölüm Tamam!" : "Yakalandın!", { ...YAZI, fontSize: "64px" }).setOrigin(0.5));
    grup.add(this.add.text(W / 2, 500, "Skor: " + this.skor, { ...YAZI, fontSize: "48px", color: "#ffe066" }).setOrigin(0.5));

    if (kazandi) {
      const son = this.bolum + 1 >= BOLUMLER.length;
      grup.add(this.barButon(W / 2, 800, "bar_yesil", son ? "Daha Zor Baştan Başla" : "Sonraki Bölüm", () =>
        this.scene.restart({ bolum: son ? 0 : this.bolum + 1, skor: this.skor, tur: son ? this.tur + 1 : this.tur })));
    } else {
      grup.add(this.barButon(W / 2, 800, "bar_yesil", "Tekrar Dene", () => this.scene.restart({ bolum: this.bolum, skor: this.baslangicSkor, tur: this.tur })));
      if (this.devamHakki) {
        grup.add(this.barButon(W / 2, 960, "bar_mor", "Reklam izle, devam et", async () => {
          const izlendi = await Ads.odulluIzle();
          if (!izlendi) return;
          this.devamHakki = false;
          grup.destroy();
          this.dirilt();
        }, 48));
      }
    }
  }

  // Uzun buton (yazı üstüne kodla eklenir)
  barButon(x, y, key, yazi, tik, yaziKaydir = 0) {
    const c = this.add.container(x, y);
    const arka = this.add.image(0, 0, key).setInteractive({ useHandCursor: true });
    const olcek = 540 / arka.width;
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
