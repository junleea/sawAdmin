<template>
    <div class="container">
        <div class="content-title">支持拖拽</div>
        <el-upload class="upload-demo" drag 
           action="https://pm.ljsea.top/file/upload" multiple
           :data="uploadData"
           :headers="headers"
            :on-success="handleSuccess"
            :on-error="handleError"
            :before-upload="beforeUpload"
            :on-change="handle">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
                将文件拖到此处，或
                <em>点击上传</em>
            </div>
        </el-upload>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
const handle = (rawFile: any) => {
    console.log(rawFile);
};

interface UploadData {
    upload_type: string;
    auth_type: string;
    md5: string;
    type: string;
  }
const uploadData: UploadData = {
    upload_type: 'file',
    auth_type: 'public',
    md5: '',
    type: 'file',
};
const headers = {
        "token": localStorage.getItem('token') || '',
      };

      const handleSuccess = (response: any, file: any, fileList: any) => {
        let res = response;
        if (res.code !== 0){
            ElMessage.error(res.error);
            return;
        }
        console.log('上传成功', res);
        ElMessage.success('上传成功');
      };
  
      const handleError = (error: any, file: any, fileList: any) => {
        console.log('上传失败', error);
        ElMessage.error('上传失败');
      };
  
      const beforeUpload = (file: any) => {
        // 可以在这里进行文件验证等操作
        return true;
      };
</script>

<style scoped>
.content-title {
    font-weight: 400;
    line-height: 50px;
    margin: 10px 0;
    font-size: 22px;
    color: #1f2f3d;
}

.upload-demo {
    width: 30%;
}
</style>
