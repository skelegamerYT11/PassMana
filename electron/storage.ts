import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import sodium from 'libsodium-wrappers-sumo';

const getVaultPath = () => path.join(app.getPath('userData'), 'vault.enc');

export interface VaultFile {
  salt: string; // base64
  nonce: string; // base64
  ciphertext: string; // base64
}

export function vaultExists(): boolean {
  return fs.existsSync(getVaultPath());
}

export function readVaultFile(): VaultFile | null {
  try {
    if (!vaultExists()) return null;
    const data = fs.readFileSync(getVaultPath(), 'utf8');
    return JSON.parse(data) as VaultFile;
  } catch (err) {
    console.error("Failed to read vault", err);
    return null;
  }
}

export function writeVaultFile(vault: VaultFile) {
  fs.writeFileSync(getVaultPath(), JSON.stringify(vault, null, 2), { encoding: 'utf8' });
}
