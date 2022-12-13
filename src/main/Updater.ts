import { dialog } from "electron";
import { autoUpdater } from "electron-updater";

/**
 * 全量升级：
 * Electron 内置了一个自动升级模块 autoUpdater，但在这里并没有使用
 * 因为 electron-updater 与 electron-builder 结合得更紧密，更容易使用
 */

export class Updater {
    static check() {
        autoUpdater.checkForUpdates();
        autoUpdater.on("update-downloaded", async () => {
            await dialog.showMessageBox({
                message: "有可用的升级",
            });
            autoUpdater.quitAndInstall();
        });
    }
}
