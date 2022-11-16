import path from "path";
import fs from "fs-extra";

class BuildObj {
    /**
     * 【编译主进程代码】
     *  Vite 在编译之前会清空 dist 目录，所以之前生成的 mainEntry.js 文件也被删除了，这里通过 buildMain 再次编译
     */
    buildMain() {
        require("esbuild").buildSync({
            entryPoints: ["./src/main/mainEntry.ts"],
            bundle: true,
            platform: "node",
            minify: true,
            outfile: "./dist/mainEntry.js",
            external: ["electron"],
        });
    }

    /**
     * 【为生产环境准备 package.json】
     * 用户安装并启动应用程序后，实际上是通过 Electron 启动了一个 Node.js 的项目，所以需要准备一个 package.json 文件
     */
    preparePackageJson() {
        let pkgJsonPath = path.join(process.cwd(), "package.json");
        let localPkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
        let electronConfig = localPkgJson.devDependencies.electron.replace(
            "^",
            ""
        );
        localPkgJson.main = "mainEntry.js";
        delete localPkgJson.scripts;
        delete localPkgJson.devDependencies;
        localPkgJson.devDependencies = { electron: electronConfig };
        let tarJsonPath = path.join(process.cwd(), "dist", "package.json");
        fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson));
        fs.mkdirSync(path.join(process.cwd(), "dist/node_modules"));
    }

    /**
     * 【使用 electron-builder 制成安装包】
     */
    buildInstaller() {
        let options = {
            config: {
                directories: {
                    output: path.join(process.cwd(), "release"),
                    app: path.join(process.cwd(), "dist"),
                },
                files: ["**"],
                extends: null,
                productName: "JueJin",
                appId: "com.juejin.desktop",
                asar: true,
                nsis: {
                    oneClick: true,
                    perMachine: true,
                    allowToChangeInstallationDirectory: false,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true,
                    shortcutName: "juejinDesktop",
                },
                publish: [
                    { provider: "generic", url: "http://localhost:5500/" },
                ],
            },
            project: process.cwd(),
        };
        return require("electron-builder").build(options);
    }

    /**
     * electron-build 做了什么
     *
     * 1. 收集应用程序的配置信息，如应用图标、名称等
     * 2. 检查 package.json 文件，根据 dependencies 安装相关依赖
     * 3. 根据用户配置的 asar(true|false)，判断是否需要把输出目录合并成 asar 文件
     * 4. 把 electron 可执行程序及其依赖的动态链接库及二进制资源拷贝到安装包生成目录下的 win-ia32-unpacked 子目录内
     * 5. 检查用户配置信息中是否指定了 extraResources 配置项，有就把相应的文件按照配置的规则，拷贝到对应的目录中
     * 6. 根据配置信息通过二进制资源修改器修改 electron.exe 的文件名和属性信息（版本号、版权信息、应用程序的图标等）
     * 7. 如果开发者在配置信息中指定了签名信息，electron-builder 会使用一个应用程序签名工具来为可执行文件签名
     * 8. 通过 7z 压缩工具，把子目录 win-ia32-unpacked 下的内容压缩成一个名为 yourProductName-1.3.6-ia32.nsis.7z 的压缩包
     * 9. 通过 NSIS 工具生成卸载程序的可执行文件，该卸载程序记录了 win-ia32-unpacked 目录下所有文件的相对路径。当用户卸载时，卸载程序会根据这些路径删除对应的文件、清除相关的注册表信息
     * 10.通过 NSIS 工具生成安装程序的可执行文件，把压缩包和卸载程序当作资源写入这个安装程序的可执行文件中，该文件会读取自身的资源，并把这些资源释放到用户指定的安装目录下
     */
}

/**
 * 标准的 Rollup 插件（Vite 底层就是 Rollup，所以 Vite 兼容 Rollup 的插件）
 */
export let buildPlugin = () => {
    return {
        name: "build-plugin",
        // closeBundle 钩子
        closeBundle: () => {
            let buildObj = new BuildObj();
            buildObj.buildMain();
            buildObj.preparePackageJson();
            buildObj.buildInstaller();
        },
    };
};
