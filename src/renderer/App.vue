<script setup lang="ts">
import fs from "fs";
import { ipcRenderer } from "electron";
import { onMounted } from "vue";

onMounted(() => {
    // 在渲染进程中使用 electron 和 node.js 内置模块
    // console.log(fs.writeFileSync);
});
</script>

<template>
    <router-view />
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
