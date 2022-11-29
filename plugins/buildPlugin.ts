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
            minify: true, // 此处是生产环境编译，需生成压缩代码
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
        // Electron 的版本号前面有"^"符号的话，要删掉。electron-builder 无法识别带 ^ 或 ~ 符号的版本号，这是个 bug
        let electronConfig = localPkgJson.devDependencies.electron.replace("^", "");
        localPkgJson.main = "mainEntry.js";
        delete localPkgJson.scripts;
        delete localPkgJson.devDependencies;
        localPkgJson.devDependencies = { electron: electronConfig };
        // 版本号随意匹配，添加这些配置后，electron-builder 就不会自动去安装这些模块
        localPkgJson.dependencies["better-sqlite3"] = "*";
        localPkgJson.dependencies["bindings"] = "*";
        localPkgJson.dependencies["knex"] = "*";

        let tarJsonPath = path.join(process.cwd(), "dist", "package.json");
        fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson));
        fs.mkdirSync(path.join(process.cwd(), "dist/node_modules"));
    }

    /**
     * 【使用 electron-builder 制成安装包】
     * 负责调用 electron-builder 的 api 以生成安装包
     */
    buildInstaller() {
        let options = {
            config: {
                directories: {
                    output: path.join(process.cwd(), "release"), // 安装包存放目录
                    app: path.join(process.cwd(), "dist"), // 静态文件目录
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
                publish: [{ provider: "generic", url: "http://localhost:5500/" }],
                // 当用户升级应用程序时安装目录下的文件都会被删除，数据库中可能保存很多用户数据，这是为了防止每次升级应时用户数据被移除
                extraResources: [{ from: `./src/common/db.db`, to: `./` }],
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

    // 利用复制代替编译
    async prepareSqlite() {
        // 1. 把开发环境的 node_modules\better-sqlite3 目录下有用的文件拷贝到 dist\node_modules\better-sqlite3 目录
        // 2. 为这个模块自制了一个简单的package.json。
        let srcDir = path.join(process.cwd(), `node_modules/better-sqlite3`);
        let destDir = path.join(process.cwd(), `dist/node_modules/better-sqlite3`);
        fs.ensureDirSync(destDir);

        // 拷贝better-sqlite3
        fs.copySync(srcDir, destDir, {
            filter: (src, dest) => {
                if (src.endsWith("better-sqlite3") || src.endsWith("build") || src.endsWith("Release") || src.endsWith("better_sqlite3.node")) return true;
                else if (src.includes("node_modules\\better-sqlite3\\lib")) return true;
                else return false;
            },
        });

        let pkgJson = `{"name": "better-sqlite3","main": "lib/index.js"}`;
        let pkgJsonPath = path.join(process.cwd(), `dist/node_modules/better-sqlite3/package.json`);
        fs.writeFileSync(pkgJsonPath, pkgJson);

        // 制作 bindings 模块，把该模块放置在 dist\node_modules\bindings 目录下
        let bindingPath = path.join(process.cwd(), `dist/node_modules/bindings/index.js`);
        fs.ensureFileSync(bindingPath);
        let bindingsContent = `module.exports = () => {
      let addonPath = require("path").join(__dirname, '../better-sqlite3/build/Release/better_sqlite3.node');
      return require(addonPath);
      };`;
        fs.writeFileSync(bindingPath, bindingsContent);

        pkgJson = `{"name": "bindings","main": "index.js"}`;
        pkgJsonPath = path.join(process.cwd(), `dist/node_modules/bindings/package.json`);
        fs.writeFileSync(pkgJsonPath, pkgJson);
    }

    // Knexjs 会帮我们把 JS 代码转义成具体的 SQL 语句，再把 SQL 语句交给数据库处理,可以理解为一种 SQL Builder
    prepareKnexjs() {
        let pkgJsonPath = path.join(process.cwd(), `dist/node_modules/knex`);
        fs.ensureDirSync(pkgJsonPath);
        require("esbuild").buildSync({
            entryPoints: ["./node_modules/knex/knex.js"],
            bundle: true,
            platform: "node",
            format: "cjs",
            minify: true,
            outfile: "./dist/node_modules/knex/index.js",
            external: ["oracledb", "pg-query-stream", "pg", "sqlite3", "tedious", "mysql", "mysql2", "better-sqlite3"], // 避免编译过程中esbuild去寻找这些模块而导致编译失败
        });
        let pkgJson = `{"name": "bindings","main": "index.js"}`;
        pkgJsonPath = path.join(process.cwd(), `dist/node_modules/knex/package.json`);
        fs.writeFileSync(pkgJsonPath, pkgJson);
    }
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
            buildObj.prepareSqlite();
            buildObj.prepareKnexjs();
        },
    };
};
