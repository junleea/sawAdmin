<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="reset-title">重置密码</div>
            <p class="reset-text">输入你的邮箱，发送重置密码邮件</p>
            <el-form :model="param" :rules="rules" ref="register" size="large">
                <el-form-item prop="email">
                    <el-input v-model="param.email" placeholder="邮箱">
                        <template #prepend>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-button type="primary" class="login-btn" :disabled="isCountingDown" @click="sendCodeMail">{{ buttonText }}</el-button>
                <p class="login-text" />
                <el-form-item prop="email">
                    <el-input v-model="param.code" placeholder="验证码">
                        <template #prepend>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input v-model="param.password" placeholder="新密码">
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input v-model="param.repassword" placeholder="重复新密码">
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-button class="login-btn" type="primary" size="large" @click="resetPassword">确认重置</el-button>
                <p class="login-text"><el-link type="primary" @click="$router.push('/login')">返回登录</el-link></p>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref,inject } from 'vue';
import { ElMessage } from 'element-plus';
import {genResetPassword} from "@/api/user";
import { useRouter } from 'vue-router';

const param = ref({
    email: '',
    code: '',
    password: '',
    repassword: ''
});

const buttonText = ref('发送验证码');
const countdown = ref(60); // 初始倒计时时间
const isCountingDown = ref(false);
const COUNT_DOWN_TIME = 60; // 倒计时总时间
const globalData = inject("globalData");
const router = useRouter();

const rules = {
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
};

const resetPassword  = async () =>{
    if (param.value.password !== param.value.repassword) {
        ElMessage.error('两次输入的密码不一致');
        return;
    }
    let req={
        email: param.value.email,
        code: param.value.code,
        new_password: param.value.password,
        type: 2  // 2表示验证码重置密码
    }

    try{
        let result = await genResetPassword(req);
        if (result["code"] === 0) {
            //重置成功，返回新token，直接登录
            if (result.data.token) {
                localStorage.setItem('token', result.data.token);
                globalData["token"] = result.data.token;
                ElMessage.success('重置密码成功');
                router.push('/home');
            } else {
                ElMessage.success('重置密码成功，请登录');
                router.push('/login');
            }
        } else {
            ElMessage.error(result["message"]);
        }
        
    }catch(err){
        ElMessage.error('重置密码失败');
    }

};

const sendCodeMail = async () => {
    if (isCountingDown.value) return;

    let req={
        email: param.value.email,
        type: 0  //获取验证码
    }

    
    try{
        let result = await genResetPassword(req);
        if (result["code"] === 0) {
            //重置成功，返回新token，直接登录
            ElMessage.success('邮件已成功发送，请查收');
        } else {
            ElMessage.error(result["message"]);
            return;
        }
        
    }catch(err){
        ElMessage.error('重置密码失败');
    }



    // 开始倒计时
    isCountingDown.value = true;
    buttonText.value = `${COUNT_DOWN_TIME}秒后重新发送`;

    const timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
        clearInterval(timer);
        isCountingDown.value = false;
        countdown.value = COUNT_DOWN_TIME;
        buttonText.value = '发送邮件';
    } else {
        buttonText.value = `${countdown.value}秒后可重新发送`;
    }
    }, 1000);
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

.reset-title {
    text-align: center;
    font-size: 22px;
    color: #333;
    font-weight: bold;
    margin-bottom: 10px;
}

.reset-text {
    text-align: center;
    font-size: 14px;
    color: #787878;
    margin-bottom: 40px;
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
    justify-content: center;
    margin-top: 20px;
    font-size: 14px;
    color: #333;
}
</style>
