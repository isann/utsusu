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

// システムトレイアイコンの追加
const path = require('path');
const { Tray, nativeImage } = require('electron');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
    // if (process.platform !== 'darwin') {
    //     app.quit();
    // }
});

/**
 * Opens a capture window if an image is available in the clipboard. The size of the window
 * will match the dimensions of the image. The window is created with specific configurations
 * such as being frameless, non-resizable, and always staying on top.
 *
 * @return {void} Returns nothing. The function creates and displays a new window if an image is available.
 */
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

/**
 * Retrieves the file path of the tray icon based on the application environment.
 * If the application is packaged, it uses the `process.resourcesPath` to locate the resource directory.
 * If the application is in development, it uses `__dirname` to locate the resource.
 *
 * @return {string} The file path to the tray icon in the application's assets directory.
 */
function getTrayIconPath() {
    // 開発時: __dirname はプロジェクト内の main.js がある場所
    // パッケージ後: __dirname は app.asar 内の main.js がある場所
    // 多くの場合 __dirname ベースでも動きますが、
    // アイコンを extraResources に出す場合は process.resourcesPath を使います。
    if (app.isPackaged) {
        // extraResources に出す構成の場合はこちら
        return path.join(process.resourcesPath, 'assets', 'icons', 'png', '32x32.png');
    } else {
        return path.join(__dirname, 'assets', 'icons', 'png', '32x32.png');
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

    // システムトレイアイコン（オプション）
    const iconPath = getTrayIconPath();
    const icon = nativeImage.createFromPath(iconPath);
    const tray = new Tray(icon);
    tray.setToolTip('kiritoru2');
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
