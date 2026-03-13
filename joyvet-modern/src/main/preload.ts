import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    query: (sql: string, params: any[]) => ipcRenderer.invoke('database:query', sql, params),
    transaction: (operations: any[]) => ipcRenderer.invoke('database:transaction', operations),
  },
  app: {
    getVersion: () => process.versions.app,
    getPlatform: () => process.platform,
  },
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      database: {
        query: (sql: string, params: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
        transaction: (operations: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      app: {
        getVersion: () => string;
        getPlatform: () => string;
      };
    };
  }
}
