<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <el-card class="chat-messages" shadow="never" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role]"
      >
        <div class="message-avatar">
          <span v-if="message.role === 'assistant'">💬</span>
          <span v-else>👤</span>
        </div>
        <div class="message-content">
          <div v-html="renderMarkdown(message.content)"></div>
        </div>
      </div>
      <div v-if="loading" class="loading-indicator">Loading...</div>
    </el-card>

    <!-- 输入区域 -->
    <el-card class="chat-input" shadow="never">
      <el-row :gutter="10">
        <el-col :span="20">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="2"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
          />
        </el-col>
        <el-col :span="4" style="text-align: center;" >
          <el-button type="primary" @click="sendMessage">Send</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, nextTick } from "vue";
import { ElCard, ElInput, ElButton } from "element-plus";
import { WSMessage, AIQMessage, OllamaMessage } from "@/types/im";
import { ElMessage } from "element-plus";
import { GetMessageService } from "@/api/im";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import java from "highlight.js/lib/languages/java";
import sql from "highlight.js/lib/languages/sql";
import nginx from "highlight.js/lib/languages/nginx";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import xml from "highlight.js/lib/languages/xml";
import shell from "highlight.js/lib/languages/shell";
interface Message {
  role: "user" | "assistant";
  content: string;
  finished?: boolean;
}
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("java", java);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("nginx", nginx);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("shell", shell);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  xhtmlOut: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});

const loading = ref(false);
const isUserScrolling = ref<boolean>(false);
const messages = reactive([]);
const inputMessage = ref("");
const socket = ref(null);
const currentAIMessage = ref("");
const sessionID = ref(0);
const messagesContainer = ref<HTMLDivElement | null>(null);

const renderMarkdown = (content: string) => {
  return md.render(content);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(() => {
  let url =
    "wss://pm.ljsea.top/im/ai_chat_ws?" +
    "token=" +
    localStorage.getItem("token");
  socket.value = new WebSocket(url);
  socket.value.onopen = () => {
    console.log("WebSocket 连接已建立");
    ElMessage.success("连接成功");
  };
  messagesContainer.value = document.querySelector(".chat-messages");

  socket.value.onmessage = (event) => {
    let msg: WSMessage = JSON.parse(event.data);
    const existingMessage = messages.find(
      (msg) => msg.role === "assistant" && !msg.finished
    );
    if (existingMessage) {
      // 追加内容
      existingMessage.content += msg.msg.msg.response;
    } else {
      // 新消息
      messages.push({
        role: "assistant",
        content: msg.msg.msg.response,
        finished: false,
      });
    }
    console.log("resp:", msg);
    sessionID.value = msg.session_id;
    currentAIMessage.value += msg.msg.msg.response;
    if (msg.msg.msg.done) {
      const assistantMessage = messages[messages.length - 1];
      assistantMessage.finished = true;
      loading.value = false;
    }
    nextTick(() => {
      scrollToBottom(); // 新增滚动调用
    });
  };

  socket.value.onclose = () => {
    console.log("WebSocket 连接已关闭");
    ElMessage.error("连接已关闭");
  };

  socket.value.onerror = (error) => {
    console.error("WebSocket 发生错误:", error);
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
    function: "gen-ai-chat",
    session_id: sessionID.value,
  };
  if (inputMessage.value.trim() === "") return;
  messages.push({ role: "user", content: inputMessage.value, finished: true });
  socket.value.send(JSON.stringify(msg));
  inputMessage.value = "";
  scrollToBottom();
  loading.value = true;
  //getMessage();
};


const getMessage = async () => {
  let result = {};
  try {
    let req = {
      token: localStorage.getItem("token"),
      session_id: sessionID.value,
    };
    result = await GetMessageService(req);
    if (result["code"] === 0) {
      console.log(result["data"]);
    }
  } catch (e) {
    console.log(e);
  }
  return {};
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.chat-messages {
  flex: 1;
  overflow-y: auto; /* 允许垂直滚动 */
  padding: 10px;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.messages-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 确保内部可以滚动 */
  height: 100%;
}

.message {
  display: flex;
  margin-bottom: 15px;
}

.message.user {
  justify-content: flex-end;
}

.message-avatar {
  width: 40px;
  text-align: center;
  line-height: 40px;
  font-size: 20px;
  margin-right: 10px;
}

.message.assistant .message-avatar {
  margin-right: 0;
  margin-left: 10px;
}

.message-content {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  padding: 10px 15px;
  white-space: pre-wrap;
  max-width: 70%;
}

.message.assistant .message-content {
  background-color: #f3f4f6;
  border: 1px solid #dce4eb;
  max-width: 70%;
}

.loading-indicator {
  text-align: center;
  color: #999;
  font-size: 16px;
}

.chat-input {
  width: 100%;
}

.el-input {
  width: 100%;
}
</style>
