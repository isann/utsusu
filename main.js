'use strict';

const electron = require('electron');
const {clipboard} = require('electron');
// アプリケーションをコントロールするモジュール
const app = electron.app;
// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;
// Main - Render 通信モジュール
const ipcMain = electron.ipcMain;
const globalShortcut = electron.globalShortcut;

// メインウィンドウはGCされないようにグローバル宣言
let captureWindow = null;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
    // if (process.platform !== 'darwin') {
    //     app.quit();
    // }
});

function openCaptureWindow(){
    // クリップボードから画像を読み取り
    const image = clipboard.readImage();

    // 画像が存在するかチェック
    if (!image.isEmpty()) {
        // 画像のサイズを取得
        const size = image.getSize();
        // console.log(`幅: ${size.width}px, 高さ: ${size.height}px`);

        captureWindow = new BrowserWindow({
            left: 0,
            top: 0,
            width: size.width,
            height: size.height,
            minWidth: 400,
            minHeight: 400,
            frame: false,
            show: false,
            transparent: false,
            resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: `${__dirname}/assets/js/preload.js`,
                devTools: false,
                nativeWindowOpen: false,
            }
        });
        captureWindow.loadURL(`file://${__dirname}/assets/views/capture.html`);
        // captureWindow.webContents.openDevTools();
        captureWindow.show();
    }
}

// Electronの初期化完了後に実行
app.on('ready', function () {

    const ret = globalShortcut.register('CommandOrControl+L', () => {
        openCaptureWindow();
    });
    if (!ret) {
        console.log('registration failed')
    }

});

// clipboardの読み書き機能をIPCで公開
ipcMain.handle('clipboard:writeText', (event, text) => {
    clipboard.writeText(text);
});

ipcMain.handle('clipboard:readText', () => {
    return clipboard.readText();
});

ipcMain.handle('clipboard:readImage', () => {
    return clipboard.readImage();
});

/**
 * Debug ipc receiver.
 */
ipcMain.on('console', (ev, message) => {
    console.log(message);
});
