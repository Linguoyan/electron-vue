import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";

import "./assets/style.css";
//全局导入字体图标
import "./assets/icon/iconfont.css";

createApp(App).use(router).mount("#app");
