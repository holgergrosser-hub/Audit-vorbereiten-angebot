# 🚀 QUICK START | Code.gs (Kombinierte Datei)

**Version:** 2.1 FIX  
**Zeilen:** 969  
**Größe:** 33 KB  
**Status:** ✅ Ready to Deploy

---

## 📋 WAS IST DRIN?

**EINE Datei mit ALLEM:**
- ✅ Main Script (Angebotsgenerierung via doPost)
- ✅ Reminders Script (Automatische Erinnerungen)
- ✅ Alle Konfigurationen
- ✅ Alle Hilfsfunktionen

**KEINE separaten Dateien nötig!**

---

## ⚡ INSTALLATION (5 MINUTEN)

### Schritt 1: Google Apps Script öffnen
```
https://script.google.com
```

### Schritt 2: Neues Projekt erstellen
```
Klick "Neues Projekt"
Titel: "Audit-Vorbereitung"
```

### Schritt 3: Code.gs Inhalt kopieren
```
1. Öffne Code.gs (diese Datei)
2. Kopiere KOMPLETTEN Inhalt (Ctrl+A, Ctrl+C)
3. Öffne Google Apps Script
4. Lösche Standard "Code.gs"
5. Paste den kompletten Code
6. Speichern (Ctrl+S)
```

### Schritt 4: Konstanten anpassen
```javascript
// In Code.gs am Anfang:
const CONFIG = {
  TEMPLATE_FILE_ID: 'DEINE_TEMPLATE_ID_HIER', ← ÄNDERN!
  OUTPUT_FOLDER_ID: '1uh8-Os7HTcBALcYUPTT_1unz54KHtl2S', ✓
  SHEET_ID: '1a5ynBvxrImg2NBjcidVzUULSEy8-XwbGgsRLxzTpfsE', ✓
  // Rest passt
};
```

### Schritt 5: Web App bereitstellen
```
Klick "Bereitstellen" (oben rechts)
→ "Neue Bereitstellung"
→ Typ: "Web-App"
→ Ausführen unter: "Dich selbst wählen"
→ Zugriff: "Jeder"
→ "Bereitstellen"
```

**WICHTIG:** Kopiere die Web App URL für das Frontend!

### Schritt 6: Täglichen Trigger einrichten
```
Linke Seite: "Trigger" (⏰)
Klick "Trigger erstellen"

Einstellungen:
- Funktion: checkAndSendReminders
- Ereignisquellentyp: Zeitbasiert
- Zeitbasiert-Typ: Täglich
- Tageszeit: 08:00 - 09:00 Uhr

Speichern!
```

### Schritt 7: Google Sheet vorbereiten
```
Öffne dein Google Sheet
Gehe zu Column O (nach Notizen)
Füge Header ein: "Rechnung_Erinnerung_Versendet"
Fertig!
```

---

## ✅ TESTING

### Test 1: Google Apps Script
```javascript
// In Google Apps Script Console:
1. Funktion: "doGet" wählen
2. "Ausführen" klicken
3. Sollte HTML-Seite erscheinen ✓
```

### Test 2: Reminders
```javascript
// In Google Apps Script Console:
1. Funktion: "validateSheetStructure" wählen
2. "Ausführen" klicken
3. In Logs sollten alle Spalten sichtbar sein ✓
```

### Test 3: Complete Flow
```javascript
// In Google Apps Script Console:
1. "addTestAnfrage" ausführen
2. "checkAndSendReminders" ausführen
3. Überprüfe Logs & Google Sheet ✓
```

---

## 📊 FUNKTIONEN IN DIESER DATEI

### Main Script (Angebotsgenerierung)
```javascript
doPost(e)                    // Wird vom Frontend aufgerufen
├─ parseDaten()
├─ validiereDaten()
├─ validiereProjektleiter()
├─ befuelleTemplate()
├─ konvertiereToPDF()
├─ versendEmail()
└─ loggeInSheet()
```

### Reminders Script (Automatische Erinnerungen)
```javascript
checkAndSendReminders()      // Wird täglich @ 08:00 aufgerufen
├─ verarbeiteAnfrage()
├─ sendNachfassEmail()
├─ sendRechnungsErinnerung()
└─ sendRezensionsAnfrage()
```

### Hilfsfunktionen
```javascript
ermittleSpaltenfeldMapping()  // Column-Indizes ermitteln
getProjektleiter()            // Projektleiter suchen
updateStatus()                // Status aktualisieren
updateDatum()                 // Datum setzen
formatiereDatum()             // Format de-DE
validateSheetStructure()      // Sheet Struktur prüfen
checkEmailQuota()             // Email-Limit prüfen
addTestAnfrage()              // Test-Daten hinzufügen
doGet()                       // GET-Request Handler
```

---

## 🔧 WICHTIGE KONSTANTEN

```javascript
CONFIG = {
  TEMPLATE_FILE_ID: 'MUSS gesetzt werden!',
  OUTPUT_FOLDER_ID: '1uh8-Os7HTcBALcYUPTT_1unz54KHtl2S', // Deine Folder
  SHEET_ID: '1a5ynBvxrImg2NBjcidVzUULSEy8-XwbGgsRLxzTpfsE', // Dein Sheet
  HOLGER_EMAIL: 'Holger.grosser@iso9001.info',
  STUNDENSATZ: 135,
  NACHFASS_1_TAGE: 3,
  NACHFASS_2_TAGE: 7,
  NACHFASS_3_TAGE: 14,
  RECHNUNG_ERINNERUNG_TAGE: 21,
  GOOGLE_REVIEW_LINK: 'https://g.page/r/Ca2spcvqhrKqEAE/review',
  PROJEKTLEITER: { /* 4 Projektleiter */ }
};
```

---

## 🎯 WORKFLOW

### Angebot-Erstellung:
```
Frontend Formular
    ↓ (POST zu Web App URL)
doPost() wird aufgerufen
    ├─ Daten parsen & validieren
    ├─ Template befüllen & PDF generieren
    ├─ Email versenden (mit Projektleiter CC)
    └─ In Google Sheet loggen
    ↓
JSON Response an Frontend
```

### Automatische Erinnerungen:
```
Täglich 08:00 Uhr
    ↓
checkAndSendReminders() wird aufgerufen
    ├─ Alle Zeilen prüfen
    ├─ Status evaluieren
    ├─ Emails versenden (wenn fällig)
    └─ Status aktualisieren
    ↓
Logs schreiben
```

---

## 📧 EMAILS DIE VERSENDET WERDEN

| Trigger | An | CC | Betreff |
|---------|----|----|---------|
| Angebot erstellt | Kunde | Holger + PL | Ihr Angebot für Audit-Vorbereitung |
| Nach 3 Tagen | Kunde | - | Noch Fragen? |
| Nach 7 Tagen | Kunde | - | Kurze Rückfrage |
| Nach 14 Tagen | Kunde | - | Letzte Nachfrage |
| Status = AUFTRAG | Kunde | Holger + PL | Auftrag-Bestätigung |
| Nach 21 Tagen (Auftrag) | Holger | PL | Rechnung schreiben |
| Nach Rechnung | Kunde | - | Google Review Link |

---

## 🔒 BUG-FIXES IN v2.1

### FIX #1: Projektleiter CC bei Rechnungs-Erinnerung
```javascript
// Projektleiter bekommt jetzt CC
if (ccAddresses.length > 0) {
  emailConfig.cc = ccAddresses.join(',');
}
```

### FIX #2: Rechnungs-Erinnerung nur EINMAL
```javascript
// Neue Spalte: "Rechnung_Erinnerung_Versendet"
// Verhindert tägliche Wiederholung
if (!anfrage.rechnungErinnerungVersendet) {
  sendRechnungsErinnerung(...);
}
```

### FIX #3: Google Review Link
```javascript
// Direkter Link statt generischer
GOOGLE_REVIEW_LINK: 'https://g.page/r/Ca2spcvqhrKqEAE/review'
```

---

## 🚨 HÄUFIGE FEHLER

### Fehler: "TEMPLATE_FILE_ID is undefined"
**Lösung:** 
- Öffne Google Doc Template
- Kopiere ID aus URL: `https://docs.google.com/document/d/**ID**/edit`
- Setze in CONFIG

### Fehler: "Keine Email erhalten"
**Lösung:**
- Überprüfe CONFIG.HOLGER_EMAIL
- Überprüfe Google Apps Script Logs
- Überprüfe Spam-Ordner

### Fehler: "Sheet-Eintrag fehlt"
**Lösung:**
- Überprüfe CONFIG.SHEET_ID
- Sheet muss "Anfragen" heißen
- Header in Zeile 1 müssen exakt sein

---

## ✅ FINALE CHECKLISTE

- [ ] Code.gs Inhalt kopiert
- [ ] TEMPLATE_FILE_ID gesetzt
- [ ] Web App bereitgestellt
- [ ] Web App URL kopiert (für Frontend)
- [ ] Täglicher Trigger eingerichtet (08:00)
- [ ] Google Sheet Spalte O hinzugefügt
- [ ] Test ausgeführt (validateSheetStructure)
- [ ] Google Review Link korrekt gesetzt
- [ ] Projektleiter konfiguriert
- [ ] Go-Live ready ✅

---

## 📞 SUPPORT

**Probleme?**
1. Überprüfe Google Apps Script Logs
2. Überprüfe CONFIG Konstanten
3. Führe validateSheetStructure() aus
4. Kontakt: Holger.grosser@iso9001.info

---

**Version:** 2.1 FIX  
**Status:** ✅ Production Ready  
**Qualität:** ⭐⭐⭐⭐⭐

🚀 **Viel Erfolg mit deinem System!**
