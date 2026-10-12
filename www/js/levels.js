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
