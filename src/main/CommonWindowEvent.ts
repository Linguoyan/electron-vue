import { BrowserWindow, ipcMain, app } from "electron";

// 主进程公共消息处理逻辑
export class CommonWindowEvent {
    private static getWin(event: any) {
        // 返回给定 browserView 的窗口
        return BrowserWindow.fromWebContents(event.sender);
    }

    public static listen() {
        // 最小化
        ipcMain.handle("minimizeWindow", (e) => {
            this.getWin(e)?.minimize();
        });

        // 最大化
        ipcMain.handle("maxmizeWindow", (e) => {
            this.getWin(e)?.maximize();
        });

        // 还原
        ipcMain.handle("unmaximizeWindow", (e) => {
            this.getWin(e)?.unmaximize();
        });

        // 隐藏
        ipcMain.handle("hideWindow", (e) => {
            this.getWin(e)?.hide();
        });

        // 显示窗口
        ipcMain.handle("showWindow", (e) => {
            // this.getWin(e)?.show();
            console.log("###-", e);
        });

        // 关闭
        ipcMain.handle("closeWindow", (e) => {
            this.getWin(e)?.close();
        });

        // 窗口是否可被用户手动调整大小
        ipcMain.handle("resizable", (e) => {
            return this.getWin(e)?.isResizable();
        });

        // 获取某个路径
        ipcMain.handle("getPath", (e, name: any) => {
            return app.getPath(name);
        });
    }

    // 主进程公共事件处理逻辑
    public static regWinEvent(win: BrowserWindow) {
        win.on("maximize", () => {
            win.webContents.send("windowMaximized");
        });
        win.on("unmaximize", () => {
            win.webContents.send("windowUnmaximized");
        });
    }
}
