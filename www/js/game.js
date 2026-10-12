// Örnek oyun: düşen yıldızları sepetle yakala, bombalardan kaç.
const W = 720, H = 1280;
const ALT_BOSLUK = 150; // banner reklam için alttaki boş alan

class Oyun extends Phaser.Scene {
  constructor() { super("Oyun"); }

  create() {
    this.cameras.main.setBackgroundColor("#14213d");
    this.skor = 0;
    this.bitti = false;
    this.devamHakki = true;
    this.hiz = 380;
    this.dusenler = [];

    // Arka plan yıldızları
    for (let i = 0; i < 60; i++) {
      this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(1, 3), 0xffffff, 0.35);
    }

    this.sepet = this.add.rectangle(W / 2, H - ALT_BOSLUK - 40, 170, 40, 0xfca311).setStrokeStyle(4, 0xffffff);
    this.skorYazi = this.add.text(30, 40, "Skor: 0", { fontFamily: "Arial", fontSize: "48px", color: "#ffffff", fontStyle: "bold" });

    this.input.on("pointermove", (p) => { if (!this.bitti) this.sepet.x = Phaser.Math.Clamp(p.x, 85, W - 85); });
    this.input.on("pointerdown", (p) => { if (!this.bitti) this.sepet.x = Phaser.Math.Clamp(p.x, 85, W - 85); });

    this.uretici = this.time.addEvent({ delay: 650, loop: true, callback: () => this.nesneUret() });
  }

  nesneUret() {
    if (this.bitti) return;
    const bomba = Math.random() < 0.22;
    const x = Phaser.Math.Between(50, W - 50);
    const n = bomba
      ? this.add.circle(x, -40, 32, 0xe63946).setStrokeStyle(4, 0x000000)
      : this.add.star(x, -40, 5, 18, 40, 0xffd60a);
    n.bomba = bomba;
    this.dusenler.push(n);
  }

  update(_, dt) {
    if (this.bitti) return;
    const s = this.sepet;
    this.dusenler = this.dusenler.filter((n) => {
      n.y += this.hiz * dt / 1000;
      if (!n.bomba) n.rotation += dt / 400;
      const carpti = Math.abs(n.x - s.x) < 110 && Math.abs(n.y - s.y) < 45;
      if (carpti) {
        if (n.bomba) { this.oyunBitti(); }
        else {
          this.skor++;
          this.skorYazi.setText("Skor: " + this.skor);
          this.hiz += 8;
        }
        n.destroy();
        return false;
      }
      if (n.y > H - ALT_BOSLUK + 40) { n.destroy(); return false; }
      return true;
    });
  }

  oyunBitti() {
    this.bitti = true;
    this.uretici.paused = true;
    Ads.oyunBitti();

    const grup = this.add.container(0, 0);
    grup.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7));
    grup.add(this.add.text(W / 2, 400, "Oyun Bitti", { fontFamily: "Arial", fontSize: "80px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5));
    grup.add(this.add.text(W / 2, 510, "Skor: " + this.skor, { fontFamily: "Arial", fontSize: "56px", color: "#fca311" }).setOrigin(0.5));

    grup.add(this.buton(W / 2, 700, "Tekrar Oyna", 0x2a9d8f, () => this.scene.restart()));

    if (this.devamHakki) {
      grup.add(this.buton(W / 2, 850, "▶ Reklam izle, devam et", 0x6a4c93, async () => {
        const izlendi = await Ads.odulluIzle();
        if (!izlendi) return;
        this.devamHakki = false;
        this.dusenler.forEach((n) => n.destroy());
        this.dusenler = [];
        grup.destroy();
        this.bitti = false;
        this.uretici.paused = false;
      }));
    }
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

new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: "oyun",
  backgroundColor: "#14213d",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Oyun]
});

Ads.baslat();
