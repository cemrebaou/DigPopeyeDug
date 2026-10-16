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
//   T  itilebilen kaya (2x2 kare: iki satır x iki sütun T)
//   A W  yer / tavan dikeni   X N Y Z  testere   S P  sallanan top   (ayrıntı: 36. bölümün üstündeki not)
// Eksik satırlar otomatik kaya ile doldurulur.

const HAVA = "....................";
const ZEMIN = "####################";

window.BOLUMLER = [
  {
    ad: "Bölüm 1",
    ipucu: "Kumu kaz, aşağı atla, kapağı açıp kumu boşluğa dök!",
    harita: [
      "....................",
      ".....dssssssssd.....",
      ".....dssssssssd.....",
      ".R...dssssssssd.....",
      "dddddddddddddddd..dd",
      "dddddddddddddddd..dd",
      "dddddddddddddddd..dd",
      "################..##",
      "#......sssssssss..##",
      "#......sssssssss..##",
      "#......sssssssss..##",
      "#......sssssssss..##",
      "#.c..o.sssssssss..##",
      "##############kk####",
      "##############..####",
      "##############..####",
      "##############..####",
      "##############..####",
      "##############..####",
      "##############..####",
      "##############..####",
      "##############..####",
      "##############..####",
      "##############..####"
    ]
  },
  {
    ad: "Bölüm 2",
    ipucu: "Kapağa dokun, kum aşağıyı doldursun!",
    harita: [
      "....................",
      "....................",
      "....................",
      ".R..................",
      "dddd#ssssssssss#dddd",
      "dddd#ssssssssss#dddd",
      "dddd#ssssssssss#dddd",
      "dddd#ssssssssss#dddd",
      "#####kkkkkkkkkk#####",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#.......c..........#",
      "#############......#",
      "#############......#",
      "#############......#",
      "#############......#",
      "#############.o....#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 3",
    ipucu: "Kapağa dokun, kum aşağı dökülsün; in ve kazarak ahtapota ulaş!",
    harita: [
      "....................",
      "....................",
      "....................",
      ".R...c..............",
      "ddddddd#sss#dddddddd",
      "ddddddd#sss#dddddddd",
      "ddddddd#sss#dddddddd",
      "ddddddd#sss#dddddddd",
      "ddddddd#sss#dddddddd",
      "ddddddd#sss#dddddddd",
      "ddddddd#sss#dddddddd",
      "ddddddd#sss#dddddddd",
      "ddddddd#kkk#dddddddd",
      "dd............d....d",
      "dd............d....d",
      "dd............d....d",
      "dd............d....d",
      "dd............d....d",
      "dd............d....d",
      "dd............d....d",
      "dd............d....d",
      "dd............d.o..d",
      "####################"
    ]
  },
  {
    ad: "Bölüm 4",
    ipucu: "Kapağın üstüne gel, dokun ve aşağı in!",
    harita: [
      "....................",
      "....................",
      "....................",
      ".R..................",
      "dddddddddddddddkkddd",
      "#......sssss......d#",
      "#......sssss......d#",
      "#......sssss......d#",
      "#......sssss......d#",
      "#...c..sssss......d#",
      "#kk#################",
      "#.......ssss.......#",
      "#.......ssss.......#",
      "#.......ssss.......#",
      "#.......ssss.......#",
      "#.......ssss....o..#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 5",
    ipucu: "İki kapağı da aç, sonra aşağı inip kaz!",
    harita: [
      "....................",
      "....................",
      "....................",
      ".R..................",
      "dddd#ssss#dd#ssss#dd",
      "dddd#ssss#dd#ssss#dd",
      "dddd#ssss#dd#ssss#dd",
      "#####kkkk####kkkk###",
      "#.........d........#",
      "#.........d........#",
      "#.........d........#",
      "#.........d........#",
      "#...c.....d.....o..#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 6",
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
    ad: "Bölüm 7",
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
    ad: "Bölüm 8",
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
    ad: "Bölüm 9",
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
    ad: "Bölüm 10",
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
    ad: "Bölüm 11",
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
    ad: "Bölüm 12",
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
    ad: "Bölüm 13",
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
    ad: "Bölüm 14",
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
    ad: "Bölüm 15",
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
    ad: "Bölüm 16",
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
    ad: "Bölüm 17",
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
    ad: "Bölüm 18",
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
    ad: "Bölüm 19",
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
    ad: "Bölüm 20",
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
    ad: "Bölüm 21",
    ipucu: "Pervaneye dokun, rüzgar essin!",
    dusmanYon: -1,
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
    ad: "Bölüm 22",
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
    ad: "Bölüm 23",
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
    ad: "Bölüm 24",
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
    ad: "Bölüm 25",
    ipucu: "Hepsini birden kullan!",
    dusmanYon: -1,
    harita: [
      HAVA, HAVA, HAVA,
      ZEMIN,
      "d..................d",
      "d..................d",
      "d..................d",
      "d..................d",
      "d......>..oc..#....d",
      "###...###kkk##....##",
      "d............#....##",
      "d............#....##",
      "d............#....##",
      "d............#....##",
      "dR..^.......b#....##",
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

// ---- KAYA + ZIPLAMA BÖLÜMLERİ (21-30) ----
// T = itilebilen kaya (2x2 kare). Üstünde 4 T'lik kare yaz: ör. "TT" iki satırda üst üste.
// Kaya yerçekimiyle düşer, Reis yürüyerek iter (iterken kazamaz), önü kum/kaya ise SIKIŞIR.
// Düşen / kayan kaya düşmanı ezer. Rüzgar kayayı iter, yukarı rüzgar kayayı kaldırır (üstüne çıkıp binebilirsin).
// Zıpla: sağdaki yukarı ok butonu (PC: yukarı ok). Yaklaşık 3,5 kare yüksek, 4 kare uzağa atlar.
window.BOLUMLER.push(
  {
    ad: "Bölüm 26",
    ipucu: "Taşı it, düşmanın üstüne düşür!",
    harita: [
      HAVA, HAVA,
      "....TT..............",
      ".R..TT..............",
      "dddddddd..dddddddddd",
      "dddddddd..dddddddddd",
      "dddddddd..dddddddddd",
      "#######....#########",
      "#######....#########",
      "#######....#########",
      "#######.c..#########",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 27",
    ipucu: "Taş toprağa sıkışır: zıpla, önce kaz!",
    harita: [
      HAVA, HAVA,
      "...TT...dd..........",
      "...TT...dd..........",
      "dddddddddd..dddddddd",
      "dddddddddd..dddddddd",
      "dddddddddd..dddddddd",
      "#########....#######",
      "#########....#######",
      "#########....#######",
      "#########.o..#######",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 28",
    ipucu: "Taşı sür, düşmanları ez! Sonra zıpla.",
    harita: [
      HAVA, HAVA,
      "...TT...............",
      ".R.TT..c.....#.o...c",
      "ddddddddd..ddddddddd",
      "ddddddddd..ddddddddd",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 29",
    ipucu: "Kuş altından geçerken taşı düşür!",
    harita: [
      HAVA, HAVA,
      "....TT........TT....",
      ".R..TT........TT....",
      "dddddddd..dddddddddd",
      "dddddddd..dddddddddd",
      "dddddddd..dddddddddd",
      "####..............##",
      "####..............##",
      "####..............##",
      "####..............##",
      "####..........b...##",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 30",
    ipucu: "Pervane taşı iter. Sonra kapat!",
    harita: [
      HAVA, HAVA,
      "....TT..............",
      ".R>.TT........d.o...",
      "dddddddddddd..dddddd",
      "dddddddddddd..dddddd",
      "dddddddddddd..dddddd",
      "###########....#####",
      "###########....#####",
      "###########....#####",
      "###########.c..#####",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 31",
    ipucu: "Taşa çık, pervaneyi aç!",
    harita: [
      HAVA, HAVA, HAVA,
      "...........d.c...o..",
      "#######..###########",
      "#######..###########",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#......TT..........#",
      "#.R....TT..........#",
      "########.###########",
      "#######.^.##########"
    ]
  },
  {
    ad: "Bölüm 32",
    ipucu: "Taşı duvara it, merdiven yap!",
    harita: [
      HAVA, HAVA, HAVA, HAVA, HAVA,
      "..........d..c...o..",
      "..........dddddddddd",
      "..........dddddddddd",
      "....TT....dddddddddd",
      ".R..TT....dddddddddd",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 33",
    ipucu: "Direği aşmak için taşı kullan!",
    harita: [
      HAVA, HAVA, HAVA, HAVA, HAVA,
      "..........dd........",
      "..........dd........",
      "....TT....dd........",
      ".R..TT....dd........",
      "dddddddddddd........",
      "dddddddddddd........",
      "dddddddddddd........",
      "dddddddddddd........",
      "dddddddddddd..c..o..",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 34",
    ipucu: "İki taş, iki çukur. Toprağa dikkat!",
    harita: [
      HAVA, HAVA,
      "...TT.....TT.dd.....",
      "...TT.....TT.dd.....",
      "ddddddd..ddddddd..dd",
      "ddddddd..ddddddd..dd",
      "ddddddd..ddddddd..dd",
      "######....#####....#",
      "######....#####....#",
      "######....#####....#",
      "######.c..#####.o..#",
      ZEMIN
    ]
  },
  {
    ad: "Bölüm 35",
    ipucu: "Köprü kur, kapağı aç, hepsini temizle!",
    harita: [
      HAVA, HAVA,
      "...TT.........TT....",
      ".R.TT.......d.TT.o.b",
      "dddddd.....dddkkdddd",
      "dddddd.....dd....ddd",
      "#############....###",
      "#############....###",
      "#############....###",
      "#############.c.o###",
      ZEMIN
    ]
  }
);

// ---- DİKEN / TESTERE / SALLANAN TOP BÖLÜMLERİ (31-45) ----
// A yer dikeni, W tavan dikeni (sadece Reis'i öldürür; kum veya kaya örterse etkisiz olur).
// X sabit testere (öldürür), N raydaki testere (gidip gelir), Y / Z dokununca sağa / sola fırlayan testere
// (fırlayınca Reis'i ve düşmanları keser, bekleyen testere zararsız).
// S sürekli sallanan dikenli top, P dokununca sallanan top (durağan top zararsız). Zincir boyu bölümün zincir alanı (kare).
window.BOLUMLER.push(
  {
    ad: "Bölüm 36",
    ipucu: "Dikene basma, zıpla!",
    harita: [
      "....................",
      "....................",
      "....................",
      ".R...AA....AA..c..o.",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd"
    ]
  },
  {
    ad: "Bölüm 37",
    ipucu: "Taşı çukura it: dikenler örtülür!",
    harita: [
      "....................",
      "....................",
      "...TT...............",
      ".R.TT.........#..o..",
      "dddddd......dddddddd",
      "ddddddAAAAAAdddddddd",
      "####################"
    ]
  },
  {
    ad: "Bölüm 38",
    ipucu: "Kapağı aç: kum dikenleri örter!",
    harita: [
      "####################",
      "#######sssss########",
      "#######sssss########",
      "#######sssss########",
      "#######kkkkk########",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#.R..........#..o..#",
      "#######.....########",
      "#######AAAAA########",
      "####################"
    ]
  },
  {
    ad: "Bölüm 39",
    ipucu: "Tavan dikenlerinin altından eğilerek geç!",
    harita: [
      ".....#####..........",
      "......WWW...........",
      "....................",
      "....................",
      ".R..........#...o..#",
      "dddddddddddddddddddd"
    ]
  },
  {
    ad: "Bölüm 40",
    ipucu: "Taşla ve kumla iki çukuru da kapat!",
    harita: [
      "####################",
      "##########ss########",
      "##########ss########",
      "##########ss########",
      "##########kk########",
      "...................#",
      "...................#",
      "...................#",
      "...................#",
      "...TT..............#",
      ".R.TT........#.o.b.#",
      "#####....#..########",
      "#####AAAA#AA########",
      "####################"
    ]
  },
  {
    ad: "Bölüm 41",
    ipucu: "Testereye dokun, fırlasın!",
    harita: [
      "....................",
      "....................",
      "....................",
      ".R..................",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "#..................#",
      "#..................#",
      "#..................#",
      "#Y......c....o.....#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 42",
    ipucu: "Testereye dokun, sonra platforma kaç!",
    harita: [
      "####################",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#...ddd............#",
      "#..................#",
      "#R........c...o...Z#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 43",
    ipucu: "Raydaki testere gelince üstünden zıpla!",
    harita: [
      "####################",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#R..dN......d..o...#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 44",
    ipucu: "Havadaki testereye eğil, yerdekine zıpla!",
    harita: [
      "####################",
      "#..................#",
      "#..................#",
      "#..................#",
      "#........X...X.....#",
      "#..................#",
      "#..................#",
      "#R...X..........#.o#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 45",
    ipucu: "Kapağı aç, testereyi fırlat!",
    harita: [
      "....................",
      "....................",
      "....................",
      ".R..................",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "#..................#",
      "#..................#",
      "#..................#",
      "#Y..k....c....o....#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 46",
    ipucu: "Topa dokun, sallansın!",
    zincir: 3.8,
    harita: [
      "....................",
      "....................",
      "....................",
      ".R..................",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "#####....P.....#####",
      "#####..........#####",
      "#####..........#####",
      "#####..........#####",
      "#####..c....o..#####",
      "####################"
    ]
  },
  {
    ad: "Bölüm 47",
    ipucu: "Eğil: sallanan topun altından geç!",
    zincir: 4,
    harita: [
      "####################",
      "#..................#",
      "#......S...........#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#R...........#..o..#",
      "####################"
    ]
  },
  {
    ad: "Bölüm 48",
    ipucu: "Pervane düşmanı topun önüne üfler!",
    zincir: 3.8,
    harita: [
      "....................",
      "....................",
      "....................",
      ".R..................",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "dddddddddddddddddddd",
      "###...........P..###",
      "###..............###",
      "###..............###",
      "###..............###",
      "###>.c.o.........###",
      "####################"
    ]
  },
  {
    ad: "Bölüm 49",
    ipucu: "Eğil, zıpla, sonra topu salla!",
    zincir: 3.8,
    harita: [
      "####################",
      "#..................#",
      "#..................#",
      "#......####........#",
      "#......WWWW........#",
      "#..................#",
      "#..................#",
      "#R.AA........#..o..#",
      "dddddddddddddddddddd",
      "####.....P....######",
      "####..........######",
      "####..........######",
      "####..........######",
      "####..c.......######",
      "####################"
    ]
  },
  {
    ad: "Bölüm 50",
    ipucu: "Büyük final: hepsini birden kullan!",
    zincir: 3.8,
    harita: [
      "####################",
      "##########ss########",
      "##########ss########",
      "##########ss########",
      "##########kk########",
      "...................#",
      "...................#",
      "...................#",
      "...................#",
      "...TT..............#",
      ".R.TT........#..o..#",
      "#####....#..########",
      "#####AAAA#AA########",
      "####################",
      "###...........P..###",
      "###..............###",
      "###..............###",
      "###..............###",
      "###>.c.o.........###",
      "####################"
    ]
  }
);

// 51. BÖLÜM (zor, sıralama bulmacası). Reis kapalı odada bekler; her şey dokunarak çözülür.
//  - Tüneldeki testere (Y) ahtapotu ancak önündeki kaya kalkınca keser; kayaya çarparsa biter (geri dönmez).
//  - Kayanın altındaki kapak açılınca kaya kuyuya düşer, aşağıdaki yengeci ezer.
//  - Üstteki kumu (üst kapak) alt kapak kapalıyken dökersen kum yan oluktan tünele akar, testereyi kapatır.
//  Doğru sıra: kaya kapağı -> testere -> alt kapak -> üst kapak (alt kapak üst kapaktan önce açılırsa testere sona da kalabilir).
window.BOLUMLER.push(
  {
    ad: "Bölüm 51",
    ipucu: "Sıra önemli! Yanlış kapak her şeyi bozar.",
    harita: [
      "####################",
      "###ssss###.........#",
      "###ssss###.........#",
      "###ssss###.........#",
      "###ssss###.........#",
      "###kkkk###.........#",
      "###......#.........#",
      "###......#.........#",
      "###......#..R......#",
      "###kkkk#.###########",
      "###....#.###########",
      "###....#.###########",
      "###....#.###########",
      "###....#.###########",
      "###....#.###########",
      "###.c..#.###########",
      "########.###########",
      "#..........TT......#",
      "#Y.........TT...o..#",
      "###########kk#######",
      "###########..#######",
      "##########...#######",
      "##########.c.#######",
      "####################"
    ]
  }
);

// 52. BÖLÜM: Rüzgar Sırası. Kaya, kapalı kapağın üstünden geçip sağdaki kuyuya düşmeli (yengeci ezer).
//  Kapak açıkken kaya itilirse kaya aşağı düşer, yengeç ölmez. Rüzgar açıkken yürüyen Reis kuyuya savrulur.
//  Doğru sıra: heykeli aç (kaya kuyuya) -> heykeli kapat -> kapağın üstüne yürü -> kapağı aç, in, iki düşmanı pompala.
window.BOLUMLER.push(
  {
    ad: "Bölüm 52",
    ipucu: "Önce rüzgar mı, kapak mı? Sıra önemli!",
    harita: [
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      ".....TT.............",
      ".R.>.TT.............",
      "ddddddddddkkddd..ddd",
      "##########..##...###",
      "##########..##...###",
      "##########..##...###",
      "##########..##...###",
      "##########..##.c.###",
      "##########..########",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#.c.....#####.o....#",
      "####################"
    ]
  }
);

// 53. BÖLÜM: Taş Köprü. Kaya köprü kapağının üstünde. Reis kayayı köprünün ucuna kadar itip üstüne zıplamalı,
//  kayanın üstünden yürüyüp karşıya inmeli (2 karelik kayanın üstünden tek zıplamada geçilemez),
//  sonra köprüyü açmalı (kaya düşüp aşağıdaki yengeci ezer). Köprü erken açılırsa Reis karşıya geçemez.
//  Kaya köprüden fazla itilirse aşağı iner, yengeç ölmez.
window.BOLUMLER.push(
  {
    ad: "Bölüm 53",
    ipucu: "Köprüden geçmeden açma, kayayı fazla itme!",
    harita: [
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "......TT............",
      ".R....TT............",
      "dddddkkkkkd..ddddddd",
      "#####.....#.......##",
      "#####.....#.......##",
      "#####.....#.......##",
      "#####.....#.......##",
      "#####..c..#...AA.o##",
      "####################"
    ]
  }
);

// 54. BÖLÜM: Testere Sığınağı. Testere tüneli süpürür; Reis'i de keser.
//  Doğru sıra: kayayı SOLA itip soldaki deliğe düşür (testerenin yolu açılır) -> sağdaki derin çukura gir -> eğil
//  -> kapıyı (kapak) aç -> testereyi at. Kaya sağdaki çukura itilirse saklanacak yer kalmaz; testere kayaya çarparsa biter;
//  kapı erken açılırsa düşmanlar Reis'e gelir; ayakta durursa testere Reis'i keser.
window.BOLUMLER.push(
  {
    ad: "Bölüm 54",
    ipucu: "Taşı doğru deliğe it, çukura saklan, eğil, sonra testere!",
    harita: [
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "....................",
      "..R.................",
      "dddddddd..dddddddddd",
      "########..##########",
      "########..##########",
      "########..##########",
      "########..##########",
      "#.............k....#",
      "#.............k....#",
      "#.............k....#",
      "#....TT.......k....#",
      "#Y...TT.......k.c.o#",
      "###..######..#######",
      "###..######..#######",
      "###########..#######",
      "####################"
    ]
  }
);

// 55. BÖLÜM: Rüzgar Asansörü. Heykel yukarı üfler: Reis'i ve kayayı kaldırır. Kuyunun tepesinde tavan dikenleri var.
//  Heykel zeminin altındaki yuvada; rüzgar tek karelik yarıktan çıkar (kaya heykelin üstüne otursa rüzgarı kapatırdı;
//  rüzgar menzili 14 kare olduğu için kuyu kısa tutuldu).
//  Doğru sıra: kayayı sola, yarığın üstüne it -> heykeli aç (kaya tavana çıkar, dikenleri kapatır) -> kuyuya gir
//  (rüzgar Reis'i kayanın altına kadar kaldırır) -> sağa, üst koridora çık (rüzgar kuyunun sağ yarısından çıkar, çıkış o tarafta) -> kapıyı aç, düşmanları pompala.
//  Heykel Reis kuyudayken kapatılırsa kaya üstüne düşer. Kapı erken açılırsa düşmanlar rüzgarla kuyuya girer.
//  Kaya olmasa Reis tavan dikenlerine çarpardı (kaya hep yarığa itildiği için dikenler kayayı çıkarmanın sebebi).
window.BOLUMLER.push(
  {
    ad: "Bölüm 55",
    ipucu: "Asansörden önce tavandaki dikenleri kapat!",
    harita: [
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "######WW############",
      "######..############",
      "######.......k....##",
      "######.......k....##",
      "######.......k....##",
      "######.......k.o.c##",
      "######..############",
      "######..############",
      "######............##",
      "######............##",
      "######............##",
      "######.....TT.....##",
      "######.....TT...R.##",
      "#######.############",
      "#######^############",
      "####################"
    ]
  }
);
