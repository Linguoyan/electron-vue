import { ModelBase } from "./ModelBase";

// 聊天会话的消息模型
export class ModelMessage extends ModelBase {
    createTime?: number; // 创建时间
    receiveTime?: number; // 接收时间
    messageContent?: string; // 消息内容
    chatId?: string; // 对应 ModelChat 的 id 字段
    fromName?: string; // 聊天对象名称
    avatar?: string; // 头像
    // 是否为传入消息
    isInMsg?: boolean;
}
