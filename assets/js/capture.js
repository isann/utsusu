'use strict';

function render() {
    if (window.elClipboard) {
        ipcRenderer.send('console', 'window.elClipboard');
    }

    window.elClipboard.readImage().then(image => {
        // 画像が存在するかチェック
        if (!image.isEmpty()) {
            try {
                // 既存の画像をクリア
                const oldImg = document.querySelector('img.__utsusu_clip_img');
                if (oldImg) oldImg.remove();

                // toPNG()の代わりにtoDataURL()を使用
                const dataURL = image.toDataURL();
                const img = document.createElement('img');
                img.className = '__utsusu_clip_img';
                img.src = dataURL; // 直接dataURLを使用
                document.body.appendChild(img);
            } catch (error) {
                ipcRenderer.send('console', `エラー: ${error.message}`);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    ipcRenderer.send('console', 'window.elClipboard:');
    ipcRenderer.send('console', 'window.elClipboard:', window.elClipboard);

    if (window.elClipboard) {
        // クリップボードにテキストを書き込み
        await window.elClipboard.writeText('Hello World');

        // クリップボードからテキストを読み取り
        const text = await window.elClipboard.readText();
        console.log('クリップボードのテキスト:', text);

        // クリップボードから画像を読み取り
        const imageData = await window.elClipboard.readImage();
        if (imageData) {
            console.log('画像データ:', imageData);
        }
    } else {
        ipcRenderer.send('console', 'elClipboard API is not available');
    }
});

let __lastScaleKey = null; // '1' or '2'

window.addEventListener('load', function () {
    window.addEventListener('keydown', function (e) {
        const keyCode = e.keyCode;
        // キー押しっぱなしのオートリピートは無視
        if (e.repeat && (keyCode === 49 || keyCode === 50)) return;
        switch (keyCode) {
            case 13:
                // Enter key press → 閉じる
                window.close();
                break;
            case 49: // '1'
                // 連続の 1 は無視（半分への連続縮小を禁止）
                if (__lastScaleKey === 49) return;
                ipcRenderer.send('window:scale', 0.5);
                __lastScaleKey = 49;
                break;
            case 50: // '2'
                // 拡大は常に許可し、連続縮小解除のトグルにもする
                if (__lastScaleKey === 50) return;
                ipcRenderer.send('window:scale', 2);
                __lastScaleKey = 50;
                break;
            default:
                // その他のキーで連続ガードを解除
                __lastScaleKey = null;
                break;
        }
    });
    render();
});
