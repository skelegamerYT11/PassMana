export interface VaultAPI {
  exists: () => Promise<boolean>;
  setup: (password: string) => Promise<boolean>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<boolean>;
  isUnlocked: () => Promise<boolean>;
  getEntries: () => Promise<any[]>;
  saveEntries: (entries: any[]) => Promise<boolean>;
}

declare global {
  interface Window {
    vaultAPI: VaultAPI;
  }
}
