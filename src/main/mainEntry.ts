import { app, BrowserWindow } from "electron";
import { CommonWindowEvent } from "./CommonWindowEvent";
import { CustomScheme } from "./customScheme";

/**
 * 设置渲染进程开发者调试工具的警告，这里设置为 true 就不会再显示任何警告了
 * 如果渲染进程的代码可以访问 Node.js 的内置模块，而且渲染进程加载的页面（或脚本）来自第三方，那么恶意第三方就有可能使用 Node.js 的内置模块伤害最终用户
 * 如果你的应用不会加载任何第三方的页面或脚本，就不用担心这些安全问题
 */
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

app.on("browser-window-created", (e, win) => {
    CommonWindowEvent.regWinEvent(win);
});

// 设置成一个全局变量，避免主窗口被 JS 的垃圾回收器回收掉
let mainWindow: BrowserWindow;

/**
 * app 和 BrowserWindow 都是 Electron 的内置模块，这些内置模块是通过 ES Module 的形式导入进来的
 * Electron 的内置模块都是通过 CJS Module 的形式导出的
 * 这里之所以可以用 ES Module 导入，是因为主进程编译工作完成了相关的转化
 */

app.whenReady().then(() => {
    let config = {
        frame: false, // 无边框
        show: false, // 页面渲染完成之间先隐藏
        webPreferences: {
            nodeIntegration: true, // 把 Node.js 环境集成到渲染进程
            webSecurity: false,
            allowRunningInsecureContent: true,
            contextIsolation: false, // 同一个 JavaScript 上下文中使用 Electron API
            webviewTag: true,
            spellcheck: false,
            disableHtmlFullscreenWindowResize: true,
        },
    };
    mainWindow = new BrowserWindow(config);
    // mainWindow.webContents.openDevTools({ mode: "undocked" }); // 打开开发者调试工具

    /**
     * 当存在指定的命令行参数时，认为是开发环境，使用命令行参数加载页面
     *当不存在命令行参数时，认为是生产环境，通过app://scheme 加载页面
     */
    if (process.argv[2]) {
        mainWindow.loadURL(process.argv[2]);
    } else {
        CustomScheme.registerScheme();
        mainWindow.loadURL(`app://index.html`);
    }

    CommonWindowEvent.listen();
});
