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
            this.getWin(e)?.show();
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

    // 主进程公共事件处理逻辑：渲染进程中请求创建一个新窗口之前被调用，如 window.open()
    public static regWinEvent(win: BrowserWindow) {
        win.on("maximize", () => {
            win.webContents.send("windowMaximized");
        });
        win.on("unmaximize", () => {
            win.webContents.send("windowUnmaximized");
        });

        // 注册打开子窗口的回调函数
        win.webContents.setWindowOpenHandler((param) => {
            // 基础窗口配置对象
            let config: any = {
                frame: false,
                show: true,
                webPreferences: {
                    nodeIntegration: true,
                    webSecurity: false,
                    allowRunningInsecureContent: true,
                    contextIsolation: false,
                    webviewTag: true,
                    spellcheck: false,
                    disableHtmlFullscreenWindowResize: true,
                    nativeWindowOpen: true,
                },
            };

            // 开发者自定义窗口配置对象
            let features = JSON.parse(param.features);
            for (const p in features) {
                if (p === "webPreferences") {
                    for (let p2 in features.webPreferences) {
                        config.webPreferences[p2] = features.webPreferences[p2];
                    }
                } else {
                    config[p] = features[p];
                }
            }

            // modal为true，说明渲染进程希望子窗口为一个模态窗口，此时需要为子窗口提供父窗口配置项parent，值为当前窗口
            // 模态窗口是禁用父窗口的子窗口，创建模态窗口必须设置 parent 和 modal 选项
            if (config["modal"] === true) config.parent = win;

            // 允许打开窗口，并传递窗口配置对象
            return { action: "allow", overrideBrowserWindowOptions: config };
        });
    }
}
