import { protocol } from "electron";
import fs from "fs";
import path from "path";

// 为自定义的app协议提供特权
let schemeConfig = {
    standard: true,
    supportFetchAPI: true,
    bypassCSP: true,
    corsEnabled: true,
    stream: true,
};

protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: schemeConfig },
]);

export class CustomScheme {
    // 根据文件扩展名获取mime-type
    private static getMimeType(extension: string) {
        let mimeType = "";
        if (extension === ".js") {
            mimeType = "text/javascript";
        } else if (extension === ".html") {
            mimeType = "text/html";
        } else if (extension === ".css") {
            mimeType = "text/css";
        } else if (extension === ".svg") {
            mimeType = "image/svg+xml";
        } else if (extension === ".json") {
            mimeType = "application/json";
        }
        return mimeType;
    }

    /**
     * 注册自定义app协议
     * 该代码在主进程 app ready 前，通过 protocol 对象的 registerSchemesAsPrivileged 方法为名为 app 的 scheme 注册了特权
     * 当我们加载类似 app://index.html 这样的路径时，该回调函数将被执行
     */
    static registerScheme() {
        protocol.registerStreamProtocol("app", (request, callback) => {
            let pathName = new URL(request.url).pathname;
            let extension = path.extname(pathName).toLowerCase();
            if (extension == "") {
                pathName = "index.html";
                extension = ".html";
            }
            let tarFile = path.join(__dirname, pathName);

            /**
             * 响应的 data 属性为目标文件的可读数据流
             * 这是我们用 registerStreamProtocol 方法注册自定义协议的原因，当你的静态文件比较大时，不必读出整个文件再给出响应
             */
            callback({
                statusCode: 200,
                headers: { "content-type": this.getMimeType(extension) },
                data: fs.createReadStream(tarFile),
            });
        });
    }
}
