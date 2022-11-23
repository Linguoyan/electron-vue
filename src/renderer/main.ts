import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { createPinia } from "pinia";

import "./assets/style.css";
//全局导入字体图标
import "./assets/icon/iconfont.css";

createApp(App).use(createPinia()).use(router).mount("#app");
