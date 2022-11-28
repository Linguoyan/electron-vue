import * as VueRouter from "vue-router";

export let router = VueRouter.createRouter({
    // 使用 WebHistory 模式创建路由与之前创建的 CustomScheme 兼容得很好
    history: VueRouter.createWebHistory(),
    routes: [
        { path: "/", redirect: "/WindowMain/Chat" },
        {
            path: "/WindowMain",
            component: () => import("./Window/WindowMain.vue"),
            children: [
                { path: "Chat", component: () => import("./Window/WindowMain/Chat.vue") },
                { path: "Contact", component: () => import("./Window/WindowMain/Contact.vue") },
                { path: "Collection", component: () => import("./Window/WindowMain/Collection.vue") },
            ],
        },
        {
            path: "/WindowSetting",
            component: () => import("./Window/WindowSetting.vue"),
            children: [{ path: "AccountSetting", component: () => import("./Window/WindowSetting/AccountSetting.vue") }],
        },
        {
            path: "/WindowUserInfo",
            component: () => import("./Window/WindowUserInfo.vue"),
        },
    ],
});
