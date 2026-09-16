const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('spendlyNative', {
  platform: process.platform,
  isElectron: true,
});
