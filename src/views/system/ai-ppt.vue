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
              <span v-else>🧑‍🎓</span>
            </div>
            <div class="message-content">
              <div v-if="message.isOutline === false" v-html="renderMarkdown(message.content)"></div>

            <!-- 大纲部分开始 -->
            <div v-if="message.role === 'assistant' && message.isOutline">
              <el-input v-model="message.outline.title" placeholder="请输入大纲标题"></el-input>
              <el-input v-model="message.outline.subTitle" placeholder="请输入大纲副标题"></el-input>
              <el-collapse v-model="message.outline.chapters">
                <template v-for="(chapter, chapterIndex) in message.outline.chapters">
                  <el-collapse-item :name="chapter.chapterTitle">
                    <template #title>
                      <el-input v-model="chapter.chapterTitle" placeholder="请输入章节标题"></el-input>
                    </template>
                    <el-collapse v-model="chapter.chapterContents[chapterIndex]">
                      <template v-for="(content, contentIndex) in chapter.chapterContents">
                        <el-input v-model="content.chapterTitle" placeholder="请输入章节内容"></el-input>
                      </template>
                    </el-collapse>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
            <!-- 大纲部分结束 -->

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
                style="border: 0"
                :rows="5"
                placeholder="输入消息..."
                @keyup.enter="sendMessage"
              />
              <!-- <el-text
                v-model="inputMessage"
                aria-placeholder="输入信息...."
              ></el-text> -->
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
            </el-col>
            <el-col :span="3" style="text-align: center">
              <el-select v-model="selectModel" placeholder="选择模型">
                <el-option
                  v-for="item in ModelList"
                  :key="item.ID"
                  :label="item.Type + ':' + item.Description"
                  :value="item.ID"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="1" style="text-align: center">
              <el-button @click="handleSelectFileVisible"
                ><el-icon><Files /></el-icon
              ></el-button>
            </el-col>
            <el-col :span="12" style="text-align: center">
              <el-tag
                v-for="(file, index) in selectedFiles"
                :key="index"
                closable
                @close="removeFile(index)"
                >{{ file.UserFileName }}</el-tag
              >
            </el-col>
          </el-row>
        </el-card>
      </div>
  
      <div>
        <!-- 文件对话框 -->
        <el-dialog
          v-model="selectFileVisible"
          title="从上传文件中选择"
          width="50%"
        >
          <el-input
            placeholder="搜索文件"
            v-model="searchFileQuery"
            prefix-icon="el-icon-search"
          />
          <el-button @click="uploadMessageFile">上传文件</el-button>
          <!-- 文件列表 -->
          <div class="file-list">
            <el-checkbox-group v-model="selectedFiles">
              <el-checkbox
                v-for="(item, index) in filteredFiles"
                :key="index"
                :label="item"
              >
                <span class="file-icon">
                  <!-- 根据文件类型展示不同图标 -->
                  <i
                    v-if="item.UploadType === 'image'"
                    class="el-icon-picture"
                  ></i>
                  <i
                    v-else-if="item.UploadType === 'file'"
                    class="el-icon-document"
                  ></i>
                  <!-- 可继续补充其他文件类型图标 -->
                </span>
                {{ item.UserFileName }}
                <!-- <span class="file-time">{{ item.CreatedAt }}</span> -->
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- 底部状态栏和按钮 -->
          <div class="footer-bar">
            <span class="selected-count"
              >已选 {{ selectedFiles.length }} 个文件</span
            >
            <el-button @click="selectFileVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSelectFileConfirm"
              >确认添加({{ selectedFiles.length }})</el-button
            >
          </div>
        </el-dialog>
      </div>
      <!-- 上传文件对话框 -->
      <div>
        <el-dialog
          title="上传文件"
          v-model="uploadFileVisible"
          width="50%"
          :before-close="handleUploadFileClose"
        >
          <UploadFile></UploadFile>
        </el-dialog>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted, reactive, nextTick } from "vue";
  import { ElCard, ElInput, ElButton, ElDialog } from "element-plus";
  import { WSMessage, GenMessage } from "@/types/im";
  import { GetMessageService } from "@/api/im";
  import { FindUserFileService } from "@/api/file";
  import { Model } from "@/types/model";
  import { File, fileUrl } from "@/types/file";
  import { SparkCreateOutlineResponse,SparkCreatePPTResponse,SparkCreatePPTByOutlineResponse,SparkCreateOutlineResponseOutline } from "@/types/ppt";
  import { Session } from "@/types/session";
  import { FindSessionService } from "@/api/session";
  import { ElMessage } from "element-plus";
  import { Check, DocumentCopy } from "@element-plus/icons-vue";
  import { FindSparkPPTThemeListService,GetSparkPPTStatusService,CreateSparkPPTService,CreateSparkPPTOutlineService} from "@/api/ppt";
  import MarkdownIt from "markdown-it";
  import hljs from "highlight.js";
  import UploadFile from "@/components/upload-file.vue";
  import { FindModelListByFunctionName } from "@/api/function";
  import markdownItHighlightjs from "markdown-it-highlightjs";
  import markdownItKatex from "markdown-it-katex";
  import mermaidPlugin from "@agoose77/markdown-it-mermaid";
  import "katex/dist/katex.min.css";
  interface MessageOutline {
    role: "user" | "assistant";
    content: string;
    outline: SparkCreateOutlineResponseOutline,
    isOutline: boolean,
    finished?: boolean;
  }
  interface SendImageMessage {
    file_name : string;
    file_url : string;
  }
  interface ImageMessage {
    image_content: SendImageMessage[];
    text: string;
  }
  interface PPTFileMessage {
    file_content: SendImageMessage[];
    text: string;
  }
  interface BaseInfo{
    user_id: number;
    session_id: number;
    function_id: number;
    model_id: number;
  }
  
  const md = new MarkdownIt();
  md.use(markdownItHighlightjs, {
    hljs,
    auto: true,
    code: true,
  });
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    // 设置图片的宽度和高度属性
    token.attrSet('width', '400'); 
    token.attrSet('height', '300'); 
    return self.renderToken(tokens, idx, options, env, self);
  };
  md.use(markdownItKatex);
  md.use(mermaidPlugin);
  
  //md.use(markdownItMermaid);
  
  const historySessions = ref<Session[]>([]);
  const loading = ref(false);
  const isUserScrolling = ref<boolean>(false);
  const messages = reactive<MessageOutline[]>([]);
  const inputMessage = ref("");
  const socket = ref(null);
  const currentAIMessage = ref("");
  const sessionID = ref(0);
  const messagesContainer = ref<HTMLDivElement | null>(null);
  const sessionIsShow = ref(false);
  const sessionName = ref("");
  const ModelList = ref<Model[]>([]);
  const selectModel = ref(0);
  const selectedFiles = ref<File[]>([]); // 用于存储已选文件
  const selectFileVisible = ref(false); // 控制文件选择对话框的显示与隐藏
  const searchFileQuery = ref(""); // 用于搜索文件的查询条件
  const filteredFiles = ref<File[]>([]); // 用于存储过滤后的文件列表
  const uploadFileVisible = ref(false); // 控制上传文件对话框的显示与隐藏
  const baseInfo = ref<BaseInfo>({
    user_id: 0,
    session_id: 0,
    function_id: 0,
    model_id: 0,
  });
  const createOutlineResp = ref<SparkCreateOutlineResponse>();
  const createPPTResp = ref<SparkCreatePPTResponse>();
  const getPPTStatus = ref<SparkCreatePPTByOutlineResponse>();

  
  const renderMarkdown = (content: string) => {
    return md.render(content);
  };
  
  const scrollToBottom = () => {
    let x = document.getElementsByClassName("chat-messages")[0];
    // if (!x) return;
    // x.scrollTop = x.scrollHeight; //将滚轮置底
  };
  
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      ElMessage.success("代码已复制到剪贴板");
    });
  };
  const removeFile = (index: number) => {
    selectedFiles.value.splice(index, 1);
  };
  
  const handleSelectFileVisible = async () => {
    await getFileListData(); // 获取文件列表
    console.log("selectedFiles:", selectedFiles.value);
    selectFileVisible.value = true; // 显示对话框
    console.log("handleSelectFileVisible:", selectFileVisible.value);
  };
  
  const handleUploadFileClose = async () => {
    uploadFileVisible.value = false; // 关闭上传文件对话框
    await getFileListData(); // 获取文件列表
    console.log("handleUploadFileClose:", uploadFileVisible.value);
  };
  
  const handleUploadPicture = () => {
    // 处理上传图片的逻辑
    //选择图片并上传
  };
  
  const uploadMessageFile = () => {
    // 处理上传文件的逻辑
    // 这里可以调用上传文件的API
    uploadFileVisible.value = true; // 显示上传文件对话框
    console.log("上传文件:", selectedFiles.value);
  };
  
  const handleSelectFileConfirm = () => {
    // 处理选中的文件
    console.log("选中的文件:", selectedFiles.value);
    // 在这里可以进行文件上传或其他操作
    selectFileVisible.value = false; // 关闭对话框
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
    messagesContainer.value = document.querySelector(".chat-messages");
  
  });
  
  onUnmounted(() => {
  });
  
  const sendMessage = async() => {
    if (inputMessage.value.trim() === "") {
      ElMessage.warning("消息不能为空");
      return;
    }
    loading.value = true;

    let req = {
        token: localStorage.getItem('token'),
        function: "spark-create-ppt",
        query: inputMessage.value,
        fileUrl:  fileUrl + selectedFiles.value[0].file_store_name,
        fileName: selectedFiles.value[0].UserFileName,
    }
    let pMsgContent ="";
    if (req.fileUrl) {
      //文件名和文件url
      pMsgContent += `[${req.fileName}](${req.fileUrl})` + "\n";
      pMsgContent = pMsgContent + req.query;
    } else {
      pMsgContent = req.query;
    }
    let msg1:MessageOutline = { role: "user", content: pMsgContent, finished: true, isOutline: false,outline: null }
    messages.push(msg1);

    let result = await CreateSparkPPTOutlineService(req);
    if (result['code'] === 0) {
        baseInfo.value = result['base'];
        createOutlineResp.value = result['data'];
        let msg : MessageOutline = {
            role: "assistant",
            content: "",
            outline: createOutlineResp.value.data.outline,
            isOutline: true,
            finished: true,
        };
        messages.push(msg);
        console.log("ppt_outline:", result['data']);
    } else {
        ElMessage.error(result['data']);
    }

    inputMessage.value = "";
    nextTick(() => {
      scrollToBottom(); // 新增滚动调用
    });
    if (sessionID.value == 0) {
      sessionName.value = req.query;
    }
    loading.value = false;
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
    ElMessage.success("新会话已创建!可以开始制作新ppt了");
  };
  
  const showSession = async () => {
    //获取历史会话
    let req = {
      token: localStorage.getItem("token"),
      type: "UserID",
      session_type: 3, //制作ppt会话
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
            let msg: GenMessage = data[i];
            let pMsgContent="";
            if (msg.Status == 3) {
              let img_msg: ImageMessage = JSON.parse(msg.Msg);
              //解析成md格式
              let img_content= img_msg.image_content
              for (let i = 0; i < img_content.length; i++) {
                pMsgContent += `![${img_content[i].file_name}](${img_content[i].file_url})` + "\n";
              }
              pMsgContent = pMsgContent + img_msg.text;
            } else {
              pMsgContent = msg.Msg;
            }
            //将图片消息转换为Markdown格式
            // messages.push({
            //   role: "user",
            //   content: pMsgContent,
            //   finished: true,
            // });
          } else if (data[i]["Type"] === 4) {
            // messages.push({
            //   role: "assistant",
            //   content: data[i]["Msg"],
            //   finished: true,
            // });
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
      function: "spark-create-ppt",
      token: localStorage.getItem("token"),
    };
    try {
      let result = await FindModelListByFunctionName(req);
      if (result["code"] === 0) {
        ModelList.value = result["data"];
        selectModel.value = ModelList.value[0].ID;
        console.log("model_list:", ModelList.value);
      } else {
        ElMessage.error(result["msg"]);
      }
    } catch (e) {
      console.log(e);
    }
  };
  
  GetModelListByFunctionName();
  
  const getFileListData = async () => {
    let req = {
      token: localStorage.getItem("token"),
      type: "all",
    };
    let result = await FindUserFileService(req);
    if (result["code"] === 0) {
      filteredFiles.value = result["data"];
    } else {
      ElMessage.error(result["msg"]);
    }
  };

  const getSparkPPTThemeList = async () => {
    let req = {
        token: localStorage.getItem('token'),
        function: "spark-create-ppt",
        style: "简约",
        color: "蓝色",
        industry: "教育",
    }
    let result = await FindSparkPPTThemeListService(req);
    if (result['code'] === 0) {
        console.log("ppt_theme_list:", result['data']);
    } else {
        ElMessage.error(result['data']);
    }
}

const CreateSparkPPTOutline = async () => {
    let req = {
        token: localStorage.getItem('token'),
        function: "spark-create-ppt",
        session_id: sessionID.value,
        query: "AI生成PPT大纲",
        fileUrl: selectedFiles.value,
        fileName: "AI生成PPT大纲",
        title: "AI生成PPT大纲",
        theme: "简约",
        color: "蓝色",
        industry: "教育",
    }
    let result = await CreateSparkPPTOutlineService(req);
    if (result['code'] === 0) {
        baseInfo.value = result['base'];
        createOutlineResp.value = result['data'];
        console.log("ppt_outline:", result['data']);
    } else {
        ElMessage.error(result['data']);
    }
}

const CreateSparkPPT = async () => {
    let req = {
        token: localStorage.getItem('token'),
        function: "spark-create-ppt",
        outline: createOutlineResp.value.data.outline,
        query: "生成PPT",
        fileUrl:  fileUrl + selectedFiles.value[0].file_store_name,
        fileName: selectedFiles.value[0].UserFileName,
    }
    let result = await CreateSparkPPTService(req);
    if (result['code'] === 0) {
        baseInfo.value = result['base'];
        createPPTResp.value = result['data'];
        console.log("ppt:", result['data']);
    } else {
        ElMessage.error(result['data']);
    }
}

const getCreatedPPTStatus = async () => {
    let req = {
        token: localStorage.getItem('token'),
        function: "spark-create-ppt",
        session_id: sessionID.value,
    }
    let result = await GetSparkPPTStatusService(req);
    if (result['code'] === 0) {
        getPPTStatus.value = result['data'];
        console.log("ppt_status:", result['data']);
    } else {
        ElMessage.error(result['data']);
    }
}

getSparkPPTThemeList();
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
  
  /* 对话框 */
  .file-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  .file-icon {
    margin-right: 5px;
    color: #606266;
  }
  .file-time {
    float: right;
    color: #909399;
    font-size: 12px;
  }
  .footer-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .selected-count {
    margin-right: 10px;
  }
  .el-icon-document {
    color: #409eff;
  }
  </style>
  