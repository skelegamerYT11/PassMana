import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('vaultAPI', {
  exists: () => ipcRenderer.invoke('vault:exists'),
  setup: (password: string) => ipcRenderer.invoke('vault:setup', password),
  unlock: (password: string) => ipcRenderer.invoke('vault:unlock', password),
  lock: () => ipcRenderer.invoke('vault:lock'),
  isUnlocked: () => ipcRenderer.invoke('vault:isUnlocked'),
  getEntries: () => ipcRenderer.invoke('vault:getEntries'),
  saveEntries: (entries: any[]) => ipcRenderer.invoke('vault:saveEntries', entries)
});
