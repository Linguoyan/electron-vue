<template>
    <div class="ContactBoard">
        <BarTop />
        <div class="contentTest">
            <button @click="insertData">增加一行数据</button>

            <button @click="insertMultiData">增加多行数据</button>

            <button @click="selectData">查询一行数据</button>

            <button @click="updateData">修改一行数据</button>

            <button @click="deleteData">删除一行数据</button>

            <br />

            <button @click="transaction">使用事务</button>
            <br />
            <button @click="getFirstPage()">获取第一页数据</button>
            <button @click="getNextPage()">获取下一页数据</button>
            <button @click="getPrevPage()">获取上一页数据</button>
            <button @click="getLastPage()">获取最后一页数据</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { db } from "../../../common/db";
import { ModelChat } from "../../../model/ModelChat";

let insertData = async () => {
    let model = new ModelChat();
    model.fromName = "聊天对象";
    model.sendTime = Date.now();
    model.lastMsg = "这是此会话的最后一条消息";
    model.avatar = `https://pic3.zhimg.com/v2-306cd8f07a20cba46873209739c6395d_im.jpg?source=32738c0c`;
    await db("Chat").insert(model);
};

let insertMultiData = async () => {
    let result = [];
    for (let i = 0; i < 10; i++) {
        let model = new ModelChat();
        model.fromName = "聊天对象" + i;
        model.sendTime = Date.now() + i;
        model.lastMsg = "这是此会话的最后一条消息" + i;
        model.avatar = `https://pic3.zhimg.com/v2-306cd8f07a20cba46873209739c6395d_im.jpg?source=32738c0c`;
        result.push(model);
    }
    result[5].isSelected = true;
    await db("Chat").insert(result);
};

let selectData = () => {};
let updateData = () => {};
let deleteData = () => {};
let transaction = () => {};
let getFirstPage = () => {};
let getNextPage = () => {};
let getPrevPage = () => {};
let getLastPage = () => {};
</script>
<style lang="scss">
.ContactBoard {
    flex: 1;
}
.contentTest {
    padding: 18px;
}
</style>
