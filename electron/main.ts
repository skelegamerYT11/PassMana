import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import sodium from 'libsodium-wrappers-sumo';
import { deriveKey, encryptData, decryptData, generateSalt } from './crypto.js';
import { vaultExists, readVaultFile, writeVaultFile, VaultFile } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory state (wiped on lock/quit)
let activeKey: Uint8Array | null = null;
let unlockedVaultData: any[] = []; // Array of password entries

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#f8fafc',
    },
    backgroundColor: '#0f172a'
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Wipe memory
  if (activeKey) {
    sodium.memzero(activeKey);
    activeKey = null;
  }
  unlockedVaultData = [];
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

ipcMain.handle('vault:exists', () => {
  return vaultExists();
});

ipcMain.handle('vault:setup', async (_, password: string) => {
  try {
    const salt = await generateSalt();
    const key = await deriveKey(password, salt);
    
    // Encrypt empty array
    const { ciphertext, nonce } = await encryptData(JSON.stringify([]), key);
    
    const vault: VaultFile = {
      salt: sodium.to_base64(salt),
      nonce,
      ciphertext
    };
    
    writeVaultFile(vault);
    
    // Wipe key from memory since we just set it up, let user login.
    sodium.memzero(key);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
});

ipcMain.handle('vault:unlock', async (_, password: string) => {
  try {
    const vault = readVaultFile();
    if (!vault) return false;
    
    const salt = sodium.from_base64(vault.salt);
    const key = await deriveKey(password, salt);
    
    const decryptedString = await decryptData(vault.ciphertext, vault.nonce, key);
    
    // If decryption succeeds, it means password is correct.
    unlockedVaultData = JSON.parse(decryptedString);
    activeKey = key; // Keep key in memory for saving
    
    return true;
  } catch (err) {
    // Decryption failed (wrong password)
    return false;
  }
});

ipcMain.handle('vault:lock', () => {
  if (activeKey) {
    sodium.memzero(activeKey);
    activeKey = null;
  }
  unlockedVaultData = [];
  return true;
});

ipcMain.handle('vault:isUnlocked', () => {
  return activeKey !== null;
});

ipcMain.handle('vault:getEntries', () => {
  if (!activeKey) throw new Error("Vault is locked");
  return unlockedVaultData;
});

ipcMain.handle('vault:saveEntries', async (_, entries: any[]) => {
  if (!activeKey) throw new Error("Vault is locked");
  
  try {
    const vault = readVaultFile();
    if (!vault) throw new Error("Vault file missing");

    unlockedVaultData = entries; // Update in memory

    const { ciphertext, nonce } = await encryptData(JSON.stringify(entries), activeKey);
    
    vault.ciphertext = ciphertext;
    vault.nonce = nonce;
    
    writeVaultFile(vault);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
});

ipcMain.handle('titlebar:update', (event, color: string, symbolColor: string) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && win.setTitleBarOverlay) {
    try {
      win.setTitleBarOverlay({
        color: color,
        symbolColor: symbolColor,
      });
    } catch (e) {
      console.error("Failed to update titlebar overlay:", e);
    }
  }
});

