<template>
    <div>
      <el-upload
        class="upload-demo"
        action="http://localhost:8080/upload"
        :data="uploadData"
        :headers="headers"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        ref="uploadRef"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  interface UploadData {
    upload_type: string;
    auth_type: string;
    md5: string;
    type: string;
  }
  
  export default defineComponent({
    setup() {
      const uploadData: UploadData = {
        upload_type: 'your_upload_type',
        auth_type: 'your_auth_type',
        md5: 'your_md5_value',
        type: 'your_type'
      };
  
      const headers = {
        'Content-Type': 'multipart/form-data'
      };
  
      const uploadRef = ref(null);
  
      const handleSuccess = (response: any, file: any, fileList: any) => {
        console.log('上传成功', response);
      };
  
      const handleError = (error: any, file: any, fileList: any) => {
        console.log('上传失败', error);
      };
  
      const beforeUpload = (file: any) => {
        // 可以在这里进行文件验证等操作
        return true;
      };
  
      return {
        uploadData,
        headers,
        uploadRef,
        handleSuccess,
        handleError,
        beforeUpload
      };
    }
  });
  </script>
  
  <style scoped>
  .upload-demo {
    margin-top: 20px;
  }
  </style>    