// BÖLÜMLER
// Her bölüm 20 sütun x 24 satır. Bir karakter = 36x36 piksel.
//   .  boşluk
//   d  toprak  (Reis kazar, düşmez)
//   s  kum     (Reis kazar, fizikle akar/düşer, düşmanları gömer)
//   #  kaya    (kazılamaz)
//   k  kapak   (ekrana dokununca açılır)
//   R  Reis başlangıcı (ayakları bu karenin altında)
//   c  yengeç
//   o  ahtapot
//   b  uçan kuş (eğilerek altından geç)
//   > < ^ v  pervane (sağa/sola/yukarı/aşağı rüzgar)
// Eksik satırlar otomatik kaya ile doldurulur.

const HAVA = "....................";
const ZEMIN = "####################";

window.BOLUMLER = [
  {
    ad: "Bölüm 1",
    harita: [
      HAVA, HAVA, HAVA,
      ".R..................",
      "dddddddssssddddd..dd",
      "dddddddssssddddd..dd",
      "dddddddssssddddd..dd",
      "#######kkkk#####..##",
      "dd............dd..dd",
      "dd............dd..dd",
      "dd............dd..dd",
      "dd.....c......dd..dd",
      "###kkk##############",
      "ddd...dddddddddddddd",
      "d..................d",
      "d..................d",
      "d..................d",
      "d.............o....d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 2",
    harita: [
      HAVA, HAVA, HAVA,
      "...................R",
      "dsssssddddsssssd..dd",
      "dsssssddddsssssd..dd",
      "dsssssddddsssssd..dd",
      "#kkkkk####kkkkk#..##",
      "d.................dd",
      "d.................dd",
      "d.................dd",
      "d..c........c.....dd",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 3",
    harita: [
      HAVA, HAVA, HAVA,
      ".R..................",
      "dddddddd..dddddddddd",
      "dddddddd..dddddddddd",
      "dddddddd..dddddddddd",
      "########..##########",
      "d..................d",
      "d..................d",
      "d..................d",
      "d..c............o..d",
      "#############kkk####",
      "ddddddddddddd...dddd",
      "dssssssssdddd...dddd",
      "dssssssssdddd...dddd",
      "#kkkkkkkk####...####",
      "d..................d",
      "d..................d",
      "d..................d",
      "d...c....o.........d",
      ZEMIN
    ]
  }
];

window.BOLUMLER.push(
  {
    ad: "Bölüm 4",
    harita: [
      HAVA, HAVA, HAVA,
      "R...................",
      "dddssssddddddd..dddd",
      "dddssssddddddd..dddd",
      "dddssssddddddd..dddd",
      "###kkkk#######..####",
      "d..................d",
      "d..................d",
      "d.......ssss.......d",
      "d.......ssss.....c.d",
      "########kkkk########",
      "d..................d",
      "d..................d",
      "d..................d",
      "d.......o..........d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 5",
    harita: [
      HAVA, HAVA, HAVA,
      ".R..................",
      "dddddddddddddddd..dd",
      "dddddddddddddddd..dd",
      "dddddddddddddddd..dd",
      "################..##",
      "d....dd....dd......d",
      "d....dd....dd......d",
      "d....dd....dd......d",
      "d.c..dd.o..ddc.....d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 6",
    harita: [
      HAVA, HAVA, HAVA,
      "R...................",
      "dsssdddsssdddsssdd..",
      "dsssdddsssdddsssdd..",
      "dsssdddsssdddsssdd..",
      "#kkk###kkk###kkk##..",
      "d..................d",
      "d..................d",
      "d..................d",
      "d.c.....o.....c....d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 7",
    harita: [
      HAVA, HAVA, HAVA,
      "R...................",
      "dddddddddddddddd..dd",
      "dddddddddddddddd..dd",
      "dddddddddddddddd..dd",
      "################..##",
      "d..................d",
      "d..................d",
      "d..................d",
      "d........c.........d",
      "##..################",
      "d..................d",
      "d..................d",
      "d..................d",
      "d........o.........d",
      "##############..####",
      "d..................d",
      "d..................d",
      "d..................d",
      "d...c...........o..d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 8",
    harita: [
      HAVA, HAVA, HAVA,
      ".R..................",
      "dddddddddddd..dddddd",
      "dddddddddddd..dddddd",
      "dddddddddddd..dddddd",
      "############..######",
      "d..................d",
      "d..................d",
      "d..sssss......sssssd",
      "d..sssss.c....sssssd",
      "###kkkkk######kkkkk#",
      "d..................d",
      "d..................d",
      "d..................d",
      "d....o.........c...d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 9",
    harita: [
      HAVA, HAVA, HAVA,
      ".R..................",
      "dddssssddddddddddd..",
      "dddssssddddddddddd..",
      "dddssssddddddddddd..",
      "###kkkk###########..",
      "d......dd.....dd....",
      "d......dd.....dd....",
      "d......dd.....dd....",
      "d.c..c.dd..o..dd....",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 10",
    harita: [
      HAVA, HAVA, HAVA,
      "...................R",
      "dd..dsssdddddddsssdd",
      "dd..dsssdddddddsssdd",
      "dd..dsssdddddddsssdd",
      "##..#kkk#######kkk##",
      "d..................d",
      "d..................d",
      "d.........ssss.....d",
      "d......c..ssss..c..d",
      "##########kkkk######",
      "d.....dd...........d",
      "d.....dd...........d",
      "d.....dd...........d",
      "d.c...dd...o....o..d",
      ZEMIN
    ]
  }
);

// ---- KUŞ BÖLÜMLERİ (11-15) ----
// b = uçan kuş. Zeminden 110 px yukarıda uçar: ayakta yürürsen kafana çarpar, EĞİLİNCE altından geçersin.
// Kuş koridorları 5 satır yüksek. Asılı kaya blokları (##) altında 3 satırlık alçak tünel bırakır:
// kuş giremez, eğilen Reis girer (tünelde ayağa kalkılamaz, eğikken kazılmaz).
window.BOLUMLER.push(
  {
    ad: "Bölüm 11",
    harita: [
      HAVA, HAVA, HAVA,
      ".R..................",
      "dddddddssssdddd..ddd",
      "dddddddssssdddd..ddd",
      "dddddddssssdddd..ddd",
      "#######kkkk####..###",
      "d..................d",
      "d..................d",
      "d..................d",
      "d..................d",
      "d...b..............d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 12",
    harita: [
      HAVA, HAVA, HAVA,
      "R...................",
      "dddddsssdddddddd..dd",
      "dddddsssdddddddd..dd",
      "dddddsssdddddddd..dd",
      "#####kkk########..##",
      "d..................d",
      "d..................d",
      "d..................d",
      "d..................d",
      "d..........b.......d",
      "##..################",
      "d..................d",
      "d..................d",
      "d..................d",
      "d.......c..........d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 13",
    harita: [
      HAVA, HAVA, HAVA,
      "R...................",
      "dddd..dddddssssddddd",
      "dddd..dddddssssddddd",
      "dddd..dddddssssddddd",
      "####..#####kkkk#####",
      "d......##..........d",
      "d......##..........d",
      "d..................d",
      "d..................d",
      "dc.............b...d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 14",
    harita: [
      HAVA, HAVA, HAVA,
      ".................R..",
      "dddddddddd..dssssddd",
      "dddddddddd..dssssddd",
      "dddddddddd..dssssddd",
      "##########..#kkkk###",
      "d.....##...........d",
      "d.....##...........d",
      "d..................d",
      "d..................d",
      "d..b..........b....d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 15",
    harita: [
      HAVA, HAVA, HAVA,
      "R...................",
      "d..ddddssssddddddddd",
      "d..ddddssssddddddddd",
      "d..ddddssssddddddddd",
      "#..####kkkk#########",
      "d...##......##.....d",
      "d...##......##.....d",
      "d..................d",
      "d..................d",
      "d........b......b..d",
      "################..##",
      "d..................d",
      "d..................d",
      "d..................d",
      "d..o.....c.........d",
      ZEMIN
    ]
  }
);

// ---- RÜZGAR BÖLÜMLERİ (16-20) ----
// > < ^ v = pervane (sağa / sola / yukarı / aşağı üfler). Başta KAPALI, dokununca açılır/kapanır.
// Rüzgar Reis'i, düşmanları ve kumu iter. Pervanenin yüksekliği, hangi boydaki şeyleri etkileyeceğini belirler:
// zemindeki pervane yürüyenleri (Reis, yengeç, ahtapot) ve kumu iter, kuş daha yukarıdan uçtuğu için etkilenmez.
window.BOLUMLER.push(
  {
    ad: "Bölüm 16",
    ipucu: "Pervaneye dokun, rüzgar essin!",
    harita: [
      HAVA, HAVA, HAVA,
      "........R...........",
      "d..ddddddddddddddddd",
      "d..ddddddddddddddddd",
      "d..ddddddddddddddddd",
      "#..#################",
      "d..................d",
      "d..................d",
      "d..................d",
      "d....>.....c.......d",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#",
      "###############....#"
    ]
  },
  {
    ad: "Bölüm 17",
    ipucu: "Pervanenin üstüne dur, yukarı süzül!",
    harita: [
      HAVA, HAVA, HAVA,
      ZEMIN,
      "d..................d",
      "d..................d",
      "d..................d",
      "d..................d",
      "d..o...........b...d",
      "########...#########",
      "d..................d",
      "d..................d",
      "d..................d",
      "d........^..R.....cd",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 18",
    ipucu: "Pervane kumu savurur, çukura döker!",
    harita: [
      HAVA, HAVA, HAVA,
      ZEMIN,
      "d.....sssssss......d",
      "d.....sssssss......d",
      "d.....sssssss......d",
      "dR.>..sssssss......d",
      "#############...####",
      "############......##",
      "############......##",
      "############......##",
      "############.c..o.##",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 19",
    ipucu: "Kapak + rüzgar + kuş: dikkat!",
    harita: [
      HAVA, HAVA, HAVA,
      "..........R.........",
      "d..dddddddsssssddddd",
      "d..dddddddsssssddddd",
      "d..dddddddsssssddddd",
      "#..#######kkkkk#####",
      "d..................d",
      "d..................d",
      "d..................d",
      "d..................d",
      "d....>..c...b..o...d",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 20",
    ipucu: "Hepsini birden kullan!",
    harita: [
      HAVA, HAVA, HAVA,
      ZEMIN,
      "d..................d",
      "d..................d",
      "d..................d",
      "d..................d",
      "d......>.sssco.....d",
      "###...###kkk##....##",
      "d............#....##",
      "d............#....##",
      "d............#....##",
      "d............#....##",
      "d...^..R....b#....##",
      "##############....##",
      "##############....##",
      "##############....##",
      "##############....##",
      "##############....##",
      "##############....##",
      "##############....##",
      "##############....##",
      "##############....##"
    ]
  }
);
