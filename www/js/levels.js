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
    ipucu: { tr: "Aşağı kaz, düşmanları pompala!", en: "Dig down, then pump the enemies!" },
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
    ipucu: { tr: "Kapağa dokun, kum aşağıyı doldursun!", en: "Tap the hatch to fill the gap below with sand!" },
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
    ipucu: { tr: "Kapağa dokun, kum aşağı dökülsün; in ve kazarak ahtapota ulaş!", en: "Tap the hatch to drop the sand, then dig down to the octopus!" },
    harita: [
      "....................",
      "....................",
      "....................",
      ".R..............c...",
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
    ipucu: { tr: "Kapağın üstüne gel, dokun ve aşağı in!", en: "Stand on the hatch, tap it and go down!" },
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
    ipucu: { tr: "İki kapağı da aç, sonra aşağı inip kaz!", en: "Open both hatches, then go down and dig!" },
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
    ipucu: { tr: "Kumu kaz, aşağı atla, kapağı açıp kumu boşluğa dök!", en: "Dig the sand, jump down, open the hatch and pour sand into the gap!" },
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
    ipucu: { tr: "Pervaneye dokun, rüzgar essin!", en: "Tap the statue to blow wind!" },
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
    ipucu: { tr: "Pervanenin üstüne dur, yukarı süzül!", en: "Stand on the statue and float up!" },
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
    ipucu: { tr: "Pervane kumu savurur, çukura döker!", en: "The wind blows the sand into the pit!" },
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
    ipucu: { tr: "Kapak + rüzgar + kuş: dikkat!", en: "Hatch + wind + bird: careful!" },
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
    ipucu: { tr: "Hepsini birden kullan!", en: "Use everything at once!" },
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
    ipucu: { tr: "Taşı it, düşmanın üstüne düşür!", en: "Push the rock onto the enemy!" },
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
    ipucu: { tr: "Taş toprağa sıkışır: zıpla, önce kaz!", en: "The rock jams in the soil: jump, dig first!" },
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
    ipucu: { tr: "Taşı sür, düşmanları ez! Sonra zıpla.", en: "Push the rock, crush the enemies! Then jump." },
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
    ipucu: { tr: "Kuş altından geçerken taşı düşür!", en: "Drop the rock as the bird passes under!" },
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
    ipucu: { tr: "Pervane taşı iter. Sonra kapat!", en: "The wind pushes the rock. Then switch it off!" },
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
    ipucu: { tr: "Taşa çık, pervaneyi aç!", en: "Climb the rock, turn on the statue!" },
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
    ipucu: { tr: "Taşı duvara it, merdiven yap!", en: "Push the rock to the wall, make a stair!" },
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
    ipucu: { tr: "Direği aşmak için taşı kullan!", en: "Use the rock to get over the pillar!" },
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
    ipucu: { tr: "İki taş, iki çukur. Toprağa dikkat!", en: "Two rocks, two pits. Watch the soil!" },
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
    ipucu: { tr: "Köprü kur, kapağı aç, hepsini temizle!", en: "Build a bridge, open the hatch, clear them all!" },
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
    ipucu: { tr: "Dikene basma, zıpla!", en: "Don't step on spikes, jump!" },
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
    ipucu: { tr: "Taşı çukura it: dikenler örtülür!", en: "Push the rock into the pit: spikes get covered!" },
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
    ipucu: { tr: "Kapağı aç: kum dikenleri örter!", en: "Open the hatch: sand covers the spikes!" },
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
    ipucu: { tr: "Tavan dikenlerinin altından eğilerek geç!", en: "Crouch under the ceiling spikes!" },
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
    ipucu: { tr: "Taşla ve kumla iki çukuru da kapat!", en: "Fill both pits with rock and sand!" },
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
    ipucu: { tr: "Testereye dokun, fırlasın!", en: "Tap the saw to launch it!" },
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
    ipucu: { tr: "Testereye dokun, sonra platforma kaç!", en: "Tap the saw, then run to the platform!" },
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
    ipucu: { tr: "Raydaki testere gelince üstünden zıpla!", en: "Jump over the saw on the rail!" },
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
    ipucu: { tr: "Havadaki testereye eğil, yerdekine zıpla!", en: "Crouch for the high saw, jump the low one!" },
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
    ipucu: { tr: "Kapağı aç, testereyi fırlat!", en: "Open the hatch, launch the saw!" },
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
    ipucu: { tr: "Topa dokun, sallansın!", en: "Tap the ball to swing it!" },
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
    ipucu: { tr: "Eğil: sallanan topun altından geç!", en: "Crouch: pass under the swinging ball!" },
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
    ipucu: { tr: "Pervane düşmanı topun önüne üfler!", en: "The statue blows the enemy in front of the ball!" },
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
    ipucu: { tr: "Eğil, zıpla, sonra topu salla!", en: "Crouch, jump, then swing the ball!" },
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
    ipucu: { tr: "Büyük final: hepsini birden kullan!", en: "Big finale: use everything at once!" },
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
    ipucu: { tr: "Sıra önemli! Yanlış kapak her şeyi bozar.", en: "Order matters! The wrong hatch ruins everything." },
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
    ipucu: { tr: "Önce rüzgar mı, kapak mı? Sıra önemli!", en: "Wind or hatch first? Order matters!" },
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
    ipucu: { tr: "Köprüden geçmeden açma, kayayı fazla itme!", en: "Don't open it before crossing the bridge, don't push the rock too far!" },
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
    ipucu: { tr: "Taşı doğru deliğe it, çukura saklan, eğil, sonra testere!", en: "Push the rock into the right hole, hide in the pit, crouch, then the saw!" },
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
    ipucu: { tr: "Asansörden önce tavandaki dikenleri kapat!", en: "Cover the ceiling spikes before the elevator!" },
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

// ---- KARMA BÖLÜMLER (56-65) ----
// Önceki mekaniklerin birleşimi. Kurallar: dar cepler en az 4 satır (Reis 126 px), testere/düşman tünelleri
// en az 3 satır, tek tıkla geçilmesin diye atlanmaması gereken çukurlar en az 5 kare geniş (zıplama ~4 kare).
window.BOLUMLER.push(
  // 56: Toprak cepleri. Boşluklardan aşağı in, koridorları yana doğru kazarak ceplere ulaş!
  {
    ipucu: { tr: "Boşluktan in, yana kazarak ceplerdeki düşmanlara ulaş!", en: "Drop down through the gap, dig sideways into the pockets!" },
    harita: [
      HAVA, HAVA, HAVA,
      ".R..................",
      "dddddddddddddddd..dd",
      "dddddddddddddddd..dd",
      "ddd......dddd.....dd",
      "ddd......dddd.....dd",
      "ddd......dddd.....dd",
      "ddd...c..dddd..o..dd",
      "##..dddddddddddddd##",
      "##..dddddddddddddd##",
      "##..dd..dddd..dd..##",
      "d.......dddd.......d",
      "d.......dddd.......d",
      "d...o...dddd...c...d",
      ZEMIN
    ]
  },
  // 57: İki taş, iki kapak. Her taş bir kapağın üstünde; kapak açılınca taş cebe düşer, düşmanı ezer.
  //  Sonra açılan 3 karelik boşluklardan zıplayarak sağa geç, son yengeci pompala. Taş itilirse kapaktan çıkar.
  {
    ipucu: { tr: "Taşları itme! Kapakları aç, taşlar düşmanları ezsin.", en: "Don't push the rocks! Open the hatches so they crush the enemies." },
    harita: [
      HAVA, HAVA, HAVA, HAVA,
      "....TT......TT......",
      ".R..TT......TT..d..c",
      "ddddkkkdddddkkkddddd",
      "####...#####...#####",
      "####...#####...#####",
      "####.c.#####.o.#####",
      ZEMIN
    ]
  },
  // 58: Rüzgarla kum köprüsü. Çukur 5 kare (atlanamaz), dibi dikenli. Heykel kumu çukura savurur;
  //  sonra heykeli KAPAT (açıkken Reis de çukura savrulur), kumun üstünden geç, kenardan pompala.
  {
    ipucu: { tr: "Rüzgarla kumu çukura savur, kapat, sonra geç!", en: "Blow the sand into the pit, switch off, then cross!" },
    harita: [
      HAVA, HAVA, HAVA,
      ZEMIN,
      "d....sssss.........d",
      "d....sssss.........d",
      "dR.>.sssss.....d.c.o",
      "##########.....#####",
      "##########AAAAA#####",
      ZEMIN
    ]
  },
  // 59: Raydaki testere + tünel testeresi. Üstte raydaki testerenin üstünden zıpla, kenardan pompala;
  //  alttaki kapalı tüneli fırlayan testere temizler.
  {
    ipucu: { tr: "Raydaki testereyi atla, alttakini fırlat!", en: "Jump the rail saw, launch the one below!" },
    harita: [
      "####################",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#R..dN.......d.c..o#",
      "####################",
      "#..................#",
      "#..................#",
      "#Y......c....o.....#",
      ZEMIN
    ]
  },
  // 60: Taş dikenleri örter (bölüm 32 gibi), alttaki odayı sallanan top temizler (bölüm 42 gibi).
  {
    ipucu: { tr: "Taşla dikenleri ört, sonra topu salla!", en: "Cover the spikes with the rock, then swing the ball!" },
    zincir: 3.8,
    harita: [
      "....................",
      "....................",
      "...TT...............",
      ".R.TT.........d.o...",
      "dddddd......dddddddd",
      "ddddddAAAAAAdddddddd",
      "dddddddddddddddddddd",
      "#####....P.....#####",
      "#####..........#####",
      "#####..........#####",
      "#####..........#####",
      "#####..c....o..#####",
      ZEMIN
    ]
  },
  // 61: Tavan dikenlerinin altından eğilerek geç, kuşu pompala (ya da eğilip altından geç),
  //  kapağın üstüne çık, aç ve alttaki odaya in. Zemin kaya: kapaktan başka yol yok.
  {
    ipucu: { tr: "Eğil: dikenlerin ve kuşun altından geç, sonra kapaktan in!", en: "Crouch under the spikes and the bird, then drop through the hatch!" },
    harita: [
      "####################",
      "#..................#",
      "#..................#",
      "#....#####.........#",
      "#....WWWWW.........#",
      "#..................#",
      "#..................#",
      "#R..............b..#",
      "############kkkk####",
      "#..................#",
      "#..................#",
      "#..................#",
      "#...c........o.....#",
      ZEMIN
    ]
  },
  // 62: Rüzgar asansörü (bölüm 17 gibi). Deliğin solunda dikenler var: yukarıdayken SAĞA süzül, sonra heykeli kapat.
  {
    ipucu: { tr: "Rüzgarla yukarı çık, sağa süzül: dikenlere dikkat!", en: "Ride the wind up, drift right: watch the spikes!" },
    harita: [
      HAVA, HAVA, HAVA,
      ZEMIN,
      "d..................d",
      "d..................d",
      "d..c..AA.......o...d",
      "########...#########",
      "d..................d",
      "d..................d",
      "d..................d",
      "dR.......^.........d",
      ZEMIN
    ]
  },
  // 63: Rüzgar taşı kuyuya iter (bölüm 25 gibi); kuyu alttaki tünele açılır. Taş tünele düşerse testerenin
  //  yolunu kapatır: önce testereyi fırlat (yengeç + ahtapot), sonra yukarıdaki ahtapotu pompala.
  {
    ipucu: { tr: "Taş kuyuya düşerse testerenin yolunu kapatır: önce testere!", en: "If the rock falls in, it blocks the saw: saw first!" },
    harita: [
      HAVA, HAVA,
      "....TT..............",
      ".R>.TT.........d.o..",
      "dddddddddddd..dddddd",
      "dddddddddddd..dddddd",
      "dddddddddddd..dddddd",
      "#..................#",
      "#..................#",
      "#Y.........c.....o.#",
      ZEMIN
    ]
  },
  // 64: Kum köprüsü + kuş. Çukur 6 kare (atlanamaz), dibi dikenli; kapak kumu çukura döker.
  //  Kuş çukurla kenar arasında uçar: eğil ya da pompala.
  {
    ipucu: { tr: "Kumu dök, dikenleri ört; kuşa dikkat!", en: "Drop the sand, cover the spikes; watch the bird!" },
    harita: [
      "####################",
      "#######ssss#########",
      "#######ssss#########",
      "#######ssss#########",
      "#######kkkk#########",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#R.........b.d.c..o#",
      "#####......#########",
      "#####AAAAAA#########",
      ZEMIN
    ]
  },
  // 65: Final. Kapak + taş (yengeci ez), 3 karelik boşluğu ve dikenleri atla, kenardan ahtapotu pompala,
  //  alttaki kapalı odayı sallanan topla temizle.
  {
    ipucu: { tr: "Final: kapak, taş, diken ve top. Hepsi sırayla!", en: "Finale: hatch, rock, spikes and ball. One by one!" },
    zincir: 3.8,
    harita: [
      "....................",
      "....................",
      "....................",
      "....................",
      ".....TT.............",
      ".R...TT..AA.d..o....",
      "dddddkkkdddddddddddd",
      "#####...############",
      "#####...############",
      "#####.c.############",
      "####################",
      "#####....P.....#####",
      "#####..........#####",
      "#####..........#####",
      "#####..........#####",
      "#####..c....o..#####",
      ZEMIN
    ]
  }
);
