export let createDialog = (url: string, config: any): Promise<Window> => {
    return new Promise((resolve, reject) => {
        let windowProxy = window.open(url, "_blank", JSON.stringify(config));
        let readyHandler = (e) => {
            let msg = e.data; // 消息内容
            if (msg["msgName"] === `__dialogReady`) {
                window.removeEventListener("message", readyHandler);
                resolve(windowProxy);
            }
        };

        // 监听message事件，子窗口有消息发送给当前窗口时，该事件将被触发
        window.addEventListener("message", readyHandler);
    });
};

// 仅为子窗口服务
export let dialogReady = () => {
    let msg = { msgName: `__dialogReady` };

    /**
     * 当子窗口完成了必要的业务逻辑之后，就可以执行这个方法，通知父窗口自己已经加载成功
     * --------------
     * window.opener： 返回打开当前窗口的父窗口的引用，如：在 window A 中打开了 window B，B.opener 返回 A
     * postMessage: 发送消息动作
     */
    window.opener.postMessage(msg);
};
