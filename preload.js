const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    adjustHeight: (height) => ipcRenderer.send('adjust-height', height),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
    setOpacity: (opacity) => ipcRenderer.send('set-opacity', opacity),
});
