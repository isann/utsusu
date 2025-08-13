const { contextBridge, ipcRenderer } = require('electron');

// まずipcRendererを定義
window.ipcRenderer = ipcRenderer;
window.desktopCapturer = require('electron').desktopCapturer;

// elClipboard をレンダラから参照できるように公開
// contextIsolation が false のため、window に直接ぶら下げる
window.elClipboard = {
    writeText: (text) => ipcRenderer.invoke('clipboard:writeText', text),
    readText: () => ipcRenderer.invoke('clipboard:readText'),
    readImage: () => ipcRenderer.invoke('clipboard:readImage')
};

// 将来 contextIsolation を true にする場合に備えて contextBridge でも公開しておく（true/false どちらでも安全）
try {
    contextBridge.exposeInMainWorld('elClipboard', window.elClipboard);
} catch (e) {
    // contextIsolation: false の環境では contextBridge は無視されても問題ない
}
