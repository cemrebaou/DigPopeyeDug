// Kullanım:
//   node scripts/hazirla.js config   -> capacitor.config.json oluşturur
//   node scripts/hazirla.js android  -> Android projesine AdMob ID, dikey ekran, sürüm numarası ekler
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const kok = path.join(__dirname, "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(kok, "www/js/config.js"), "utf8"), ctx);
const C = ctx.window.OYUN_CONFIG;
const TEST_APP_ID = "ca-app-pub-3940256099942544~3347511713";

const adim = process.argv[2];

if (adim === "config") {
  fs.writeFileSync(path.join(kok, "capacitor.config.json"), JSON.stringify({
    appId: C.paketAdi,
    appName: C.oyunAdi,
    webDir: "www",
    android: { backgroundColor: "#14213d" }
  }, null, 2));
  console.log("capacitor.config.json yazıldı");
}

if (adim === "android") {
  const app = path.join(kok, "android/app");
  const admobId = C.reklam.testModu || C.reklam.uygulamaId.includes("X") ? TEST_APP_ID : C.reklam.uygulamaId;

  // strings.xml
  const strings = path.join(app, "src/main/res/values/strings.xml");
  let s = fs.readFileSync(strings, "utf8");
  if (!s.includes("admob_app_id")) s = s.replace("</resources>", `    <string name="admob_app_id">${admobId}</string>\n</resources>`);
  fs.writeFileSync(strings, s);

  // AndroidManifest.xml
  const man = path.join(app, "src/main/AndroidManifest.xml");
  let m = fs.readFileSync(man, "utf8");
  if (!m.includes("gms.ads.APPLICATION_ID")) {
    m = m.replace(/<application([^>]*)>/, `<application$1>\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="@string/admob_app_id" />`);
  }
  if (!m.includes("screenOrientation")) m = m.replace("<activity", '<activity\n            android:screenOrientation="portrait"');
  fs.writeFileSync(man, m);

  // Sürüm numarası (her derlemede artar, Play Console bunu ister)
  const gradle = path.join(app, "build.gradle");
  const no = process.env.GITHUB_RUN_NUMBER || "1";
  let g = fs.readFileSync(gradle, "utf8");
  g = g.replace(/versionCode \d+/, `versionCode ${no}`).replace(/versionName "[^"]*"/, `versionName "1.0.${no}"`);
  // Yayın imzası (GitHub Secrets'ta keystore varsa)
  if (process.env.KEYSTORE_PATH && !g.includes("signingConfigs")) {
    g = g.replace("    buildTypes {", `    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_PATH"))
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {`).replace("minifyEnabled false", "minifyEnabled false\n            signingConfig signingConfigs.release");
  }
  fs.writeFileSync(gradle, g);

  console.log("Android ayarlandı. AdMob:", admobId, "sürüm:", no);
}
