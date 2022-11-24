<script setup lang="ts">
// import { ref } from "vue";
import BarTop from "../../../Component/BarTop.vue";
// import { useChatStore } from "../../../store/useChatStore";
import { useMessageStore } from "../../../store/useMessageStore";
import MessageItem from "./MessageItem.vue";

// let chatStore = useChatStore();
let messageStore = useMessageStore();
// let logInfo = ref("");
// let curId = "";

// 订阅Store内数据的变化 (可以直接在 ChatStore 里去做这件事)
// mutations 开发环境存在，生产环境不存在
// chatStore.$subscribe((mutations, state) => {
//     let item = state.data.find((v) => v.isSelected);
//     let id = item?.id as string;
//     if (id != curId) {
//         // logInfo.value = `现在应该加载ID为${item?.id}的聊天记录`;
//         messageStore.initData(item);
//         curId = id;
//     }
// });
</script>

<template>
    <div class="MessageBoard">
        <BarTop />
        <div class="MessageList">
            <MessageItem :data="item" v-for="item in messageStore.data" :key="item.id" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.MessageBoard {
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
}
.MessageList {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: rgb(245, 245, 245);
}
</style>
