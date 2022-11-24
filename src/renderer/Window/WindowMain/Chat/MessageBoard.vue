<script setup lang="ts">
import { ref } from "vue";
import BarTop from "../../../Component/BarTop.vue";
import { useChatStore } from "../../../store/useChatStore";

let store = useChatStore();
let logInfo = ref("");
let curId = "";

// 订阅Store内数据的变化
// mutations 开发环境存在，生产环境不存在
store.$subscribe((mutations, state) => {
    let item = state.data.find((v) => v.isSelected);
    let id = item?.id as string;
    if (id != curId) {
        logInfo.value = `现在应该加载ID为${item?.id}的聊天记录`;
        curId = id;
    }
});
</script>

<template>
    <div class="MessageBord">
        <BarTop />
        <div class="MessageList">{{ logInfo }}</div>
    </div>
</template>

<style scoped lang="scss">
.MessageBord {
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
