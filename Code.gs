/**
 * ============================================================================
 * AUDIT-VORBEREITUNG ANGEBOTS-AUTOMATISIERUNG | KOMBINIERTE VERSION
 * ============================================================================
 * 
 * EINE DATEI mit:
 * • Main Script (Angebotsgenerierung)
 * • Reminders Script (Automatische Erinnerungen)
 * 
 * Version: 2.1 FIX (mit Projektleiter-Management & Bug-Fixes)
 * Datum: Dezember 2025
 * 
 * ============================================================================
 * KONFIGURATION
 * ============================================================================
 */

const CONFIG = {
  // Google Drive
  TEMPLATE_FILE_ID: 'TEMPLATE_ID_HIER_EINFÜGEN',
  OUTPUT_FOLDER_ID: '1uh8-Os7HTcBALcYUPTT_1unz54KHtl2S',
  
  // Google Sheets
  SHEET_ID: '1a5ynBvxrImg2NBjcidVzUULSEy8-XwbGgsRLxzTpfsE',
  SHEET_NAME: 'Anfragen',
  
  // Email
  HOLGER_EMAIL: 'Holger.grosser@iso9001.info',
  HOLGER_NAME: 'Holger Großer',
  
  // Service
  SERVICE_NAME: 'Audit-Vorbereitung',
  STUNDENSATZ: 135,
  STANDARD_STUNDEN_MIN: 6,
  STANDARD_STUNDEN_MAX: 12,
  
  // Projektleiter
  PROJEKTLEITER: {
    'nina.schroeder': { name: 'Nina Schröder', email: 'nina.schroeder@iso9001.info' },
    'holger.grosser': { name: 'Holger Großer', email: 'Holger.Grosser@iso9001.info' },
    'stephan.schroeder': { name: 'Stephan Schröder', email: 'stephan.schroeder@iso9001.info' },
    'nina.benyagoub': { name: 'Nina Benyagoub', email: 'nina.benyagoub@iso9001.info' }
  },
  
  // Email/Erinnerungen
  EMAIL_FROM_NAME: 'Holger Großer - QM-Guru',
  NACHFASS_1_TAGE: 3,
  NACHFASS_2_TAGE: 7,
  NACHFASS_3_TAGE: 14,
  RECHNUNG_ERINNERUNG_TAGE: 21,
  REZENSION_ANFRAGE_TAGE: 7,
  GOOGLE_REVIEW_LINK: 'https://g.page/r/Ca2spcvqhrKqEAE/review'
};

/**
 * ============================================================================
 * MAIN SCRIPT - ANGEBOTSGENERIERUNG
 * ============================================================================
 */

function doPost(e) {
  try {
    Logger.log('='.repeat(80));
    Logger.log('🚀 AUDIT-VORBEREITUNG ANFRAGE ERHALTEN (v2.1 FIX)');
    Logger.log('='.repeat(80));
    
    Logger.log('📥 Schritt 1: Daten parsen...');
    const data = parseDaten(e);
    Logger.log('✅ Daten geparst');
    
    Logger.log('🔍 Schritt 2: Validierung...');
    validiereDaten(data);
    Logger.log('✅ Validierung bestanden');
    
    Logger.log('👤 Schritt 3: Projektleiter validieren...');
    const projektleiter = validiereProjektleiter(data.projektleiterId);
    Logger.log('✅ Projektleiter: ' + (projektleiter ? projektleiter.name : 'Keine Auswahl'));
    
    Logger.log('📝 Schritt 4: Google Docs Template befüllen...');
    const docId = befuelleTemplate(data);
    Logger.log('✅ Template befüllt: ' + docId);
    
    Logger.log('🔄 Schritt 5: PDF generieren...');
    const pdfFile = konvertiereToPDF(docId, data);
    Logger.log('✅ PDF erstellt: ' + pdfFile.getName());
    
    Logger.log('📧 Schritt 6: Email versenden...');
    versendEmail(data, pdfFile, projektleiter);
    Logger.log('✅ Email versendet (inklusive Projektleiter CC)');
    
    Logger.log('📊 Schritt 7: In Google Sheet loggen...');
    loggeInSheet(data, pdfFile.getId(), projektleiter);
    Logger.log('✅ In Sheet geloggt (mit Projektleiter)');
    
    Logger.log('');
    Logger.log('🎉 ERFOLG!');
    Logger.log('='.repeat(80));
    
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Angebot erfolgreich erstellt und versendet!',
        details: {
          firma: data.unternehmensname,
          email: data.email,
          projektleiter: projektleiter ? projektleiter.name : 'Keine Auswahl',
          pdfId: pdfFile.getId(),
          timestamp: new Date().toLocaleString('de-DE')
        }
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ FEHLER: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    Logger.log('='.repeat(80));
    
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString(),
        hint: 'Bitte überprüfe Google Apps Script Logs für Details'
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ============================================================================
 * DATENPARSING
 * ============================================================================
 */
function parseDaten(e) {
  let data = {};
  
  if (e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      Logger.log('⚠️ JSON Parse Fehler, versuche e.parameter');
      data = e.parameter || {};
    }
  } else {
    data = e.parameter || {};
  }
  
  return {
    unternehmensname: (data.unternehmensname || data.firma || '').trim() || null,
    ansprechpartner: (data.ansprechpartner || data.kontakt || '').trim() || null,
    email: (data.email || '').trim().toLowerCase() || null,
    telefon: (data.telefon || data.phone || '').trim() || '',
    nachricht: (data.nachricht || data.message || '').trim() || '',
    stunden: parseInt(data.stunden) || CONFIG.STANDARD_STUNDEN_MIN,
    projektleiterId: (data.projektleiterId || '').trim() || null,
    erfassungZeitpunkt: new Date()
  };
}

/**
 * ============================================================================
 * VALIDIERUNG
 * ============================================================================
 */
function validiereDaten(data) {
  const errors = [];
  
  if (!data.unternehmensname) errors.push('Unternehmensname fehlt');
  if (!data.ansprechpartner) errors.push('Ansprechpartner fehlt');
  if (!data.email) errors.push('Email fehlt');
  
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Email-Format ungültig: ' + data.email);
  }
  
  if (data.stunden < 1 || data.stunden > 40) {
    errors.push('Stunden müssen zwischen 1 und 40 liegen');
  }
  
  if (errors.length > 0) {
    throw new Error('Validierungsfehler: ' + errors.join(' | '));
  }
  
  Logger.log('✅ Validierung OK:');
  Logger.log('  • Firma: ' + data.unternehmensname);
  Logger.log('  • Kontakt: ' + data.ansprechpartner);
  Logger.log('  • Email: ' + data.email);
  Logger.log('  • Telefon: ' + (data.telefon || '(nicht angegeben)'));
  Logger.log('  • Stunden: ' + data.stunden);
  Logger.log('  • Projektleiter ID: ' + (data.projektleiterId || '(keine Auswahl)'));
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * ============================================================================
 * PROJEKTLEITER VALIDIERUNG
 * ============================================================================
 */
function validiereProjektleiter(projektleiterId) {
  if (!projektleiterId) return null;
  
  for (const key in CONFIG.PROJEKTLEITER) {
    if (key === projektleiterId || 
        CONFIG.PROJEKTLEITER[key].email === projektleiterId) {
      return CONFIG.PROJEKTLEITER[key];
    }
  }
  
  Logger.log('⚠️ Projektleiter nicht gefunden: ' + projektleiterId);
  return null;
}

/**
 * ============================================================================
 * GOOGLE DOCS TEMPLATE BEFÜLLEN
 * ============================================================================
 */
function befuelleTemplate(data) {
  try {
    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_FILE_ID);
    const outputFolder = DriveApp.getFolderById(CONFIG.OUTPUT_FOLDER_ID);
    
    const fileName = `Angebot_${data.unternehmensname}_${new Date().getTime()}.docx`;
    const newFile = templateFile.makeCopy(fileName, outputFolder);
    
    Logger.log('📋 Template geklont: ' + newFile.getName());
    
    const doc = DocumentApp.openById(newFile.getId());
    const body = doc.getBody();
    
    const datum = new Date();
    const gueltigkeit = new Date(datum.getTime() + 30 * 24 * 60 * 60 * 1000);
    const betragNetto = data.stunden * CONFIG.STUNDENSATZ;
    const mwst = betragNetto * 0.19;
    const betragBrutto = betragNetto + mwst;
    
    body.replaceText('{{UNTERNEHMENSNAME}}', data.unternehmensname);
    body.replaceText('{{ANSPRECHPARTNER}}', data.ansprechpartner);
    body.replaceText('{{EMAIL}}', data.email);
    body.replaceText('{{TELEFON}}', data.telefon || 'nicht angegeben');
    body.replaceText('{{DATUM}}', formatiereDatum(datum));
    body.replaceText('{{GUELTIG_BIS}}', formatiereDatum(gueltigkeit));
    body.replaceText('{{STUNDEN}}', data.stunden.toString());
    body.replaceText('{{STUNDENSATZ}}', CONFIG.STUNDENSATZ.toFixed(2));
    body.replaceText('{{BETRAG_NETTO}}', betragNetto.toFixed(2));
    body.replaceText('{{MWST_19}}', mwst.toFixed(2));
    body.replaceText('{{BETRAG_BRUTTO}}', betragBrutto.toFixed(2));
    body.replaceText('{{NACHRICHT}}', data.nachricht);
    body.replaceText('{{HOLGER_NAME}}', CONFIG.HOLGER_NAME);
    body.replaceText('{{HOLGER_EMAIL}}', CONFIG.HOLGER_EMAIL);
    
    doc.saveAndClose();
    Logger.log('✅ Platzhalter ersetzt und gespeichert');
    
    return newFile.getId();
    
  } catch (error) {
    throw new Error('Fehler beim Template-Befüllen: ' + error.message);
  }
}

/**
 * ============================================================================
 * PDF KONVERTIERUNG
 * ============================================================================
 */
function konvertiereToPDF(docId, data) {
  try {
    Utilities.sleep(1000);
    
    const file = DriveApp.getFileById(docId);
    const pdfBlob = file.getBlob().getAs('application/pdf');
    
    const pdfFileName = `Angebot_${data.unternehmensname}_${new Date().getTime()}.pdf`;
    const pdfFile = DriveApp.getFolderById(CONFIG.OUTPUT_FOLDER_ID)
      .createFile(pdfBlob)
      .setName(pdfFileName);
    
    Logger.log('✅ PDF erstellt: ' + pdfFile.getName());
    
    file.setTrashed(true);
    Logger.log('✅ DOCX gelöscht');
    
    return pdfFile;
    
  } catch (error) {
    throw new Error('Fehler bei PDF-Konvertierung: ' + error.message);
  }
}

/**
 * ============================================================================
 * EMAIL VERSAND (MIT PROJEKTLEITER CC)
 * ============================================================================
 */
function versendEmail(data, pdfFile, projektleiter) {
  try {
    const betragNetto = data.stunden * CONFIG.STUNDENSATZ;
    const mwst = betragNetto * 0.19;
    const betragBrutto = betragNetto + mwst;
    
    const htmlBody = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .box-title { color: #166534; font-weight: bold; margin: 0 0 10px 0; }
        ul { margin: 10px 0 0 0; color: #166534; padding-left: 20px; }
        .price-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
        .price-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .price-table .label { text-align: left; color: #666; }
        .price-table .value { text-align: right; font-weight: bold; }
        .total { background: #f0fdf4; font-size: 18px; }
        .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Ihr Angebot</h1>
            <p>QM-Guru | Audit-Vorbereitung zur ISO 9001 Zertifizierung</p>
        </div>
        
        <div class="content">
            <p>Lieber <strong>${data.ansprechpartner}</strong>,</p>
            
            <p>vielen Dank für Ihre Anfrage zur <strong>Audit-Vorbereitung</strong>! 🙌</p>
            
            <p>Anbei finden Sie Ihr personalisiertes Angebot für <strong>${data.unternehmensname}</strong>.</p>
            
            <div class="box">
                <div class="box-title">✅ Das ist im Angebot enthalten:</div>
                <ul>
                    <li><strong>${data.stunden} Stunden</strong> Online-Betreuung (à 135€/h)</li>
                    <li>Nachweise vorbereiten & Checkliste</li>
                    <li>Internes Audit vorbereiten & durchführen</li>
                    <li>QM-Handbuch anpassen (falls erforderlich)</li>
                    <li>Managementbewertung vorbereiten</li>
                    <li>Unterstützung im Audit durch Zertifizierer</li>
                    <li>Weitere Aufgaben nach Abstimmung</li>
                </ul>
            </div>
            
            <div class="box" style="background: #fef3c7; border-left-color: #d97706;">
                <div class="box-title" style="color: #92400e;">💡 Hinweis: Fördergelder nutzen</div>
                <p style="color: #92400e; margin: 0;">
                    Viele Unternehmen können ihre <strong>Audit-Vorbereitung durch BAFA gefördert</strong> werden. 
                    Wir unterstützen Sie gerne bei der Antragstellung!
                </p>
            </div>
            
            <h3>💰 Preisangebot:</h3>
            <table class="price-table">
                <tr>
                    <td class="label">${data.stunden} Stunden × 135€</td>
                    <td class="value">${betragNetto.toFixed(2)}€</td>
                </tr>
                <tr>
                    <td class="label">MwSt (19%)</td>
                    <td class="value">${mwst.toFixed(2)}€</td>
                </tr>
                <tr class="total">
                    <td class="label"><strong>Gesamtbetrag</strong></td>
                    <td class="value"><strong>${betragBrutto.toFixed(2)}€</strong></td>
                </tr>
            </table>
            
            <h3>🚀 Nächste Schritte:</h3>
            <ol>
                <li>Überprüfen Sie das Angebot PDF</li>
                <li>Haben Sie Fragen? Rufen Sie an: <strong>0911-49522541</strong></li>
                <li>Bestätigung per Email/Telefon und wir starten sofort!</li>
            </ol>
            
            <div class="footer">
                <p><strong>Kontakt:</strong><br>
                Holger Großer<br>
                QM-Guru | QM-Dienstleistungen<br>
                Tel: 0911-49522541<br>
                Email: ${CONFIG.HOLGER_EMAIL}<br>
                Web: www.qm-guru.de
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
    
    const ccAddresses = [CONFIG.HOLGER_EMAIL];
    if (projektleiter && projektleiter.email) {
      ccAddresses.push(projektleiter.email);
      Logger.log('📧 Projektleiter CC: ' + projektleiter.email);
    }
    
    MailApp.sendEmail({
      to: data.email,
      subject: `Ihr Angebot für Audit-Vorbereitung - ${data.unternehmensname}`,
      htmlBody: htmlBody,
      attachments: [pdfFile.getBlob()],
      cc: ccAddresses.join(','),
      replyTo: CONFIG.HOLGER_EMAIL,
      name: CONFIG.HOLGER_NAME
    });
    
    Logger.log('✅ Email versendet an: ' + data.email);
    if (projektleiter) {
      Logger.log('✅ Projektleiter CC: ' + projektleiter.email);
    }
    
  } catch (error) {
    throw new Error('Fehler beim Email-Versand: ' + error.message);
  }
}

/**
 * ============================================================================
 * GOOGLE SHEET LOGGING
 * ============================================================================
 */
function loggeInSheet(data, pdfId, projektleiter) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME);
    
    const betragNetto = data.stunden * CONFIG.STUNDENSATZ;
    const mwst = betragNetto * 0.19;
    const betragBrutto = betragNetto + mwst;
    
    const projektleiterName = projektleiter ? projektleiter.name : '';
    
    sheet.appendRow([
      new Date(),                           // A: Datum
      data.unternehmensname,               // B: Unternehmen
      data.ansprechpartner,                // C: Ansprechpartner
      data.email,                          // D: Email
      data.telefon,                        // E: Telefon
      'NEU',                               // F: Status
      new Date(),                          // G: Angebot_Datum
      pdfId,                               // H: Angebot_ID
      projektleiterName,                   // I: Projektleiter
      '',                                  // J: Auftrag_Datum
      '',                                  // K: Rechnung_Datum
      '',                                  // L: Rechnung_Erinnerung_Versendet
      betragBrutto.toFixed(2),             // M: Betrag
      '',                                  // N: Rezension_Datum
      `${data.stunden}h @ 135€/h`          // O: Notizen
    ]);
    
    Logger.log('✅ In Google Sheet geloggt');
    if (projektleiter) {
      Logger.log('   Projektleiter: ' + projektleiter.name);
    }
    
  } catch (error) {
    Logger.log('⚠️ Fehler beim Sheet-Logging (nicht kritisch): ' + error.message);
  }
}

/**
 * ============================================================================
 * REMINDERS SCRIPT - AUTOMATISCHE ERINNERUNGEN
 * ============================================================================
 */

function checkAndSendReminders() {
  try {
    Logger.log('='.repeat(80));
    Logger.log('🔔 Tägliche Erinnerungsprüfung gestartet (v2.1 FIX)');
    Logger.log('='.repeat(80));
    
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const colIndex = ermittleSpaltenfeldMapping(headers);
    
    if (!colIndex.status || colIndex.status === -1) {
      throw new Error('Status-Spalte nicht gefunden!');
    }
    
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    
    let bearbeiteteEintraege = 0;
    
    for (let i = 1; i < data.length; i++) {
      try {
        const row = data[i];
        const rowNum = i + 1;
        
        const anfrage = {
          rowNum: rowNum,
          datum: row[colIndex.datum] ? new Date(row[colIndex.datum]) : null,
          unternehmen: row[colIndex.unternehmen] || '',
          ansprechpartner: row[colIndex.ansprechpartner] || '',
          email: row[colIndex.email] || '',
          telefon: row[colIndex.telefon] || '',
          status: row[colIndex.status] || '',
          angebotDatum: row[colIndex.angebotDatum] ? new Date(row[colIndex.angebotDatum]) : null,
          auftragDatum: row[colIndex.auftragDatum] ? new Date(row[colIndex.auftragDatum]) : null,
          rechnungDatum: row[colIndex.rechnungDatum] ? new Date(row[colIndex.rechnungDatum]) : null,
          rechnungErinnerungVersendet: row[colIndex.rechnungErinnerungVersendet] || '',
          rezensionDatum: row[colIndex.rezensionDatum] ? new Date(row[colIndex.rezensionDatum]) : null,
          projektleiter: row[colIndex.projektleiter] || ''
        };
        
        if (!anfrage.email || !anfrage.status) continue;
        
        bearbeiteteEintraege += verarbeiteAnfrage(sheet, anfrage, colIndex, heute);
        
      } catch (rowError) {
        Logger.log('⚠️ Fehler in Zeile ' + (i+1) + ': ' + rowError.message);
      }
    }
    
    Logger.log('');
    Logger.log('✅ Erinnerungsprüfung abgeschlossen');
    Logger.log('   Bearbeitete Einträge: ' + bearbeiteteEintraege);
    Logger.log('='.repeat(80));
    
  } catch (error) {
    Logger.log('❌ FEHLER: ' + error.message);
    
    try {
      MailApp.sendEmail(
        CONFIG.HOLGER_EMAIL,
        '⚠️ FEHLER: Erinnerungs-System',
        'Fehler in checkAndSendReminders:\n' + error.message
      );
    } catch (e) {
      Logger.log('Konnte Fehlerbenachrichtigung nicht versenden');
    }
  }
}

/**
 * ============================================================================
 * ANFRAGE-VERARBEITUNG
 * ============================================================================
 */
function verarbeiteAnfrage(sheet, anfrage, colIndex, heute) {
  const angebotDatum = anfrage.angebotDatum || anfrage.datum;
  if (!angebotDatum) return 0;
  
  const tagesSeitAngebot = Math.floor((heute - angebotDatum) / (1000 * 60 * 60 * 24));
  
  switch (anfrage.status) {
    case 'NEU':
      if (tagesSeitAngebot >= CONFIG.NACHFASS_1_TAGE) {
        Logger.log(`📧 Nachfass 1 für: ${anfrage.unternehmen}`);
        sendNachfassEmail(anfrage, 1);
        updateStatus(sheet, anfrage.rowNum, colIndex.status, 'NACHFASSEN_1');
        return 1;
      }
      break;
      
    case 'NACHFASSEN_1':
      if (tagesSeitAngebot >= CONFIG.NACHFASS_2_TAGE) {
        Logger.log(`📧 Nachfass 2 für: ${anfrage.unternehmen}`);
        sendNachfassEmail(anfrage, 2);
        updateStatus(sheet, anfrage.rowNum, colIndex.status, 'NACHFASSEN_2');
        return 1;
      }
      break;
      
    case 'NACHFASSEN_2':
      if (tagesSeitAngebot >= CONFIG.NACHFASS_3_TAGE) {
        Logger.log(`📧 Nachfass 3 für: ${anfrage.unternehmen}`);
        sendNachfassEmail(anfrage, 3);
        updateStatus(sheet, anfrage.rowNum, colIndex.status, 'NACHFASSEN_3');
        return 1;
      }
      break;
      
    case 'AUFTRAG':
      if (anfrage.auftragDatum) {
        const tagesSeitAuftrag = Math.floor((heute - anfrage.auftragDatum) / (1000 * 60 * 60 * 24));
        
        // FIX: Nur EINMAL versendet (nicht täglich!)
        if (tagesSeitAuftrag >= CONFIG.RECHNUNG_ERINNERUNG_TAGE && 
            !anfrage.rechnungDatum && 
            !anfrage.rechnungErinnerungVersendet) {
          
          Logger.log(`⚠️ Rechnungs-Erinnerung für: ${anfrage.unternehmen}`);
          sendRechnungsErinnerung(anfrage, tagesSeitAuftrag);
          
          if (colIndex.rechnungErinnerungVersendet >= 0) {
            updateDatum(sheet, anfrage.rowNum, colIndex.rechnungErinnerungVersendet, 'JA');
          }
          return 1;
        }
      }
      break;
      
    case 'RECHNUNG':
      if (anfrage.rechnungDatum) {
        const tagesSeitRechnung = Math.floor((heute - anfrage.rechnungDatum) / (1000 * 60 * 60 * 24));
        if (tagesSeitRechnung >= CONFIG.REZENSION_ANFRAGE_TAGE && !anfrage.rezensionDatum) {
          Logger.log(`⭐ Rezensions-Anfrage für: ${anfrage.unternehmen}`);
          sendRezensionsAnfrage(anfrage);
          updateStatus(sheet, anfrage.rowNum, colIndex.status, 'ABGESCHLOSSEN');
          updateDatum(sheet, anfrage.rowNum, colIndex.rezensionDatum);
          return 1;
        }
      }
      break;
  }
  
  return 0;
}

/**
 * ============================================================================
 * NACHFASS-EMAILS
 * ============================================================================
 */
function sendNachfassEmail(anfrage, stufe) {
  try {
    let betreff, text;
    
    switch (stufe) {
      case 1:
        betreff = 'Noch Fragen zu Ihrer Audit-Vorbereitung? | QM-Guru';
        text = `Guten Tag ${anfrage.ansprechpartner},

vor einigen Tagen haben Sie sich für unsere Audit-Vorbereitung zur ISO 9001 Zertifizierung interessiert.

Ich wollte kurz nachfragen, ob Sie noch Fragen zum Angebot haben oder ob ich Ihnen weitere Informationen zusenden kann.

Falls Sie bereits eine Entscheidung getroffen haben – lassen Sie es mich gerne wissen.

Ich freue mich auf Ihre Rückmeldung!

Mit freundlichen Grüßen
Holger Großer

QM-Guru | QM-Dienstleistungen
Tel: 0911-49522541
Email: ${CONFIG.HOLGER_EMAIL}
Web: www.qm-guru.de`;
        break;
        
      case 2:
        betreff = 'Audit-Vorbereitung – Kurze Rückfrage | QM-Guru';
        text = `Guten Tag ${anfrage.ansprechpartner},

ich melde mich nochmals bezüglich Ihrer Anfrage zur Audit-Vorbereitung für ISO 9001.

Viele meiner Kunden haben zu Beginn Fragen zu:
• Dem genauen Ablauf der Implementierung
• Der Zeitdauer bis zur fertigen Dokumentation
• Den ISO 9001-Anforderungen im Detail
• Möglichen Fördergelder (BAFA)

Gerne beantworte ich Ihre Fragen in einem kurzen Telefonat (15 Min., kostenlos).

Soll ich Sie anrufen? Nennen Sie mir einfach einen passenden Termin.

Mit freundlichen Grüßen
Holger Großer

QM-Guru | QM-Dienstleistungen
Tel: 0911-49522541`;
        break;
        
      case 3:
        betreff = 'Letzte Nachfrage: Audit-Vorbereitung | QM-Guru';
        text = `Guten Tag ${anfrage.ansprechpartner},

dies ist meine letzte Nachfrage zu Ihrem Interesse an unserer Audit-Vorbereitung.

Falls das Thema aktuell nicht mehr relevant ist – kein Problem. 
Falls Sie später darauf zurückkommen möchten, stehe ich Ihnen gerne zur Verfügung.

Ich wünsche Ihnen viel Erfolg!

Mit freundlichen Grüßen
Holger Großer

QM-Guru | QM-Dienstleistungen
Tel: 0911-49522541
Email: ${CONFIG.HOLGER_EMAIL}`;
        break;
    }
    
    MailApp.sendEmail({
      to: anfrage.email,
      subject: betreff,
      body: text,
      replyTo: CONFIG.HOLGER_EMAIL,
      name: CONFIG.EMAIL_FROM_NAME
    });
    
    Logger.log(`✅ Nachfass ${stufe} versendet an: ${anfrage.email}`);
    
  } catch (error) {
    Logger.log(`❌ Fehler beim Nachfass ${stufe}: ${error.message}`);
  }
}

/**
 * ============================================================================
 * RECHNUNGS-ERINNERUNG (MIT PROJEKTLEITER CC) ✅
 * ============================================================================
 */
function sendRechnungsErinnerung(anfrage, tage) {
  try {
    const projektleiter = getProjektleiter(anfrage.projektleiter);
    
    const text = `Hallo Holger,

Der Auftrag von ${anfrage.unternehmen} (${anfrage.ansprechpartner}) ist jetzt ${tage} Tage alt.

📋 Zeit, die Rechnung zu schreiben!

Kontakt-Details:
• Email: ${anfrage.email}
• Telefon: ${anfrage.telefon}
• Unternehmen: ${anfrage.unternehmen}
${projektleiter ? '• Projektleiter: ' + projektleiter.name : ''}

---
Automatische Erinnerung vom QM-Guru Erinnerungs-System`;

    const ccAddresses = [];
    if (projektleiter && projektleiter.email) {
      ccAddresses.push(projektleiter.email);
      Logger.log('   ✅ Projektleiter CC: ' + projektleiter.email);
    }

    const emailConfig = {
      to: CONFIG.HOLGER_EMAIL,
      subject: `⚠️ ERINNERUNG: Rechnung schreiben für ${anfrage.unternehmen}`,
      body: text,
      replyTo: CONFIG.HOLGER_EMAIL
    };
    
    if (ccAddresses.length > 0) {
      emailConfig.cc = ccAddresses.join(',');
    }

    MailApp.sendEmail(emailConfig);
    
    Logger.log(`✅ Rechnungs-Erinnerung versendet`);
    if (projektleiter) {
      Logger.log(`✅ Mit Projektleiter CC: ${projektleiter.name}`);
    }
    
  } catch (error) {
    Logger.log(`❌ Fehler bei Rechnungs-Erinnerung: ${error.message}`);
  }
}

/**
 * ============================================================================
 * REZENSIONS-ANFRAGE (MIT GOOGLE REVIEW LINK) ✅
 * ============================================================================
 */
function sendRezensionsAnfrage(anfrage) {
  try {
    const text = `Guten Tag ${anfrage.ansprechpartner},

vielen Dank nochmals für die Zusammenarbeit bei Ihrer Audit-Vorbereitung zur ISO 9001 Zertifizierung.

Ich hoffe, Sie sind zufrieden mit dem Ergebnis!

Darf ich Sie um einen kleinen Gefallen bitten?

Eine kurze Google-Bewertung würde mir sehr helfen, weitere Kunden zu erreichen:
👉 ${CONFIG.GOOGLE_REVIEW_LINK}

Nur 2-3 Sätze reichen völlig aus. Vielen Dank!

Mit freundlichen Grüßen
Holger Großer

QM-Guru | QM-Dienstleistungen
Tel: 0911-49522541
Email: ${CONFIG.HOLGER_EMAIL}`;

    MailApp.sendEmail({
      to: anfrage.email,
      subject: 'Kurze Bitte: Ihre Erfahrung mit QM-Guru 😊',
      body: text,
      replyTo: CONFIG.HOLGER_EMAIL,
      name: CONFIG.EMAIL_FROM_NAME
    });
    
    Logger.log(`✅ Rezensions-Anfrage versendet an: ${anfrage.email}`);
    
  } catch (error) {
    Logger.log(`❌ Fehler bei Rezensions-Anfrage: ${error.message}`);
  }
}

/**
 * ============================================================================
 * HILFSFUNKTIONEN
 * ============================================================================
 */

function ermittleSpaltenfeldMapping(headers) {
  return {
    datum: headers.indexOf('Datum'),
    unternehmen: headers.indexOf('Unternehmen'),
    ansprechpartner: headers.indexOf('Ansprechpartner'),
    email: headers.indexOf('Email'),
    telefon: headers.indexOf('Telefon'),
    status: headers.indexOf('Status'),
    angebotDatum: headers.indexOf('Angebot_Datum'),
    angebotId: headers.indexOf('Angebot_ID'),
    projektleiter: headers.indexOf('Projektleiter'),
    auftragDatum: headers.indexOf('Auftrag_Datum'),
    rechnungDatum: headers.indexOf('Rechnung_Datum'),
    rechnungErinnerungVersendet: headers.indexOf('Rechnung_Erinnerung_Versendet'),
    betrag: headers.indexOf('Betrag'),
    rezensionDatum: headers.indexOf('Rezension_Datum'),
    notizen: headers.indexOf('Notizen')
  };
}

function getProjektleiter(projektleiterName) {
  if (!projektleiterName) return null;
  
  for (const name in CONFIG.PROJEKTLEITER) {
    if (name === projektleiterName || 
        CONFIG.PROJEKTLEITER[name].email === projektleiterName) {
      return { name: CONFIG.PROJEKTLEITER[name].name, email: CONFIG.PROJEKTLEITER[name].email };
    }
  }
  
  return null;
}

function updateStatus(sheet, rowNum, colIndex, newStatus) {
  try {
    sheet.getRange(rowNum, colIndex + 1).setValue(newStatus);
  } catch (error) {
    Logger.log('⚠️ Fehler beim Status-Update: ' + error.message);
  }
}

function updateDatum(sheet, rowNum, colIndex, value = null) {
  try {
    if (colIndex >= 0) {
      const wert = value || new Date();
      sheet.getRange(rowNum, colIndex + 1).setValue(wert);
    }
  } catch (error) {
    Logger.log('⚠️ Fehler beim Datum-Update: ' + error.message);
  }
}

function formatiereDatum(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString('de-DE', options);
}

/**
 * ============================================================================
 * GET & TEST FUNKTIONEN
 * ============================================================================
 */

function doGet(e) {
  return HtmlService.createHtmlOutput(`
    <html>
      <head>
        <title>Audit-Vorbereitung Angebots-Engine</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          h1 { color: #1E3A5F; }
          .status { padding: 20px; background: #f0fdf4; border-radius: 8px; color: #166534; }
          .warning { color: #d97706; padding: 10px; background: #fef3c7; margin: 20px 0; border-radius: 4px; }
          .version { color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>✅ Audit-Vorbereitung Angebots-Automatisierung</h1>
        <div class="status">
          <p><strong>Status:</strong> Google Apps Script läuft! ✓</p>
          <p><strong>Version:</strong> 2.1 FIX (Kombinierte Version)</p>
          <p><strong>Features:</strong> Angebotsgenerierung + Erinnerungen</p>
        </div>
        <div class="warning">
          <strong>⚠️ WICHTIG:</strong> Überprüfe CONFIG Konstanten:
          <ul>
            <li>TEMPLATE_FILE_ID: Aus Google Drive abrufen</li>
            <li>PROJEKTLEITER: 4 PL konfiguriert ✓</li>
            <li>GOOGLE_REVIEW_LINK: ✓</li>
          </ul>
        </div>
        <p class="version">
          Zeitstempel: ${new Date().toLocaleString('de-DE')}
        </p>
      </body>
    </html>
  `);
}

function validateSheetStructure() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    Logger.log('📊 Google Sheet Spalten:');
    headers.forEach((header, index) => {
      Logger.log(`  ${index + 1}. ${header}`);
    });
    
  } catch (error) {
    Logger.log('❌ Fehler: ' + error.message);
  }
}

function checkEmailQuota() {
  const remaining = MailApp.getRemainingDailyQuota();
  Logger.log(`📧 Verbleibende Emails heute: ${remaining}/100`);
}

function addTestAnfrage() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME);
    
    const testDatum = new Date();
    testDatum.setDate(testDatum.getDate() - 3);
    
    sheet.appendRow([
      testDatum,
      'Test GmbH',
      'Max Mustermann',
      Session.getActiveUser().getEmail(),
      '0123-456789',
      'NEU',
      testDatum,
      'test-pdf-id',
      'Nina Schröder',
      '',
      '',
      '',
      '1000.00',
      '',
      'Test-Eintrag'
    ]);
    
    Logger.log('✅ Test-Anfrage hinzugefügt.');
    
  } catch (error) {
    Logger.log('❌ Fehler: ' + error.message);
  }
}
