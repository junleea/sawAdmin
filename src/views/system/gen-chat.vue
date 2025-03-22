<template>
    <div class="chat-container">
      <div class="chat-messages" ref="messageContainer">
        <el-card
          v-for="(message, index) in messages"
          :key="index"
          :class="{ 'user-message': message.sender === 'user', 'ai-message': message.sender === 'ai' }"
          shadow="never"
        >
          <template #header>
            <span>{{ message.sender === 'user' ? '你' : 'AI' }}</span>
          </template>
          <div>{{ message.content }}</div>
        </el-card>
        <el-card
          v-if="currentAIMessage.length > 0"
          class="ai-message"
          shadow="never"
        >
          <template #header>
            <span>AI</span>
          </template>
          <div>{{ currentAIMessage }}</div>
        </el-card>
      </div>
      <div class="input-container">
        <el-input
          v-model="inputMessage"
          placeholder="输入你的消息..."

          @keyup.enter="sendMessage"
        ></el-input>
        <el-button @click="sendMessage">发送</el-button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { ElCard, ElInput, ElButton } from 'element-plus';
  import { WSMessage,AIQMessage,OllamaMessage } from '@/types/im';
  import { ElMessage } from 'element-plus';
  import {GetMessageService} from "@/api/im";
  
  const messages = ref([]);
  const inputMessage = ref('');
  const socket = ref(null);
  const currentAIMessage = ref('');
  const messageContainer = ref(null);
  const sessionID = ref(0);
  
  onMounted(() => {
    let url ='wss://pm.ljsea.top/im/ai_chat_ws?' + 'token=' + localStorage.getItem('token');
    socket.value = new WebSocket(url);
  
    socket.value.onopen = () => {
      console.log('WebSocket 连接已建立');
      ElMessage.success('连接成功');

    };
  
    socket.value.onmessage = (event) => {
        let msg : WSMessage = JSON.parse(event.data);
       const chunk = event.data;
      if (msg.msg.msg.done) {
        messages.value.push({ sender: 'ai', content: currentAIMessage.value });
        currentAIMessage.value = '';
        scrollToBottom();
        return;
      }
      //console.log("resp:",msg);
      sessionID.value =msg.session_id;
      currentAIMessage.value += msg.msg.msg.response;
      scrollToBottom();
    };
  
    socket.value.onclose = () => {
      console.log('WebSocket 连接已关闭');
      ElMessage.error('连接已关闭');
    };
  
    socket.value.onerror = (error) => {
      console.error('WebSocket 发生错误:', error);
    };
  });
  
  onUnmounted(() => {
    if (socket.value) {
      socket.value.close();
    }
  });
  
  const sendMessage = () => {
    let msg = {
        msg: inputMessage.value,
        type: "ollama",
    }
    if (inputMessage.value.trim() === '') return;
    messages.value.push({ sender: 'user', content: inputMessage.value });
    socket.value.send(JSON.stringify(msg));
    inputMessage.value = '';
    //getMessage();
    scrollToBottom();
  };
  
  const scrollToBottom = () => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  };

  const getMessage = async () => {
    let result = {};
    try{
      let req={
          token: localStorage.getItem('token'),
          session_id: sessionID.value,
      };
      result = await GetMessageService(req)
      if(result.code===0){
        return result.data;
      }
    }catch(e){
      console.log(e);
    }
    return {};
  }
  </script>
  
  <style scoped>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 600px;
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #ccc;
    margin-bottom: 10px;
  }
  
  .user-message {
    text-align: right;
    margin-bottom: 10px;
  }
  
  .ai-message {
    text-align: left;
    margin-bottom: 10px;
  }
  
  .input-container {
    display: flex;
    gap: 10px;
  }
  </style>    