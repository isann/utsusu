'use strict';

function render() {
    if (window.elClipboard) {
        ipcRenderer.send('console', 'window.elClipboard');
    }

    window.elClipboard.readImage().then(image => {
        // 画像が存在するかチェック
        if (!image.isEmpty()) {
            try {
                const size = image.getSize();
                // ipcRenderer.send('console', `幅: ${size.width}px, 高さ: ${size.height}px`);
                // toPNG()の代わりにtoDataURL()を使用
                const dataURL = image.toDataURL();
                const img = document.createElement('img');
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

window.addEventListener('load', function () {
    window.addEventListener('keydown', function (e) {
        let keyCode = e.keyCode;
        switch (keyCode) {
            case 13:
                // Enter key press
                window.close();
                break;
        }
    });
    render();
});
