<template>
    <div>
        <h2>智能选题推荐</h2>
    </div>
    <el-select v-model="selected" placeholder="请选择" multiple>
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
        </el-option>
    </el-select>
    <el-button type="primary" @click="handleSearch">查询</el-button>

</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
interface Option {
    value: string;
    label: string;
}
interface OptionList {
    value: string;
    label: string;
}

const selected = ref();
const options = ref<Option[]>([
    { value: 'option1', label: '选项1' },
    { value: 'option2', label: '选项2' },
    { value: 'option3', label: '选项3' },
    { value: 'option4', label: '选项4' },
]);
const handleSearch = async () => {
    // 这里可以添加查询逻辑
    console.log('Selected:', selected.value);
    // 发送请求到后端，获取推荐结果
    // let req={
    //     token: localStorage.getItem('token'),
    //     type: "ID",
    //     id: parseInt(query.name)
    // }
    // let result = await FindModelService(req);
    // tableData.value = result.data;
}
</script>
