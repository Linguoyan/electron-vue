import { ViteDevServer } from "vite";

/**
 * 当 Vite 为我们启动 Http 服务的时候，configureServer钩子会被执行
 * 我们通过监听 server.httpServer 的 listening 事件来判断 httpServer 是否已经成功启动。如果已经成功启动了，那么就启动 Electron 应用
 *
 *
 */
export let devPlugin = () => {
    return {
        name: "dev-plugin",
        configureServer(server: ViteDevServer) {
            require("esbuild").buildSync({
                entryPoints: ["./src/main/mainEntry.ts"],
                bundle: true,
                platform: "node",
                outfile: "./dist/mainEntry.js",
                external: ["electron"],
            });

            server.httpServer.once("listening", () => {
                let { spawn } = require("child_process");
                let addressInfo = server.httpServer.address();
                let httpAddress = `http://${addressInfo.address}:${addressInfo.port}`;
                let electronProcess = spawn(
                    require("electron").toString(),
                    ["./dist/mainEntry.js", httpAddress],
                    {
                        cwd: process.cwd(), // 设置当前的工作目录
                        stdio: "inherit", // electron 进程的控制台输出, inherit: 子进程控制台输出同步到主进程
                    }
                );

                electronProcess.on("close", () => {
                    server.close();
                    process.exit();
                });
            });
        },
    };
};

// 为 vite-plugin-optimizer 插件提供的内置模块列表
export let getReplacer = () => {
    let externalModels = [
        "os",
        "fs",
        "path",
        "events",
        "child_process",
        "crypto",
        "http",
        "buffer",
        "url",
        "better-sqlite3",
        "knex",
    ];
    let result = {};
    for (let item of externalModels) {
        result[item] = () => ({
            find: new RegExp(`^${item}$`),
            code: `const ${item} = require('${item}');export { ${item} as default }`,
        });
    }
    result["electron"] = () => {
        let electronModules = [
            "clipboard",
            "ipcRenderer",
            "nativeImage",
            "shell",
            "webFrame",
        ].join(",");
        return {
            find: new RegExp(`^electron$`),
            code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
        };
    };
    return result;
};
