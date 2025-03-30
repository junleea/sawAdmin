<template>
    <div>
        <div class="user-container">
            <el-card class="user-profile" shadow="hover" :body-style="{ padding: '0px' }">
                <div class="user-profile-bg"></div>
                <div class="user-avatar-wrap">
                    <el-avatar class="user-avatar" :size="120" :src="avatarImg" />
                </div>
                <div class="user-info">
                    <div class="info-name">{{ name }}</div>
                </div>
                <div class="user-footer">
                    <div class="user-footer-item">
                        <el-statistic title="提问数" :value="userStatistic.question" />
                    </div>
                    <div class="user-footer-item">
                        <el-statistic title="会话数" :value="userStatistic.session" />
                    </div>
                    <div class="user-footer-item">
                        <el-statistic title="文件数" :value="userStatistic.file_count" />
                    </div>
                    <div class="user-footer-item">
                        <el-statistic title="总计" :value="userStatistic.total" />
                    </div>
                </div>
            </el-card>
            <el-card
                class="user-content"
                shadow="hover"
                :body-style="{ padding: '20px 50px', height: '100%', boxSizing: 'border-box' }"
            >
                <el-tabs tab-position="left" v-model="activeName">
                    <!-- <el-tab-pane name="label1" label="消息通知" class="user-tabpane">
                        <TabsComp />
                    </el-tab-pane> -->
                    <el-tab-pane name="label2" label="我的头像" class="user-tabpane">
                        <div class="crop-wrap" v-if="activeName === 'label2'">
                            <vueCropper
                                ref="cropper"
                                :img="imgSrc"
                                :autoCrop="true"
                                :centerBox="true"
                                :full="true"
                                mode="contain"
                            >
                            </vueCropper>
                        </div>
                        <el-button class="crop-demo-btn" type="primary"
                            >选择图片
                            <input class="crop-input" type="file" name="image" accept="image/*" @change="setImage" />
                        </el-button>
                        <el-button type="success" @click="saveAvatar">上传并保存</el-button>
                    </el-tab-pane>
                    <el-tab-pane name="label3" label="修改密码" class="user-tabpane">
                        <el-form class="w500" label-position="top">
                            <el-form-item label="旧密码：">
                                <el-input type="password" v-model="form.old"></el-input>
                            </el-form-item>
                            <el-form-item label="新密码：">
                                <el-input type="password" v-model="form.new"></el-input>
                            </el-form-item>
                            <el-form-item label="确认新密码：">
                                <el-input type="password" v-model="form.new1"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="resetPassword ">保存</el-button>
                            </el-form-item>
                            <el-link type="primary" @click="reset_password()">忘记密码？使用验证码重置</el-link>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane name="label4"  v-if="isUserInfoLoaded" label="详细信息" class="user-tabpane">
                        <TableEdit :form-data="userInfo" :options="options_edit" :edit="true" :update="updateUserInfo" />
                    </el-tab-pane>
                </el-tabs>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts" name="ucenter">
import { reactive, ref,inject } from 'vue';
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';
import avatar from '@/assets/img/img.jpg';
import TabsComp from '../element/tabs.vue';
import {GetUserInfoService} from "@/api/user";
import { GetUserStatisticService } from "@/api/user";
import { UploadFileService } from "@/api/tool";
import { UserInfo } from '@/types/user';
import { FormOption, FormOptionList } from '@/types/form-option';
import { avatarEmits, ElMessage } from 'element-plus';
import TableEdit from '@/components/table-edit.vue';
import {genResetPassword} from "@/api/user";
import {updateUserInfoService} from "@/api/user";
import { useRouter } from "vue-router";

const name = localStorage.getItem('ms_username');
const form = reactive({
    new1: '',
    new: '',
    old: '',
});
const userStatistic = reactive({
    question: 0,
    session: 0,
    total: 0,
    file_count: 0,
});
const userInfo = ref<UserInfo>();
const isUserInfoLoaded = ref(false);
const globalData = inject("globalData");

const activeName = ref('label2');
const router = useRouter();
const avatarImg = ref('');
const imgSrc = ref('');
const cropImg = ref('');
const cropper: any = ref();

const reset_password = () => {
    localStorage.removeItem("ms_username");
    router.push('/reset-pwd');
};

const setImage = (e: any) => {
    const file = e.target.files[0];
    if (!file.type.includes('image/')) {
        ElMessage.error('请选择图片文件');
        return;
    }
        // 可选：检查文件大小
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        console.error('文件大小超过限制');
        return;
    }
    const reader = new FileReader();
    reader.onload = (event: any) => {
        imgSrc.value = event.target.result;
        cropper.value && cropper.value.replace(event.target.result);
    };
    reader.readAsDataURL(file);
};

const updateUserInfo = async (data: any) => {
    let result = null;
      try{
        let req={
            token:localStorage.getItem("token"),
            id:data.ID,
            name:data.Name,
            age:data.Age,
            gender:data.Gender,
            password:data.Password,
            email:data.Email,
            avatar:data.Avatar,
            role:data.Role
        };
        result = await updateUserInfoService(req)
        if (result["code"] === 0) {
          ElMessage.success("更新成功");
        } else {
          ElMessage.error("更新失败");
        }

      }catch(e){
        console.log(e);
      }
};

const resetPassword = async () =>{
    let req={
        old_password: form.old,
        new_password: form.new1,
        email: userInfo.value.Email,
        type:1
    }
    try{
        let result = await genResetPassword(req);
        if (result["code"] === 0) {
            //重置成功，返回新token
            if (result.data.token) {
                localStorage.setItem('token', result.data.token);
                globalData["token"] = result.data.token;
                ElMessage.success('重置密码成功');
            }
        } else {
            ElMessage.error(result["msg"]);
        }
    }catch(e){
        console.log(e)
    }

};

//编辑弹窗
let options_edit = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        // {prop: 'Avatar',label: '头像', type: 'input', required: false},
        { type: 'input', label: '用户ID', prop: 'ID', required: true,disabled:true },
        { type: 'input', label: '用户名', prop: 'Name', required: true },
        { type: 'input', label: '年龄', prop: 'Age', required: false },
        { type: 'input', label: '密码', prop: 'Password', required: false,disabled:true  },
        { type: 'input', label: '邮箱', prop: 'Email', required: true,disabled:true },
        { type: 'input', label: '性别', prop: 'Gender', required: false },
        //select 选择框,可选择admin与user两种角色
        { type: 'select', label: '角色', prop: 'Role', opts: [{label:"管理员",value:"admin"},{label:"普通用户",value:"user"}], required: false,disabled:true },

        { type: 'input', label: '注册时间', prop: 'CreatedAt', required: false,disabled:true  },
        { type: 'input', label: '上次修改时间', prop: 'UpdatedAt', required: false,disabled:true },
    ]
})

const GetMyUserInfo = async () => {
    let req = {
        token: localStorage.getItem('token'),
        id: localStorage.getItem('userId')
    };
    try{
        let result = await GetUserInfoService(req);
        if (result["code"] == 0) {
            avatarImg.value = result.data.Avatar == '' ? avatar : result.data.Avatar;
            imgSrc.value = avatarImg.value;
            userInfo.value = result.data;
            userInfo.value.Password = '**********';
        }else{
            ElMessage.error(result["msg"]);
        }
        isUserInfoLoaded.value = true;
    }catch(e){
        console.log(e);
    }
};
GetMyUserInfo();

const cropImage = () => {
    cropImg.value = cropper.value?.getCroppedCanvas().toDataURL();
};

// Data URL 转 File 对象的函数
const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const getUserStatistics = async () => {
    let req = {
        token: localStorage.getItem('token'),
        id: localStorage.getItem('userId')
    };
    try{
        let result = await GetUserStatisticService(req);
        if (result["code"] == 0) {
            userStatistic.question = result.data.message_count;
            userStatistic.session = result.data.session_count;
            userStatistic.file_count = result.data.file_count;
            userStatistic.total = userStatistic.question + userStatistic.session + userStatistic.file_count;
        }else{
            ElMessage.error(result["msg"]);
        }
    }catch(e){
        console.log(e);
    }
};
getUserStatistics();


const saveAvatar =async () => {
    let token = localStorage.getItem('token');
        avatarImg.value = cropImg.value;
        let formData = new FormData();
        //文件
        let file= dataURLtoFile(imgSrc.value, 'avatar.jpg');

        formData.append('file', file);
        //console.log("add file: " + this.file);
        formData.append('upload_type', "1");
        formData.append('md5',  "");
        formData.append('auth_type', "public");
        //console.log("formData:",formData);

        
        let result = await UploadFileService(formData, token);
        if (result["code"] !== 0) {
            ElMessage.error('上传文件失败，请稍后再试');
            return;
        }
        let resp_data = result.data;

        //console.log("resp:",resp_data);
        let url = "https://tx.ljsea.top/tool/file/"+resp_data.FileStoreName;

        userInfo.value.Avatar = url;
        avatarImg.value = url;
        //更新用户信息
        await updateUserInfo(userInfo.value);
};
</script>

<style scoped>
.user-container {
    display: flex;
}

.user-profile {
    position: relative;
}

.user-profile-bg {
    width: 100%;
    height: 200px;
    background-image: url('../../assets/img/ucenter-bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.user-profile {
    width: 500px;
    margin-right: 20px;
    flex: 0 0 auto;
    align-self: flex-start;
}

.user-avatar-wrap {
    position: absolute;
    top: 135px;
    width: 100%;
    text-align: center;
}

.user-avatar {
    border: 5px solid #fff;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 7px 12px 0 rgba(62, 57, 107, 0.16);
}

.user-info {
    text-align: center;
    padding: 80px 0 30px;
}

.info-name {
    margin: 0 0 20px;
    font-size: 22px;
    font-weight: 500;
    color: #373a3c;
}

.info-desc {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
}

.info-desc,
.info-desc a {
    font-size: 18px;
    color: #55595c;
}

.info-icon {
    margin-top: 10px;
}

.info-icon i {
    font-size: 30px;
    margin: 0 10px;
    color: #343434;
}

.user-content {
    flex: 1;
}

.user-tabpane {
    padding: 10px 20px;
}

.crop-wrap {
    width: 600px;
    height: 350px;
    margin-bottom: 20px;
}

.crop-demo-btn {
    position: relative;
}

.crop-input {
    position: absolute;
    width: 100px;
    height: 40px;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
}

.w500 {
    width: 500px;
}

.user-footer {
    display: flex;
    border-top: 1px solid rgba(83, 70, 134, 0.1);
}

.user-footer-item {
    padding: 20px 0;
    width: 33.3333333333%;
    text-align: center;
}

.user-footer > div + div {
    border-left: 1px solid rgba(83, 70, 134, 0.1);
}
</style>

<style>
.el-tabs.el-tabs--left {
    height: 100%;
}
</style>
