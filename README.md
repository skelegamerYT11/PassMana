<div align="center">
  <h1 style="font-size: 60px">🛡️ PassMana</h1>
  <p><strong>A Zero-Knowledge Desktop Password Manager.</strong></p>
  <p>No Cloud. No Servers. Just military-grade mathematics on your device.</p>

  <p>
    <strong><a href="https://skelegamerYT11.github.io/PassMana/">🌐 View the Official Website</a></strong>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#security">Security</a> •
    <a href="#installation">Installation</a> •
    <a href="#build">Build</a>
  </p>
</div>

---

## 🛡️ Why PassMana?

In today's landscape, most password breaches happen when the cloud databases of major providers are compromised. **PassMana is different.** Because there are no servers, the only attack surface is your computer.

The entire codebase is **100% Open Source**, allowing you to inspect it yourself and verify that your data is never sent over the network, and that the cryptography implements the highest security standards.

![PassMana Banner](https://imgur.com/gfRWl9h.png)


<a name="features"></a>
## ✨ Features

- **Fully Offline:** No HTTP requests, no cloud dependencies. Your data stays on your SSD.
- **Unbreakable Cryptography:** Uses `libsodium` with **XChaCha20-Poly1305** for your data and **Argon2id** for your Master Password.
- **In-Memory Decryption:** Cleartext data lives only in the RAM of the Electron Main Process and is wiped immediately when the app is locked or closed. No traces left on the disk.
- **Elegant UI:** Minimalist dark mode for a seamless, distraction-free experience.
- **Built-in Generator:** Instantly create 20-character passwords resistant to any brute-force attack.

<a name="security"></a>
## 🔐 Security Architecture (Zero-Knowledge)

PassMana's security is guaranteed by math, not trust.

1. **Your Master Password is never saved.** 
2. At startup, your Master Password is run through **Argon2id** (with extremely high RAM and CPU cost limits) to generate a 256-bit cryptographic key.
3. This key is used by **XChaCha20-Poly1305** to attempt decrypting your local `vault.enc` file.
4. If the password is wrong, the math simply fails. If it's right, the data is loaded into RAM.
5. Whenever you add or edit a password, the entire Vault is re-encrypted before it touches the disk.

<a name="installation"></a>
## 🚀 Installation (Development)

Make sure you have [Node.js](https://nodejs.org/) installed.

```bash
# 1. Clone the repository
git clone https://github.com/skelegamerYT11/PassMana.git
cd PassMana

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

<a name="build"></a>
## 📦 Build (Production)

To create the installation executable (`.exe`) for your operating system:

```bash
npm run build:electron
```
The installer will be generated in the `release/` folder.

## ⚠️ Known Vulnerabilities (Danger Zone)

Since it is a 100% offline software, PassMana is **only** vulnerable to these three vectors:
1. **Malware / Keyloggers:** If your PC is compromised, a hacker can log your keystrokes when you type the Master Password.
2. **The Human Factor:** Social engineering (phishing) or physical coercion (rubber-hose cryptanalysis).
3. **Weak Master Passwords:** If your password is `12345678`, Argon2id will slow the attacker down, but a targeted brute-force will eventually crack it. **Use a Passphrase of 5 random words.**

---

<div align="center">
  <i>Built with React, Vite, Electron, and Libsodium. <br> ✨ Vibe Coded.</i>
</div>
