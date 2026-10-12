// DigPopeyeDug - kum fizikli kazı oyunu
const W = 720, H = 1280;
const C = 6;                 // bir kum tanesi = 6 piksel
const HARITA_KARE = 6;       // haritadaki bir karakter = 6x6 kum tanesi (36px)
const SUTUN = 20, SATIR = 24; // harita boyutu
const KARE_PX = HARITA_KARE * C; // 36
const GX = SUTUN * HARITA_KARE; // 120
const GY = SATIR * HARITA_KARE; // 144
const OY = 130;              // oyun alanının ekrandaki üst kenarı
const ALT = OY + GY * C;     // 994
const KONTROL_Y = 1062;      // butonların ortası (altındaki 150px banner reklam için boş)

const BOS = 0, KUM = 1, KAYA = 2, KAPAK = 3, TOPRAK = 4;

const REIS_OLCEK = 0.585, DUSMAN_OLCEK = 0.63;
const YERCEKIMI = 1400, MAX_DUSME = 700;
const REIS_HIZ = 200, KAZMA_HIZ = 110;

const SPRITELAR = [
  ...[0, 1, 2, 3, 4, 5].map((i) => "reis_walk" + i),
  "reis_pump0", "reis_pump1",
  ...[0, 1, 2, 3].map((i) => "reis_fall" + i),
  ...[0, 1, 2, 3, 4].map((i) => "crab_walk" + i),
  ...[0, 1, 2, 3].map((i) => "crab_pump" + i), "crab_pop0",
  ...[0, 1, 2].map((i) => "octo_walk" + i),
  ...[0, 1, 2, 3].map((i) => "octo_pump" + i), "octo_pop0"
];

const DUSMAN_TIP = {
  c: { ad: "crab", hiz: 65, w: 81, h: 63 },
  o: { ad: "octo", hiz: 48, w: 99, h: 66 }
};

function kayitOku(k, v) { try { const x = localStorage.getItem(k); return x === null ? v : JSON.parse(x); } catch (e) { return v; } }
function kayitYaz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

class Oyun extends Phaser.Scene {
  constructor() { super("Oyun"); }

  init(data) {
    this.bolum = data && data.bolum !== undefined ? data.bolum : kayitOku("dpd_bolum", 0);
    if (this.bolum >= BOLUMLER.length) this.bolum = 0;
    this.skor = data && data.skor ? data.skor : 0;
  }

  preload() {
    SPRITELAR.forEach((k) => this.load.image(k, "assets/" + k + ".png"));
  }

  create() {
    this.durum = "oyun";
    this.kare = 0;
    this.tuslar = { sol: false, sag: false };
    this.devamHakki = true;
    this.dokunulmaz = 0;

    this.animasyonlar();
    this.arkaPlan();
    this.haritaYukle(BOLUMLER[this.bolum]);

    // Kum dokusu
    this.kumTex = this.textures.createCanvas("kum" + Date.now(), GX, GY);
    this.kumTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.kumImg = this.add.image(0, OY, this.kumTex.key).setOrigin(0).setScale(C).setDepth(1);
    this.imgData = this.kumTex.context.createImageData(GX, GY);

    this.kapakCizim = this.add.graphics().setDepth(2);
    this.hortum = this.add.graphics().setDepth(4);

    // Reis
    this.reis.spr = this.add.image(this.reis.x, this.reis.y, "reis_walk0").setOrigin(0.5, 1).setScale(REIS_OLCEK).setDepth(5);
    this.dusmanlar.forEach((d) => {
      d.spr = this.add.image(d.x, d.y, d.tip.ad + "_walk0").setOrigin(0.5, 1).setScale(DUSMAN_OLCEK).setDepth(3);
    });

    this.arayuz();
    this.kontroller();
    this.kumCiz();
  }

  animasyonlar() {
    this.kareler = {
      reis_walk: [0, 1, 2, 3, 4, 5].map((i) => "reis_walk" + i),
      reis_fall: [0, 1, 2, 3].map((i) => "reis_fall" + i),
      reis_pump: ["reis_pump0", "reis_pump1"],
      crab_walk: [0, 1, 2, 3, 4].map((i) => "crab_walk" + i),
      octo_walk: [0, 1, 2].map((i) => "octo_walk" + i)
    };
  }

  arkaPlan() {
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x6ec6ff, 0x6ec6ff, 0xbfe9ff, 0xbfe9ff, 1);
    g.fillRect(0, 0, W, ALT);
    g.fillStyle(0x2b1d12, 1);
    g.fillRect(0, ALT, W, H - ALT);
    this.arkaG = g;
  }

  haritaYukle(bolum) {
    this.g = new Uint8Array(GX * GY);
    this.ton = new Uint8Array(GX * GY);
    this.engel = new Uint8Array(GX * GY);
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
          this.ton[i] = (Math.random() * 255) | 0;
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
    const st = { fontFamily: "Arial", fontSize: "40px", color: "#ffffff", fontStyle: "bold", stroke: "#000000", strokeThickness: 6 };
    this.bolumYazi = this.add.text(24, 30, BOLUMLER[this.bolum].ad, st).setDepth(10);
    this.skorYazi = this.add.text(W - 24, 30, "Skor: " + this.skor, st).setOrigin(1, 0).setDepth(10);
    this.ipucu = this.add.text(W / 2, 90, "Kapaklara dokun, açılsın!", { ...st, fontSize: "28px", color: "#ffe08a" }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: this.ipucu, alpha: 0, delay: 4000, duration: 800 });
  }

  kontroller() {
    this.input.addPointer(3);
    const buton = (x, yazi, w, renk, bas, birak) => {
      const r = this.add.rectangle(x, KONTROL_Y, w, 100, renk, 0.9).setStrokeStyle(4, 0xffffff).setDepth(20).setInteractive();
      this.add.text(x, KONTROL_Y, yazi, { fontFamily: "Arial", fontSize: "44px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(21);
      r.on("pointerdown", bas);
      if (birak) { r.on("pointerup", birak); r.on("pointerout", birak); }
      return r;
    };
    buton(95, "◀", 150, 0x264653, () => (this.tuslar.sol = true), () => (this.tuslar.sol = false));
    buton(265, "▶", 150, 0x264653, () => (this.tuslar.sag = true), () => (this.tuslar.sag = false));
    buton(585, "POMPA", 230, 0xc1121f, () => this.pompala());

    // Kapaklara dokunma
    this.input.on("pointerdown", (p) => {
      if (this.durum !== "oyun" || p.y < OY || p.y >= ALT) return;
      const gx = Math.floor(p.x / C), gy = Math.floor((p.y - OY) / C);
      // parmak hassasiyeti: 4 kare çevresine bak
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
      this.g[i] = BOS; n++;
      yigin.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    if (n) this.cameras.main.shake(120, 0.004);
  }

  // ---------- Izgara yardımcıları ----------
  hucre(x, y) {
    if (x < 0 || x >= GX) return KAYA;
    if (y < 0) return BOS;
    if (y >= GY) return KAYA;
    return this.g[y * GX + x];
  }
  katiMi(x, y) { return this.hucre(x, y) !== BOS; }

  // Varlığın gövdesinin kapladığı sütun/satır aralığı
  govde(e, ox = 0, oy = 0) {
    return {
      x0: Math.floor((e.x + ox - e.w / 2) / C),
      x1: Math.floor((e.x + ox + e.w / 2 - 1) / C),
      y0: Math.floor((e.y + oy - e.h - OY) / C),
      y1: Math.floor((e.y + oy - 1 - OY) / C)
    };
  }

  // Ayak altında zemin var mı
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
    let kazdi = false;
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
        return { durdu: true, kazdi };
      }
      for (const y of kazilacak) { this.g[y * GX + sx] = BOS; kazdi = true; }
      e.x += d; kalan -= 1;
    }
    return { durdu: false, kazdi };
  }

  // ---------- Kum fiziği ----------
  kumAdim() {
    const g = this.g, ton = this.ton, eng = this.engel;
    eng.fill(0);
    if (!this.reis.olu) {
      const b = this.govde(this.reis);
      for (let y = Math.max(0, b.y0); y <= Math.min(GY - 1, b.y1); y++)
        for (let x = Math.max(0, b.x0); x <= Math.min(GX - 1, b.x1); x++) eng[y * GX + x] = 1;
    }
    const sagdan = (this.kare & 1) === 1;
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
          g[hedef] = KUM; ton[hedef] = ton[i];
          g[i] = BOS;
        }
      }
    }
  }

  kumCiz() {
    const d = this.imgData.data, g = this.g, ton = this.ton, mg = this.magara;
    for (let i = 0; i < GX * GY; i++) {
      const p = i * 4, t = ton[i] / 255;
      let r = 0, gg = 0, b = 0, a = 255;
      switch (g[i]) {
        case KUM: r = 230 - t * 30; gg = 190 - t * 30; b = 110 - t * 25; break;
        case TOPRAK: r = 150 - t * 25; gg = 98 - t * 18; b = 52 - t * 12; break;
        case KAYA: { const v = 85 - t * 25; r = v; gg = v * 0.92; b = v * 0.85; break; }
        case KAPAK: {
          const y = Math.floor(i / GX);
          const cizgi = y % 4 === 0;
          r = cizgi ? 90 : 160 - t * 15; gg = cizgi ? 55 : 105 - t * 10; b = cizgi ? 25 : 45; break;
        }
        default:
          if (mg[i]) { r = 55; gg = 38; b = 25; } else a = 0;
      }
      d[p] = r; d[p + 1] = gg; d[p + 2] = b; d[p + 3] = a;
    }
    this.kumTex.context.putImageData(this.imgData, 0, 0);
    this.kumTex.refresh();
  }

  // ---------- Pompa ----------
  pompala() {
    if (this.durum !== "oyun" || this.reis.olu) return;
    const r = this.reis;
    r.pompa = 0.35;
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
    if (hedef.sisme >= 4) this.patlat(hedef, 200);
  }

  // Reis ile düşman arasında kazılmamış bir şey var mı
  gorusVar(r, d) {
    const y = Math.floor((Math.min(r.y, d.y) - 25 - OY) / C);
    const x0 = Math.floor(Math.min(r.x, d.x) / C), x1 = Math.floor(Math.max(r.x, d.x) / C);
    for (let x = x0; x <= x1; x++) if (this.katiMi(x, y)) return false;
    return true;
  }

  patlat(d, puan) {
    d.olu = true;
    d.spr.setTexture(d.tip.ad + "_pop0").setOrigin(0.5, 0.7);
    this.tweens.add({ targets: d.spr, alpha: 0, scale: DUSMAN_OLCEK * 1.3, duration: 600, delay: 150, onComplete: () => d.spr.destroy() });
    this.puanEkle(puan, d.x, d.y - d.h);
    this.cameras.main.shake(100, 0.005);
  }

  puanEkle(p, x, y) {
    this.skor += p;
    this.skorYazi.setText("Skor: " + this.skor);
    const t = this.add.text(x, y, "+" + p, { fontFamily: "Arial", fontSize: "36px", color: "#ffe066", fontStyle: "bold", stroke: "#000", strokeThickness: 5 }).setOrigin(0.5).setDepth(15);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  // ---------- Döngü ----------
  update(zaman, dtMs) {
    const simdi = performance.now();
    const dt = Math.min(this.sonZaman ? (simdi - this.sonZaman) / 1000 : 0.016, 0.05);
    this.sonZaman = simdi;
    this.kare++;
    this.kumAdim();
    this.kumCiz();
    this.kapakVurgu(zaman);
    if (this.durum === "oyun") {
      this.reisGuncelle(dt, zaman);
      this.dusmanGuncelle(dt, zaman);
      this.kontrolEt();
    } else if (this.durum === "olum") {
      this.reisGuncelle(dt, zaman);
    }
  }

  kapakVurgu(zaman) {
    const g = this.kapakCizim;
    g.clear();
    const a = 0.45 + 0.35 * Math.sin(zaman / 250);
    g.lineStyle(3, 0xffe066, a);
    // kapak hücrelerinin kenarlarını çiz
    for (let y = 0; y < GY; y += 1) for (let x = 0; x < GX; x++) {
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

    let yon = 0;
    if (this.tuslar.sol) yon = -1;
    if (this.tuslar.sag) yon = 1;
    r.pompa = Math.max(0, r.pompa - dt);

    let tex;
    if (yon !== 0 && r.pompa <= 0 && r.yerde) {
      r.yon = yon;
      const sonuc = this.yatay(r, yon * (r.kazdi ? KAZMA_HIZ : REIS_HIZ) * dt, true);
      r.kazdi = sonuc.kazdi;
      r.kare += dt * (r.kazdi ? 8 : 12);
      tex = this.kareler.reis_walk[Math.floor(r.kare) % 6];
    } else if (r.pompa > 0) {
      tex = this.kareler.reis_pump[Math.floor(zaman / 120) % 2];
    } else {
      tex = "reis_walk0";
    }
    if (!r.yerde) tex = "reis_fall2";

    if (this.dokunulmaz > 0) { this.dokunulmaz -= dt; r.spr.setAlpha(Math.floor(zaman / 100) % 2 ? 0.4 : 1); }
    else r.spr.setAlpha(1);

    r.spr.setTexture(tex).setFlipX(r.yon < 0).setPosition(r.x, r.y);

    // pompa hortumu
    const h = this.pompaHedef;
    if (r.pompa > 0 && h && !h.olu) {
      this.hortum.lineStyle(5, 0xc1121f, 1);
      this.hortum.lineBetween(r.x + r.yon * 27, r.y - 60, h.x, h.y - h.h / 2);
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

      // ekrandan aşağı düştü
      if (d.y > ALT + 100) { d.olu = true; d.spr.destroy(); this.puanEkle(150, d.x, ALT); continue; }

      // sönme
      if (d.sisme > 0 && zaman - d.sonPompa > 1500) { d.sisme--; d.sonPompa = zaman; }

      if (d.sisme > 0) {
        d.spr.setTexture(d.tip.ad + "_pump" + Math.min(3, d.sisme)).setPosition(d.x, d.y);
        continue;
      }

      // Reis yakındaysa ona doğru git
      if (Math.abs(r.y - d.y) < 70 && Math.abs(r.x - d.x) < 420 && !r.olu) d.yon = Math.sign(r.x - d.x) || d.yon;

      if (d.yerde) {
        const s = this.yatay(d, d.yon * d.tip.hiz * dt, false);
        if (s.durdu) d.yon *= -1;
      }
      d.kare += dt * 8;
      const kr = this.kareler[d.tip.ad + "_walk"];
      d.spr.setTexture(kr[Math.floor(d.kare) % kr.length]).setFlipX(d.yon < 0).setPosition(d.x, d.y);
    }
  }

  kontrolEt() {
    const r = this.reis;
    // Reis kumun altında kaldı mı / ekrandan düştü mü
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
    this.time.delayedCall(1200, () => this.bitisEkrani(false));
  }

  bolumBitti() {
    if (this.durum !== "oyun") return;
    this.durum = "kazandi";
    kayitYaz("dpd_bolum", this.bolum + 1);
    this.time.delayedCall(700, () => this.bitisEkrani(true));
  }

  bitisEkrani(kazandi) {
    Ads.oyunBitti();
    const grup = this.add.container(0, 0).setDepth(50);
    grup.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setInteractive());
    const st = { fontFamily: "Arial", fontSize: "72px", color: "#ffffff", fontStyle: "bold" };
    grup.add(this.add.text(W / 2, 380, kazandi ? "Bölüm Tamam!" : "Yakalandın!", st).setOrigin(0.5));
    grup.add(this.add.text(W / 2, 480, "Skor: " + this.skor, { ...st, fontSize: "52px", color: "#fca311" }).setOrigin(0.5));

    if (kazandi) {
      const son = this.bolum + 1 >= BOLUMLER.length;
      grup.add(this.buton(W / 2, 660, son ? "Baştan Başla" : "Sonraki Bölüm", 0x2a9d8f, () =>
        this.scene.restart({ bolum: son ? 0 : this.bolum + 1, skor: this.skor })));
    } else {
      grup.add(this.buton(W / 2, 660, "Tekrar Dene", 0x2a9d8f, () => this.scene.restart({ bolum: this.bolum, skor: 0 })));
      if (this.devamHakki) {
        grup.add(this.buton(W / 2, 810, "▶ Reklam izle, devam et", 0x6a4c93, async () => {
          const izlendi = await Ads.odulluIzle();
          if (!izlendi) return;
          this.devamHakki = false;
          grup.destroy();
          this.dirilt();
        }));
      }
    }
  }

  dirilt() {
    const r = this.reis;
    r.olu = false; r.vy = 0;
    if (r.y > ALT) { r.y = r.sonGuvenliY || OY + 120; r.x = r.sonGuvenliX || 60; }
    this.dokunulmaz = 2.5;
    this.durum = "oyun";
  }

  buton(x, y, yazi, renk, tik) {
    const c = this.add.container(x, y);
    const arka = this.add.rectangle(0, 0, 560, 110, renk).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true });
    const t = this.add.text(0, 0, yazi, { fontFamily: "Arial", fontSize: "40px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
    arka.on("pointerdown", tik);
    c.add([arka, t]);
    return c;
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
