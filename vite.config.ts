import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import optimizer from "vite-plugin-optimizer"; // 为了让 vite 加载 Electron 和 NodeJS 的内置模块

import { devPlugin, getReplacer } from "./plugins/devPlugin";
import { buildPlugin } from "./plugins/buildPlugin";

export default defineConfig({
    plugins: [optimizer(getReplacer()), devPlugin(), vue()],
    build: {
        rollupOptions: {
            plugins: [buildPlugin()],
        },
    },
});
