<template>
  <div class="chat-app">
    <!-- 历史会话侧边栏 -->
    <div class="history-sessions" v-if="sessionIsShow">
      <div>
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

    <!-- 原有的聊天区域 -->
    <div class="chat-container">
      <!-- 消息列表 -->
      <el-card
        class="chat-messages"
        shadow="never"
        ref="messagesContainer"
        v-if="messages.length > 0"
      >
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
              <el-button
                type="text"
                :icon="DocumentCopy"
                @click="copyMessage(message.content)"
              ></el-button>
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
              :rows="5"
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
            />
            <el-text
              v-model="inputMessage"
              aria-placeholder="输入信息...."
            ></el-text>
          </el-col>
          <el-col :span="4" style="text-align: center">
            <el-button
              @click="sendMessage"
              type="success"
              :icon="Check"
              round
              :disabled="loading"
              >发送</el-button
            >
            <div>
              <p>模型参数</p>
              <el-slider v-model="temperature" :min="0" :max="1" :step="0.1">temperature</el-slider>
               <el-slider v-model="topP" :min="0" :max="1" :step="0.1"></el-slider>
            </div>
            
          </el-col>
          <el-col :span="3" style="text-align: center">
            <el-select v-model="selectModel" placeholder="选择模型">
              <el-option
                v-for="item in ModelList"
                :key="item.ID"
                :label="item.Type +':' + item.Description"
                :value="item.ID"
              ></el-option>
            </el-select>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, nextTick } from "vue";
import { ElCard, ElInput, ElButton } from "element-plus";
import { WSMessage} from "@/types/im";
import { ElMessage } from "element-plus";
import { GetMessageService } from "@/api/im";
import { Check, Loading, DocumentCopy } from "@element-plus/icons-vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { Session } from "@/types/session";
import { FindSessionService } from "@/api/session";
import { FindModelListByFunctionName } from "@/api/function";
import markdownItHighlightjs from "markdown-it-highlightjs";
import markdownItKatex from "markdown-it-katex";
import mermaidPlugin from "@agoose77/markdown-it-mermaid";
import "katex/dist/katex.min.css";
import { Model } from "@/types/model";
interface Message {
  role: "user" | "assistant";
  content: string;
  finished?: boolean;
}

const md = new MarkdownIt();
md.use(markdownItHighlightjs, {
  hljs,
  auto: true,
  code: true,
});
md.use(markdownItKatex);
md.use(mermaidPlugin);

//md.use(markdownItMermaid);

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
const ModelList = ref<Model[]>([]);
const selectModel = ref(0);
const temperature = ref(0.5);
const topP = ref(0.9);

const renderMarkdown = (content: string) => {
  return md.render(content);
};

const scrollToBottom = () => {
  let x = document.getElementsByClassName("chat-messages")[0];
  x.scrollTop = x.scrollHeight; //将滚轮置底
};

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success("代码已复制到剪贴板");
  });
};

const doButtonD = () => {
  const codeBlocks = document.querySelectorAll("pre code");
  codeBlocks.forEach((codeBlock) => {
    //先查看是否已经添加了复制按钮
    if (codeBlock.parentNode.querySelector(".code-controls")) {
      return;
    }

    // 获取代码类型
    const codeType = codeBlock.className.replace("hljs ", "");
    // 创建代码类型显示元素
    const codeTypeElement = document.createElement("span");
    codeTypeElement.textContent = codeType.split("-")[1];
    codeTypeElement.setAttribute("background-color", "rgba(0, 0, 0, 0.1)");
    codeTypeElement.setAttribute("padding", "3px 6px");
    codeTypeElement.setAttribute("border-radius", "4px");
    codeTypeElement.setAttribute("font-size", "0.9em");

    // 创建复制按钮
    const copyButton = document.createElement("button");
    copyButton.setAttribute("background-color", "dodgerblue");
    copyButton.setAttribute("display", "flex");
    copyButton.setAttribute("align-items", "center");
    copyButton.setAttribute("padding", "5px 10px");
    copyButton.setAttribute("cursor", "pointer");
    copyButton.setAttribute("border-radius", "4px");
    copyButton.textContent = "复制";
    copyButton.classList.add();
    copyButton.addEventListener("click", () => {
      copyCode(codeBlock.textContent);
    });

    // 设置代码块父元素的定位，以便按钮定位
    const pre = codeBlock.parentNode;
    // pre.style.position = 'relative';

    // 创建一个容器用于放置代码类型和复制按钮
    const controlsContainer = document.createElement("div");
    controlsContainer.classList.add("code-controls");
    controlsContainer.appendChild(codeTypeElement);
    controlsContainer.appendChild(copyButton);

    // 将容器添加到代码块父元素中
    pre.insertBefore(controlsContainer, codeBlock);
  });
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
      doButtonD();
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
    socket.value = new WebSocket(url);
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
    model_id: selectModel.value,
    temperature: temperature.value,
    top_p: topP.value,
  };
  try {
    socket.value.send(JSON.stringify(msg));
  } catch (e) {
    ElMessage.error("发送失败!连接已断开！");
    return;
  }
  if (sessionID.value == 0) {
    sessionName.value = inputMessage.value;
  }
  messages.push({ role: "user", content: inputMessage.value, finished: true });
  inputMessage.value = "";
  nextTick(() => {
      scrollToBottom(); // 新增滚动调用
    });
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
  doButtonD();
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
  navigator.clipboard
    .writeText(content)
    .then(() => {
      ElMessage.success("复制成功");
    })
    .catch((error) => {
      ElMessage.error("复制失败: " + error);
    });
};

const GetModelListByFunctionName = async () => {
  let req = {
    function: "gen-ai-chat",
    token: localStorage.getItem("token"),
  };
  try{
    let result = await FindModelListByFunctionName(req);
    if (result["code"] === 0) {
      ModelList.value = result["data"];
      selectModel.value = ModelList.value[0].ID;
      console.log("model_list:", ModelList.value);
    } else {
      ElMessage.error(result["msg"]);
    }
  }catch (e) {
    console.log(e);
  }
};

GetModelListByFunctionName();
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
  height: 100%;
  box-sizing: border-box;
}

.chat-messages {
  flex: 1;
  overflow-y: auto; /* 允许垂直滚动 */
  padding: 10px;
  margin-bottom: 20px;
  scrollbar-width: 10px;
  height: 100%;
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

.code-controls {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 10px;
}

.copy-code-button {
  background-color: dodgerblue;
  color: white;
  width: 30px;
  height: 20px;
  border: 0;
  display: flex;
  align-items: center;
}

.el-icon-copy {
  margin-right: 5px;
}
</style>
