<template>
  <div class="login-bg">
    <div class="login-container">
      <div class="login-header">
        <img class="logo mr10" src="../../assets/img/logo.svg" alt="" />
        <div class="login-title">大学生学业作品AI生成工具</div>
      </div>
      <el-form :model="param" :rules="rules" ref="login" size="large">
        <el-form-item prop="username">
          <el-input v-model="param.username" placeholder="用户名或邮箱">
            <template #prepend>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="密码"
            v-model="param.password"
          >
            <template #prepend>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <div class="pwd-tips">
          <el-checkbox
            class="pwd-checkbox"
            v-model="checked"
            label="记住密码"
          />
          <el-link type="primary" @click="$router.push('/reset-pwd')"
            >忘记密码</el-link
          >
        </div>
        <el-button
          class="login-btn"
          type="primary"
          size="large"
          @click="onLogin"
          >登录</el-button
        >
        <p class="login-text">
          没有账号？<el-link type="primary" @click="$router.push('/register')"
            >立即注册</el-link
          >
        </p>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { loginService } from "@/api/user";
import { GetUserInfoService } from "@/api/user";
import { usePermissStore } from "@/store/permiss";
// 从本地存储获取登录参数
const lgStr = localStorage.getItem("login-param");
const defParam = lgStr ? JSON.parse(lgStr) : null;
const globalData = inject("globalData");
const permiss = usePermissStore();
// 记住密码状态
const checked = ref(lgStr ? true : false);

const router = useRouter();
// 登录表单数据
const param = reactive({
  username: defParam ? defParam.username : "",
  password: defParam ? defParam.password : "",
});

// 表单验证规则
const rules = {
  username: [
    {
      required: true,
      message: "请输入用户名",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
};
// 表单引用
const login = ref(null);

//表单数据
var loginData = ref({
  username: "",
  email: "",
  password: "",
  ip: "",
});

//登录接口调用
const onLogin = async () => {
  console.log("params:", param);

  loginData.value.username = param.username;
  loginData.value.password = param.password;
  let result = await loginService(loginData);
  console.log("login result:", result);
  if (result["code"] !== 0) {
    //alert(result.message);
    ElMessage.error("登录失败！用户名或密码错误");
    return;
  }
  globalData["token"] = result.data;
  localStorage.setItem("token", result.data.token);
  localStorage.setItem("userId", result.data.id);
  localStorage.setItem("username", result.data.username);
  let now = new Date();
  localStorage.setItem("end_time", (now.setDate(now.getHours() + 12)).toString()); //过期时间
  await getMyUserInfo(result.data.id);
  //token.value= result.data;

};

const getMyUserInfo = async (id) => {
  let result = {};
  try {
    let tokenData = {
      token: localStorage.getItem("token"),
      id: id,
    };
    result = await GetUserInfoService(tokenData);
    if (result["code"] === 0) {
      //console.log("token data:",this.tokenData)
      // localStorage.setItem("video_func", result.data.VideoFunc);
      // localStorage.setItem("device_func", result.data.DeviceFunc);
      // localStorage.setItem("cid_func", result.data.CIDFunc);
      // localStorage.setItem("role", result.data.Role);

      ElMessage.success("登录成功");
        localStorage.setItem("ms_username", result["data"]["Name"]);
        const keys =
            permiss.defaultList[result["data"]["Role"] == "admin" ? "admin" : "user"];
            localStorage.setItem("ms_imgurl", result["data"]["Avatar"]);
        permiss.handleSet(keys);
        localStorage.setItem("ms_keys", JSON.stringify(keys));
        router.push("/");

      //alert("video_func:" + localStorage.getItem("video_func")+"    type:" +typeof(localStorage.getItem("video_func")));
    }
  } catch (e) {
    console.log(e);
  }
};

// 获取标签存储并清空标签
</script>

<style scoped>
.login-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: url(../../assets/img/login-bg3.jpg) center/cover no-repeat;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.logo {
  width: 35px;
}

.login-title {
  font-size: 22px;
  color: #333;
  font-weight: bold;
}

.login-container {
  width: 450px;
  border-radius: 5px;
  background: #fff;
  padding: 40px 50px 50px;
  box-sizing: border-box;
}

.pwd-tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin: -10px 0 10px;
  color: #787878;
}

.pwd-checkbox {
  height: auto;
}

.login-btn {
  display: block;
  width: 100%;
}

.login-tips {
  font-size: 12px;
  color: #999;
}

.login-text {
  display: flex;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  color: #787878;
}
</style>
