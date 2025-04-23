<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-header">
                <img class="logo mr10" src="../../assets/img/logo.svg" alt="">
                <div class="login-title">
                    大学生学业作品AI生成工具
                </div>
            </div>
            <el-form :model="param" :rules="rules" ref="register" size="large">
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="用户名">
                        <template #prepend>
                            <el-icon>
                                <User />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input v-model="param.email" placeholder="邮箱">
                        <template #prepend>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="param.password">
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="param.repassword">
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-button class="login-btn" type="primary" size="large" @click="onRegister">注册</el-button>
                <p class="login-text">已有账号，<el-link type="primary" @click="$router.push('/login')">立即登录</el-link></p>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive,inject } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { registerService } from "@/api/user";
import {GetUserInfoService} from "@/api/user";
import { usePermissStore } from "@/store/permiss";
const router = useRouter();
const permiss = usePermissStore();

const globalData = inject("globalData");
const param = reactive({
    username: '',
    password: '',
    repassword: '',
    email: '',
});

const registerData = ref({
  username: "",
  email: "",
  password: "",
  repassword: "",
});

const rules = {
    username: [
        {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
        },
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
};

const register = ref();

const getMyUserInfo = async (id) => {
  let result = {};
  try {
    let tokenData ={
      token: localStorage.getItem("token"),
      id: id,
    }
    result = await GetUserInfoService(tokenData);
    if (result["code"] === 0) {
      //console.log("token data:",this.tokenData)
    //   localStorage.setItem("video_func", result.data.VideoFunc);
    //   localStorage.setItem("device_func", result.data.DeviceFunc);
    //   localStorage.setItem("cid_func", result.data.CIDFunc);
    //   localStorage.setItem("role", result.data.Role);

      ElMessage.success("注册成功");
        localStorage.setItem("ms_username", result["data"]["Name"]);
        const keys =
            permiss.defaultList[result["data"]["Role"] == "admin" ? "admin" : "user"];
        permiss.handleSet(keys);
        localStorage.setItem("ms_keys", JSON.stringify(keys));
        localStorage.setItem("ms_role", result["data"]["Role"]);
        router.push("/");

      //alert("video_func:" + localStorage.getItem("video_func")+"    type:" +typeof(localStorage.getItem("video_func")));
    }
  } catch (e) {
    console.log(e);
  }
};
//注册接口调用
const onRegister = async () => {
    registerData.value = param;

  //校验密码是否一致
  if (registerData.value.password !== registerData.value.repassword) {
    //alert("两次密码不一致");
    ElMessage.error("两次密码不一致");
    return;
  }
  //校验邮箱是否合法
  let email = registerData.value.email;
  let reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
  if (!reg.test(email)) {
    //alert("邮箱格式不正确");
    ElMessage.error("邮箱格式不正确");
    return;
  }

  let result = await registerService(registerData);
  if (result !== null) {
    globalData["token"] = result.data;
    localStorage.setItem("token", result.data.token);
    localStorage.setItem("userId", result.data.id);
    localStorage.setItem("username", result.data.username);
    let now = new Date();
    localStorage.setItem("end_time", (now.setDate(now.getHours() + 12)).toString()); //过期时间
    //token.value= result.data;
    await getMyUserInfo(result.data.id);
    router.push("/home");
  }
};
</script>

<style scoped>
.login-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
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

.login-btn {
    display: block;
    width: 100%;
}

.login-text {
    display: flex;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: #787878;
}
</style>
