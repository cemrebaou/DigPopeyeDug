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
