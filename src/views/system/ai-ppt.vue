<template>
    <div>
        <p>智能ppt生成</p>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import {FindSparkPPTThemeListService} from "@/api/ppt";

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

getSparkPPTThemeList();

</script>