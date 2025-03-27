<template>
    <div class="chat-app">
      <!-- 历史会话侧边栏 -->
      <div class="history-sessions" v-if="sessionIsShow">
          <div >
            <el-button type="primary" @click="clearCurrent">新会话</el-button>
          </div>
        <el-card class="session-card">
          <template #header>
            <h3>当前会话</h3>
          </template>
          <ul>
            <li>{{ getShortenedName(sessionName) }}</li>
          </ul>
        </el-card>
        <el-card class="session-card2">
          <template #header>
            <h3>历史会话</h3>
          </template>
          <el-scrollbar style="height: 400px; scrollbar-width: none">
            <ul>
              <li
                v-for="(session, index) in historySessions"
                :key="index"
                @click="loadSession(session.ID)"
              >
                {{ getShortenedName(session.Name) }}
              </li>
            </ul>
          </el-scrollbar>
        </el-card>
      </div>
  
      <!-- 原有的聊天区域 -->
      <div class="chat-container">
        <div>
          <div @click="showSession" style="cursor: pointer">
            <el-icon v-if="sessionIsShow">
              <Expand />
            </el-icon>
            <el-icon v-else>
              <Fold />
            </el-icon>
          </div>
        </div>
        <!-- 消息列表 -->
        <el-card class="chat-messages" shadow="never" ref="messagesContainer" v-if="messages.length > 0">
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
              <!-- 添加复制 -->
              <div>
              <el-button type="text" :icon="DocumentCopy" @click="copyMessage(message.content)"></el-button>
            </div>
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
              <el-text v-model="inputMessage" aria-placeholder="输入信息...."></el-text>
            </el-col>
            <el-col :span="4" style="text-align: center">
              <el-button  @click="sendMessage" type="success" :icon="Check" round :disabled="loading">发送</el-button>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted, reactive, nextTick } from "vue";
  import { ElCard, ElInput, ElButton } from "element-plus";
  import { WSMessage, AIQMessage, OllamaMessage } from "@/types/im";
  import { ElMessage } from "element-plus";
  import { GetMessageService } from "@/api/im";
  import {Check, Loading, DocumentCopy} from '@element-plus/icons-vue'
  import MarkdownIt from "markdown-it";
  import markdownItMermaid from "markdown-it-mermaid";
  import hljs from "highlight.js";
  import { Session } from "@/types/session";
  import bash from "highlight.js/lib/languages/bash";
  import { FindSessionService } from "@/api/session";
  import javascript from "highlight.js/lib/languages/javascript";
  import typescript from "highlight.js/lib/languages/typescript";
  import java from "highlight.js/lib/languages/java";
  import sql from "highlight.js/lib/languages/sql";
  import nginx from "highlight.js/lib/languages/nginx";
  import json from "highlight.js/lib/languages/json";
  import yaml from "highlight.js/lib/languages/yaml";
  import xml from "highlight.js/lib/languages/xml";
  import shell from "highlight.js/lib/languages/shell";
  import "katex/dist/katex.min.css";
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
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          }</code></pre>`;
        } catch (__) {}
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
  });
  
  const historySessions = ref<Session[]>([]);
  const loading = ref(false);
  const isUserScrolling = ref<boolean>(false);
  const messages = reactive([]);
  const inputMessage = ref("");
  const socket = ref(null);
  const currentAIMessage = ref("");
  const sessionID = ref(0);
  const messagesContainer = ref<HTMLDivElement | null>(null);
  const sessionIsShow = ref(false);
  const sessionName = ref("");
  
  const renderMarkdown = (content: string) => {
    return md.render(content);
  };
  
  const scrollToBottom = () => {
    let x = document.getElementsByClassName("chat-messages")[0];
    x.scrollTop = x.scrollHeight; //将滚轮置底
  };
  
  onMounted(() => {
    // if (typeof window !== 'undefined') {
    //   // 浏览器环境
    //   md.use(markdownItMermaid);
    // }
    let url =
      "wss://pm.ljsea.top/im/ai_chat_ws?" +
      "token=" +
      localStorage.getItem("token");
    socket.value = new WebSocket(url);
    socket.value.onopen = () => {
      console.log("WebSocket 连接已建立");
      ElMessage.success("连接成功");
    };
    //getMessage(125);
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
      //console.log("resp:", msg);
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
      //重新连接
      socket.value = new WebSocket(url);
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
    if (inputMessage.value.trim() === "") {
      ElMessage.warning("消息不能为空");
      return;
    }
    let msg = {
      msg: inputMessage.value,
      type: "ollama",
      function: "gen-ai-chat",
      session_id: sessionID.value,
    };
    messages.push({ role: "user", content: inputMessage.value, finished: true });
    socket.value.send(JSON.stringify(msg));
    inputMessage.value = "";
    scrollToBottom();
    loading.value = true;
    if (sessionID.value == 0) {
      sessionName.value = msg.msg;
    }
  };
  
  const loadSession = async (session_id: number) => {
    sessionID.value = session_id;
    messages.length = 0; // 清空消息
    sessionName.value = historySessions.value.find(
      (session) => session.ID == session_id
    )?.Name;
    await getMessage(session_id);
    scrollToBottom();
  };
  
  const clearCurrent = () => {
    sessionID.value = 0;
    messages.length = 0; // 清空消息
    sessionName.value = "新会话";
    ElMessage.success("新会话已创建!可以开始聊天了");
  };
  
  const showSession = async () => {
    //获取历史会话
    let req = {
      token: localStorage.getItem("token"),
      type: "UserID",
    };
    let result = await FindSessionService(req);
    historySessions.value = result.data;
    sessionIsShow.value = !sessionIsShow.value;
  };
  const getShortenedName = (name: string) => {
    if (name.length > 10) {
      return name.slice(0, 10) + "...";
    }
    return name;
  };
  
  const getMessage = async (session_id: number) => {
    let result = {};
    try {
      let req = {
        token: localStorage.getItem("token"),
        session_id: session_id,
      };
      result = await GetMessageService(req);
      if (result["code"] === 0) {
        console.log(result["data"]);
        let data = result["data"];
        for (let i = 0; i < data.length; i++) {
          if (data[i]["Type"] === 3) {
            messages.push({
              role: "user",
              content: data[i]["Msg"],
              finished: true,
            });
          } else if (data[i]["Type"] === 4) {
            messages.push({
              role: "assistant",
              content: data[i]["Msg"],
              finished: true,
            });
          } else {
            console.log("未知消息类型");
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    return {};
  };
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      ElMessage.success('复制成功');
    }).catch((error) => {
      ElMessage.error('复制失败: ' + error);
    });
  };
  </script>
  <style scoped>
  .chat-app {
    display: flex;
    height: 100%;
  }
  
  .history-sessions {
    width: 15%;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
    border-right: 1px solid #e1e1e1;
    scrollbar-width: none;
  }
  
  .history-sessions ul {
    list-style-type: none;
    padding: 0;
  }
  
  .history-sessions li {
    cursor: pointer;
    padding: 10px;
    border-bottom: 1px solid #e1e1e1;
  }
  
  .history-sessions li:hover {
    background-color: #f0f0f0;
  }
  
  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto; /* 允许垂直滚动 */
    padding: 10px;
    margin-bottom: 20px;
    scrollbar-width: 20px;
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
  
  .session-card {
    margin-bottom: 20px;
    height: 20%;
  }
  .session-card2 {
    margin-bottom: 20px;
    height: 70%;
  }
  
  .session-card ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .session-card li {
    cursor: pointer;
    padding: 10px;
    border-bottom: 1px solid #e1e1e1;
  }
  
  .session-card li:hover {
    background-color: #f0f0f0;
  }
  
  .scroll-wrapper {
    height: 100%;
    overflow-y: auto;
  }
  </style>
  