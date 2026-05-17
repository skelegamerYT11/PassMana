<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Check_green_icon.svg/1200px-Check_green_icon.svg.png" width="80" alt="Shield Icon" />
  <h1>PassMana</h1>
  <p><strong>Un Password Manager Desktop ad Architettura Zero-Knowledge.</strong></p>
  <p>Nessun Cloud. Nessun Server. Solo crittografia matematica estrema sul tuo dispositivo.</p>

  <p>
    <a href="#features">Features</a> •
    <a href="#security">Sicurezza</a> •
    <a href="#installation">Installazione</a> •
    <a href="#build">Build</a>
  </p>
</div>

---

## 🛡️ Perché PassMana?

Nel panorama odierno, la maggior parte dei furti di password avviene quando i database cloud dei grandi gestori vengono compromessi. **PassMana è diverso.** Non essendoci server, l'unica superficie di attacco è il tuo computer. 

Tutto il codice è **100% Open Source**, così puoi ispezionare tu stesso che i tuoi dati non vengano mai inviati via rete e che la crittografia implementata segua i più alti standard militari.

## ✨ Features

- **Totalmente Offline:** Nessuna richiesta HTTP, nessuna dipendenza dal cloud. I tuoi dati restano sul tuo SSD.
- **Crittografia Inviolabile:** Utilizza `libsodium` con **XChaCha20-Poly1305** per i dati e **Argon2id** per la Master Password.
- **In-Memory Decryption:** I dati in chiaro vivono solo nella memoria RAM del Main Process di Electron e vengono distrutti (wiped) non appena l'app viene chiusa o bloccata. Nessuna traccia sul disco.
- **Interfaccia Elegante:** Dark mode minimalista per un'esperienza d'uso fluida e concentrata.
- **Generatore Integrato:** Crea password a 20 caratteri resistenti a qualsiasi attacco brute-force.

## 🔐 Architettura di Sicurezza (Zero-Knowledge)

La sicurezza di PassMana è garantita dalla matematica, non dalla fiducia.

1. **La tua Master Password non viene mai salvata.** 
2. All'avvio, la tua Master Password viene fatta passare attraverso **Argon2id** (con parametri di costo RAM e CPU elevatissimi) per generare una chiave crittografica a 256-bit.
3. Questa chiave viene utilizzata da **XChaCha20-Poly1305** per tentare di decriptare il file locale `vault.enc`.
4. Se la password è sbagliata, la matematica semplicemente fallisce. Se è giusta, i dati vengono caricati in RAM.
5. Quando aggiungi o modifichi una password, l'intero Vault viene ri-criptato prima di toccare il disco.

## 🚀 Installazione (Sviluppo)

Assicurati di avere [Node.js](https://nodejs.org/) installato.

```bash
# 1. Clona il repository
git clone https://github.com/IL_TUO_USERNAME/PassMana.git
cd PassMana

# 2. Installa le dipendenze
npm install

# 3. Avvia in modalità sviluppo
npm run dev
```

## 📦 Build (Produzione)

Per creare l'eseguibile di installazione (`.exe`) per il tuo sistema operativo:

```bash
npm run build:electron
```
L'installer si troverà nella cartella `release/`.

## ⚠️ Vulnerabilità Note (Danger Zone)

Essendo un software 100% offline, PassMana è vulnerabile **solo** a queste tre cose:
1. **Malware / Keylogger:** Se il tuo PC è compromesso, un hacker può leggere la tastiera mentre digiti la Master Password.
2. **Fattore Umano:** Ingegneria sociale (phishing) o coercizione fisica.
3. **Password Debole:** Se usi `12345678` come Master Password, Argon2id ti rallenterà, ma un attacco brute-force mirato la troverà. **Usa una Passphrase di 5 parole casuali.**

---

<div align="center">
  <i>Costruito con React, Vite, Electron e Libsodium.</i>
</div>
