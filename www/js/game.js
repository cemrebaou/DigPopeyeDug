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

const BOS = 0, KUM = 1, KAYA = 2, KAPAK = 3, TOPRAK = 4;

const REIS_OLCEK = 0.585, DUSMAN_OLCEK = 0.63;
const YERCEKIMI = 1400, MAX_DUSME = 700;
const REIS_HIZ = 200, KAZMA_HIZ = 110;

const SPRITELAR = [
  ...[0, 1, 2, 3, 4, 5].map((i) => "reis_walk" + i),
  "reis_pump0", "reis_pump1", "reis_dus", "btn_tamekran",
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
  "ses_dusme", "ses_dustu", "ses_kum_dokul", "ses_kum_dok", "ses_olme", "ses_kazandi"
];

const DUSMAN_TIP = {
  c: { ad: "crab", hiz: 65, w: 81, h: 63 },
  o: { ad: "octo", hiz: 48, w: 99, h: 66 }
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
    // Tur: bütün bölümler bitince baştan başlanır, her turda hızlar %10 artar
    this.tur = data && data.tur !== undefined ? data.tur : kayitOku("dpd_tur", 0);
    this.hizCarpan = 1 + 0.1 * this.tur;
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
      d.spr = this.add.image(d.x, d.y, d.tip.ad + "_walk0").setOrigin(0.5, 1).setScale(DUSMAN_OLCEK).setDepth(3);
    });

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
      octo_walk: [0, 1, 2].map((i) => "octo_walk" + i)
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
        if (ch === "R") this.reis = { x: px, y: py, w: 45, h: 126, vy: 0, yon: px > W / 2 ? -1 : 1, yerde: false, kare: 0, pompa: 0, olu: false };
        if (DUSMAN_TIP[ch]) {
          const t = DUSMAN_TIP[ch];
          this.dusmanlar.push({ tip: t, x: px, y: py, w: t.w, h: t.h, vy: 0, yon: Math.random() < 0.5 ? -1 : 1, kare: 0, sisme: 0, sonPompa: 0, olu: false });
        }
      }
    }
    if (!this.reis) this.reis = { x: 60, y: OY, w: 45, h: 126, vy: 0, yon: 1, yerde: false, kare: 0, pompa: 0, olu: false };

    // Mağara arka planı: başlangıçta üstünde dolu bir şey olan boş kareler
    this.magara = new Uint8Array(GX * GY);
    for (let x = 0; x < GX; x++) {
      let yer = false;
      for (let y = 0; y < GY; y++) {
        if (this.g[y * GX + x] !== BOS) yer = true;
        if (yer) this.magara[y * GX + x] = 1;
      }
    }
  }

  // ---------- Arayüz ----------
  arayuz() {
    this.add.text(24, 34, BOLUMLER[this.bolum].ad, { ...YAZI, fontSize: "38px" }).setDepth(10);
    this.skorYazi = this.add.text(W / 2 + 40, 34, "Skor: " + this.skor, { ...YAZI, fontSize: "38px", color: "#ffe066" }).setOrigin(0.5, 0).setDepth(10);
    this.ipucu = this.add.text(W / 2, 100, "Kapaklara dokun, açılsın!", { ...YAZI, fontSize: "26px", color: "#fff3c4", strokeThickness: 6 }).setOrigin(0.5).setDepth(10);
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
    // Butonlar: oklar 208 px, pompa 221 px, sol-sağ ok arası 10 px boşluk
    this.ikonButon(118, KONTROL_Y, "btn_sol", 208, () => (this.tuslar.sol = true), () => (this.tuslar.sol = false));
    this.ikonButon(336, KONTROL_Y, "btn_sag", 208, () => (this.tuslar.sag = true), () => (this.tuslar.sag = false));
    this.ikonButon(596, KONTROL_Y, "btn_pompa", 221, () => this.pompala());
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
      k.on("keydown-R", () => this.scene.restart({ bolum: this.bolum, skor: this.baslangicSkor, tur: this.tur }));
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
    if (n) { this.kapakDegisti = true; this.cameras.main.shake(120, 0.004); this.ses("ses_kapak", { volume: 0.8 }); }
  }

  // ---------- Izgara yardımcıları ----------
  hucre(x, y) {
    if (x < 0 || x >= GX) return KAYA;
    if (y < 0) return BOS;
    if (y >= GY) return KAYA;
    return this.g[y * GX + x];
  }
  katiMi(x, y) { return this.hucre(x, y) !== BOS; }

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
      let engelSatir = -1, kazilacak = [];
      for (let y = b.y0; y <= b.y1; y++) {
        const h = this.hucre(sx, y);
        if (h === BOS) continue;
        if (kazar && (h === KUM || h === TOPRAK)) kazilacak.push(y);
        else engelSatir = Math.max(engelSatir, y);
      }
      if (engelSatir >= 0) {
        // basamak: sadece en alttaki 2 kare engelse yukarı çık
        if (engelSatir >= b.y1 - 1 && engelSatir <= b.y1) {
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
    r.pompa = 0.35;
    this.ses("ses_pompa", { volume: 0.7 });
    let hedef = null, en = 1e9;
    for (const d of this.dusmanlar) {
      if (d.olu) continue;
      const dx = (d.x - r.x) * r.yon;
      const mesafe = dx - d.w / 2 - r.w / 2;
      if (dx > 0 && mesafe < 190 && Math.abs(d.y - r.y) < 70 && mesafe < en && this.gorusVar(r, d)) { en = mesafe; hedef = d; }
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
    d.spr.setTexture(d.tip.ad + "_pop0").setOrigin(0.5, 0.5).setY(d.y - (d.tip.ad === "octo" ? 58 : 70));
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
    if (this.durum === "oyun") {
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
    this.yercekimi(r, dt);

    // Düşme sesi: havadayken çalar, yere değince biter; iniş sesi çalar
    if (!r.yerde) {
      r.havada = (r.havada || 0) + dt;
      if (r.havada > 0.12 && !this.dusmeSes && this.cache.audio.exists("ses_dusme")) {
        try { this.dusmeSes = this.sound.add("ses_dusme", { volume: 0.6 }); this.dusmeSes.play(); } catch (e) { this.dusmeSes = null; }
      }
    } else {
      if ((r.havada || 0) > 0.12) { this.dusmeSesiDurdur(); this.ses("ses_dustu", { volume: 0.8 }); }
      r.havada = 0;
    }

    let yon = 0;
    if (this.tuslar.sol) yon = -1;
    if (this.tuslar.sag) yon = 1;
    r.pompa = Math.max(0, r.pompa - dt);
    if (!r.yerde && yon !== 0) r.yon = yon; // havadayken de basılan yöne bakar

    let tex;
    if (yon !== 0 && r.pompa <= 0 && r.yerde) {
      r.yon = yon;
      const sonuc = this.yatay(r, yon * (r.kazdi ? KAZMA_HIZ : REIS_HIZ) * this.hizCarpan * dt, true);
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
    } else if (r.pompa > 0) {
      tex = this.kareler.reis_pump[Math.floor(zaman / 120) % 2];
    } else {
      tex = "reis_walk0";
    }
    const havada = !r.yerde;
    if (havada) tex = "reis_dus";
    if (r.yerde) { r.sonGuvenliX = r.x; r.sonGuvenliY = r.y; }

    if (this.dokunulmaz > 0) { this.dokunulmaz -= dt; r.spr.setAlpha(Math.floor(zaman / 100) % 2 ? 0.4 : 1); }
    else r.spr.setAlpha(1);

    if (havada) r.spr.setOrigin(0.5, 0.5).setTexture(tex).setFlipX(r.yon > 0).setPosition(r.x, r.y - 58);
    else r.spr.setOrigin(0.5, 1).setTexture(tex).setFlipX(r.yon < 0).setPosition(r.x, r.y);

    // Pompa hortumu: pompanın alt ucundan çıkar, yerde kıvrılarak düşmana gider
    const h = this.pompaHedef;
    if (r.pompa > 0 && h && !h.olu) {
      const sx = r.x + r.yon * 24, sy = r.y - 7;
      const ex = h.x - r.yon * h.w * 0.28, ey = h.y - 14;
      const yer = Math.min(r.y, h.y) - 3;
      const kontrol = new Phaser.Math.Vector2((sx + ex) / 2, Math.min(yer, Math.max(sy, ey) + 10));
      const egri = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(sx, sy), kontrol, new Phaser.Math.Vector2(ex, ey));
      const nok = egri.getPoints(20);
      // 3D boru: kontur, gövde, alt gölge, üst parlama
      const kay = (dy) => nok.map((p) => new Phaser.Math.Vector2(p.x, p.y + dy));
      const hg = this.hortum;
      // hortum: pompa butonundaki koyu kömür grisi (ince)
      hg.lineStyle(4, 0x0e0d0d, 1).strokePoints(nok);
      hg.lineStyle(2.8, 0x383634, 1).strokePoints(nok);
      hg.lineStyle(1.2, 0x1e1d1c, 1).strokePoints(kay(0.8));
      hg.lineStyle(0.9, 0x6f6b67, 1).strokePoints(kay(-0.6));
      hg.lineStyle(0.6, 0xa29d97, 0.7).strokePoints(kay(-0.9));
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
      this.yercekimi(d, dt);

      // kumun altında kaldı mı
      const b = this.govde(d);
      let dolu = 0, top = 0;
      for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) { top++; if (this.hucre(x, y) === KUM) dolu++; }
      if (top && dolu / top > 0.45) { this.patlat(d, 300); continue; }

      if (d.y > ALT + 100) { d.olu = true; d.spr.destroy(); this.puanEkle(150, d.x, ALT); continue; }

      // sönme: pompalama bıraktıktan 0,5 sn sonra başlar, sonra hızlıca (0,35 sn'de bir kademe) söner
      if (d.sisme > 0 && zaman - d.sonPompa > 500 && zaman - (d.sonSonme || 0) > 350) { d.sisme--; d.sonSonme = zaman; this.ses("ses_sonme", { volume: 0.6 }); }

      if (d.sisme > 0) {
        d.spr.setTexture(d.tip.ad + "_pump" + Math.min(3, d.sisme)).setPosition(d.x, d.y);
        continue;
      }

      if (Math.abs(r.y - d.y) < 70 && Math.abs(r.x - d.x) < 420 && !r.olu) d.yon = Math.sign(r.x - d.x) || d.yon;

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
