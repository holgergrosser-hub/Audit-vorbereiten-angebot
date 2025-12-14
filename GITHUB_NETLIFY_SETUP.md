# 🚀 GITHUB & NETLIFY SETUP | Audit-Vorbereitung

**Version:** 2.1  
**Status:** ✅ Ready to Deploy

---

## 📋 WAS IST NÖTIG?

### GitHub:
- Code-Versionierung
- Automatische Backups
- Zusammenarbeit mit anderen
- Deployment-Trigger

### Netlify:
- Automatisches Frontend-Hosting
- Zero-Config Deployment
- Automatische HTTPS
- CI/CD Pipeline

---

## 🔧 INSTALLATION (20 Minuten)

### SCHRITT 1: GitHub Repository erstellen

**Auf GitHub.com:**

```
1. Gehe zu https://github.com/new
2. Repository Name: "Audit-vorbereiten-angebot"
3. Description: "Automatisiertes Angebotssystem für ISO 9001 Audits"
4. Public wählen (für Netlify)
5. "Create repository" klicken
```

**Lokal einrichten:**

```bash
# Im Projektverzeichnis:
git init
git add .
git commit -m "Initial commit: Audit-Vorbereitung v2.1"

# GitHub remote hinzufügen (DEINE URL!):
git remote add origin https://github.com/holgergrosser-hub/Audit-vorbereiten-angebot.git
git branch -M main
git push -u origin main
```

---

### SCHRITT 2: Netlify verbinden

**Methode 1: Über Netlify UI (einfacher)**

```
1. Gehe zu https://app.netlify.com
2. "Add new site" → "Connect to Git"
3. "GitHub" wählen
4. Repo "Audit-vorbereiten-angebot" suchen & wählen
5. Build settings prüfen:
   - Build command: "npm run build"
   - Publish directory: "dist"
6. "Deploy site" klicken
```

**Fertig!** Netlify deployed automatisch bei jedem Git Push.

---

### SCHRITT 3: Environment Variablen setzen

**In Netlify Dashboard:**

```
Site settings → Build & deploy → Environment
→ Add environment variable:

KEY: VITE_GOOGLE_APPS_SCRIPT_URL
VALUE: https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercontent

(Deine Google Apps Script Web App URL einfügen!)
```

---

### SCHRITT 4: Domain (optional)

**Wenn du eine eigene Domain willst:**

```
Netlify Dashboard → Site settings → Domain management
→ "Add custom domain"

Dann DNS-Einstellungen bei deinem Provider anpassen.
```

---

## 📦 DATEISTRUKTUR

```
Audit-vorbereiten-angebot/
├── package.json          ← NPM Abhängigkeiten
├── netlify.toml          ← Netlify Config
├── .gitignore            ← Git ignore rules
├── vite.config.js        ← Vite config
├── index.html            ← Entry point
├── src/
│   ├── App.jsx           ← React Komponente
│   ├── main.jsx          ← App bootstrap
│   └── index.css         ← Styles
├── Code.gs               ← Google Apps Script
├── QUICKSTART_Code.gs.md ← Setup Anleitung
└── README.md             ← Dokumentation
```

---

## 🔑 WICHTIGE KONSTANTEN

### In `Code.gs` setzen:

```javascript
const CONFIG = {
  TEMPLATE_FILE_ID: 'DEINE_GOOGLE_DOC_ID',
  OUTPUT_FOLDER_ID: '1uh8-Os7HTcBALcYUPTT_1unz54KHtl2S',
  SHEET_ID: '1a5ynBvxrImg2NBjcidVzUULSEy8-XwbGgsRLxzTpfsE',
  // ...
};
```

### In Frontend (index.html oder .env):

```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/YOUR_ID/usercontent';
```

---

## 🚀 AUTOMATISCHES DEPLOYMENT

### Wenn alles eingerichtet ist:

```bash
# 1. Änderungen machen
nano src/App.jsx

# 2. Committen
git add .
git commit -m "Update: neue Feature"

# 3. Pushen
git push origin main

# 4. Netlify deployed automatisch! ✅
```

---

## 📱 DEINE WEBSITE URLs

**Nach Deployment:**

```
Netlify URL: https://audit-vorbereiten-angebot.netlify.app
(oder custom domain wenn gesetzt)

GitHub Repo: https://github.com/holgergrosser-hub/Audit-vorbereiten-angebot
```

---

## ✅ CHECKLISTE

- [ ] GitHub Konto erstellt
- [ ] Repository erstellt (public)
- [ ] Lokal initialisiert & gepusht
- [ ] Netlify Konto erstellt
- [ ] Repository mit Netlify verbunden
- [ ] Build erfolgreich?
- [ ] Live URL funktioniert?
- [ ] Google Apps Script URL in Frontend gesetzt
- [ ] Teste Formular-Submit
- [ ] Angebot wird generiert?

---

## 🐛 TROUBLESHOOTING

### Fehler: "Build failed"

**Lösung:**
```bash
# Lokal testen
npm install
npm run build

# Check Logs in Netlify Dashboard
```

### Fehler: "Formular sendet nicht"

**Lösung:**
1. Google Apps Script URL überprüfen (VITE_GOOGLE_APPS_SCRIPT_URL)
2. Browser Console (F12) auf Errors prüfen
3. Google Apps Script Logs prüfen

### Fehler: "PDF wird nicht generiert"

**Lösung:**
1. Google Drive API aktiviert?
2. TEMPLATE_FILE_ID in Code.gs korrekt?
3. Google Apps Script Logs prüfen

---

## 📊 DEPLOYMENT FLOW

```
Developer macht Änderung
    ↓
git push origin main
    ↓
GitHub empfängt Push
    ↓
Netlify bekommt Notification
    ↓
npm run build (Vite kompiliert)
    ↓
dist/ Ordner wird deployed
    ↓
Website ist live! ✅
```

---

## 🔐 SICHERHEIT

**Niemals committen:**
- `.env` Dateien
- API Keys
- Google Apps Script IDs (in secrets)
- Passwörter

**Stattdessen:**
- Netlify Environment Variablen nutzen
- `.gitignore` prüfen
- Secrets in GitHub Settings speichern

---

## 📞 TROUBLESHOOTING SUPPORT

**Kommandos für lokale Tests:**

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Production bauen
npm run build

# Lokal testen (Production Build)
npm run preview

# GitHub status prüfen
git status
git log --oneline

# Netlify CLI (optional)
npm install -g netlify-cli
netlify deploy --prod
```

---

## 🎉 FERTIG!

Nach erfolgreicher Einrichtung:

✅ Frontend läuft auf Netlify  
✅ Backend (Google Apps Script) läuft  
✅ Code ist in GitHub versioniert  
✅ Automatisches Deployment bei Änderungen  
✅ Voll funktionsfähiges System! 🚀

---

**Nächste Schritte:**
1. Teste das komplette System (Formular → Angebot → PDF)
2. Fehler beheben
3. Go-Live!

---

**Version:** 2.1  
**Status:** ✅ Production Ready
