<template>
  <div class="app-wrapper">
    <!-- 顶部区域 -->
    <div class="header">
      <div class="logo">
        <img src="../../assets/img/prompt.jpg" alt="Logo">
        <span>欢迎使用 Prompt 优解</span>
      </div>
      <div class="description">
        激发模型潜能，轻松优化Prompt。
      </div>
    </div>
    <!-- 主体内容区域 -->
    <div class="main-content">
      <!-- 左侧任务区域 -->
      <div class="task-section">
        <h2>你的任务</h2>
        <el-input
          type="textarea"
          placeholder="试试示例任务或简单描述你的任务，如总结文档摘要"
          v-model="taskInput"
          rows="10"
        />
        <el-button type="primary" @click="generatePrompt">生成Prompt</el-button>
        <div class="prompt-template">
          <h3>Prompt 模板</h3>
          <!-- <el-button type="success" size="small" @click="addTemplate">模板新增</el-button> -->
          <div v-for="(template, index) in templates" :key="index" class="template-item" @click="addTemplate(template)">
            <div class="template-title">{{ template.title }}</div>
            <div class="template-desc">{{ template.desc }}</div>
          </div>
        </div>
      </div>
      <!-- 右侧结果及模型参数区域 -->
      <div class="result-section">
        <h2>生成后的 Prompt</h2>
        <el-input
          type="textarea"
          placeholder="这里将展示AI根据任务描述辅助生成的Prompt"
          v-model="resultPrompt"
          rows="25"
        />
        <el-dropdown trigger="click" class="model-dropdown">
          <span class="el-dropdown-link">
            <img :src="selectedModel.logo" alt="Model Logo" class="model-logo">
            {{ selectedModel.name }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <div class="dropdown-content">
              <div class="model-list">
                <div
                  v-for="(model, index) in models"
                  :key="index"
                  class="model-item"
                  @click="selectModel(model)"
                >
                  <img :src="model.logo" alt="Model Logo" class="model-logo">
                  <div class="model-info">
                    <div class="model-name">{{ model.name }}</div>
                    <div class="model-version">{{ model.version }}</div>
                  </div>
                </div>
              </div>
              <div class="model-params">
                <h4>模型参数</h4>
                <el-slider v-model="temperature" :min="0" :max="1" :step="0.1"></el-slider>
                <div class="param-value">{{ temperature }}</div>
                <el-slider v-model="topP" :min="0" :max="1" :step="0.1"></el-slider>
                <div class="param-value">{{ topP }}</div>
              </div>
            </div>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 历史会话 -->
    <el-button  @click="showSession">历史提示词</el-button>
    <el-dialog title="历史提示词" v-model="isShowSession">
      <div v-for="(session, index) in sessionList" :key="index" class="template-item" @click="selectSession(session)">
            <div class="template-title">{{ session.Name }}</div>
            <!-- <div class="template-desc">{{ template.desc }}</div> -->
          </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted} from "vue";
import { WSMessage} from "@/types/im";
import { FindModelListByFunctionName } from "@/api/function";
import { Model } from "@/types/model";
import { ElMessage } from "element-plus";
import { GetMessageService } from "@/api/im";
import { FindSessionService } from "@/api/session";
import { Session } from '@/types/session';
// 任务输入和结果Prompt
const taskInput = ref('');
const resultPrompt = ref('');
const socket = ref(null);
const deepseekLogo = "https://tse2-mm.cn.bing.net/th/id/OIP-C.-FZbTC72cXtUasfnISVDHgHaHa?rs=1&pid=ImgDetMain";
const sparkLogo = "https://ts1.tc.mm.bing.net/th/id/R-C.421fb106722f3882c9f09650b281473f?rik=jMNRmW%2blXdjDvg&riu=http%3a%2f%2fwww.kuaipng.com%2fUploads%2fpic%2fw%2f2023%2f05-12%2f140009%2fwater_140009_698_698_.png&ehk=XSQ7SDsl6rJCOzDjsbIOvvuGhTv0HbPZTrD6u4yUTzM%3d&risl=&pid=ImgRaw&r=0";
const doubaoLogo ="https://ai-bot.cn/wp-content/uploads/2024/09/doubao-llm-logo1.png";

// 模型列表
const models = ref([
  {
    id: 0,
    logo: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.-FZbTC72cXtUasfnISVDHgHaHa?rs=1&pid=ImgDetMain',
    name: 'Deepseek-R1',
    version: 'Deepseek-R1'
  },
]);

const ModelList = ref<Model[]>([]);
const pselectModel = ref<Model>();
const selectedModel = ref(models.value[0]);

// 温度和Top P参数
const temperature = ref(1);
const topP = ref(0.7);

// 会话ID
const sessionID = ref(0);
const isShowSession = ref(false);
const sessionList = ref<Session[]>([]);

// Prompt模板
const templates = ref([
  {
    title: '给我写一封电子邮件',
    desc: '起草回复客户投诉的电子邮件并提供解决方案。'
  },
  {
    title: '文档总结',
    desc: '从提供的文档中提取总结要点，要点数量不超过10个。'
  },
]);

// 生成Prompt方法
const generatePrompt = () => {
  // 这里添加实际调用API生成Prompt的逻辑
  //resultPrompt.value = '模拟生成的Prompt';
  resultPrompt.value = '';
  sendMessage();
};

// 新增模板方法
const addTemplate = (template) => {
  // 这里添加新增模板的逻辑，例如弹出输入框让用户输入模板内容
  console.log('添加模板功能待实现:', template);
  taskInput.value = template.desc;
};

// 选择模型方法
const selectModel = (model) => {
  selectedModel.value = model;
};

//挂载时
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
  

  socket.value.onmessage = (event) => {
    let msg: WSMessage = JSON.parse(event.data);
    receiveMessage(msg);
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

const receiveMessage = (msg:WSMessage) => {
  resultPrompt.value += msg.msg.msg.response;
};

const sendMessage = () => {
  if (taskInput.value.trim() === "") {
    ElMessage.warning("消息不能为空");
    return;
  }
  let msg = {
    msg: taskInput.value,
    type: "ollama",
    function: "gen-prompt",
    session_id: sessionID.value,
    model_id: selectedModel.value.id,
  };
  socket.value.send(JSON.stringify(msg));
};

const GetModelListByFunctionName = async () => {
  let req = {
    function: "gen-prompt",
    token: localStorage.getItem("token"),
    temperature: temperature.value,
    top_p: topP.value,
  };
  try{
    let result = await FindModelListByFunctionName(req);
    if (result["code"] === 0) {
      ModelList.value = result["data"];
      pselectModel.value = ModelList.value[0];
      console.log("model_list:", ModelList.value);
    } else {
      ElMessage.error(result["msg"]);
    }
  }catch (e) {
    console.log(e);
  }
  models.value = [];

  for(let i = 0; i < ModelList.value.length; i++) {
    let model = ModelList.value[i];
    if (model["Type"] === "deepseek") {
      models.value.push({
        id: model["ID"],
        logo: deepseekLogo,
        name: model["Type"],
        version: model["Description"],
      });
    } else if (model["Type"] === "spark") {
      models.value.push({
        id: model["ID"],
        logo: sparkLogo,
        name: model["Description"],
        version: model["Description"],
      });
    } else if (model["Type"] === "doubao") {
      models.value.push({
        id: model["ID"],
        logo: doubaoLogo,
        name: model["Type"],
        version: model["Description"],
      });
    }
  }
  selectedModel.value = models.value[0];

};

GetModelListByFunctionName();

const showSession = async () => {
  //获取历史会话
  let req = {
    token: localStorage.getItem("token"),
    type: "UserID",
    session_type: 2, //提示词会话
  };
  let result = await FindSessionService(req);
  if (result["code"] === 0) {
    sessionList.value = result["data"];
    console.log("session_list:", sessionList.value);
  } else {
    ElMessage.error(result["msg"]);
  }
  isShowSession.value = true;
};

const selectSession = async (session: Session) => {
  let req = {
      token: localStorage.getItem("token"),
      session_id: session.ID,
    };
    let result = await GetMessageService(req);
    if (result["code"] === 0) {
      taskInput.value = result["data"][0].Msg;
      resultPrompt.value = result["data"][1].Msg;
      console.log("session_list:", result["data"]);
    } else {
      ElMessage.error(result["msg"]);
    }

};


onUnmounted(() => {
  if (socket.value) {
    socket.value.close();
  }
});
</script>

<style scoped>
.app-wrapper {
  padding: 20px;
  background-color: #f4f4f4;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.logo {
  display: flex;
  align-items: center;
}
.logo img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}
.main-content {
  display: flex;
  height: 80%;
}
.task-section,
.result-section {
  width: 50%;
  background-color: white;
  padding: 20px;
  margin-right: 20px;
}
.prompt-template {
  margin-top: 20px;
}
.template-item {
  border: 1px solid #e4e4e4;
  padding: 10px;
  margin-bottom: 10px;
}
.template-title {
  font-weight: bold;
  margin-bottom: 5px;
}
.model-dropdown {
  margin-top: 10px;
}
.model-logo {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}
.dropdown-content {
  width: 300px;
  padding: 10px;
}
.model-list {
  max-height: 200px;
  overflow-y: auto;
}
.model-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
  cursor: pointer;
}
.model-info {
  margin-left: 10px;
}
.model-params {
  margin-top: 10px;
}
.param-value {
  margin-top: 5px;
  text-align: right;
}
</style>