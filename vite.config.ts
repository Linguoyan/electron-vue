import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import optimizer from "vite-plugin-optimizer";

import { devPlugin, getReplacer } from "./plugins/devPlugin";

export default defineConfig({
    plugins: [optimizer(getReplacer()), devPlugin(), vue()],
});
