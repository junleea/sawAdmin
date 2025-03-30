<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" :refresh="getData" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit" :genOperate="handleGenOperate" :refresh="getData">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible_add = true" v-if="userRole">新增</el-button>
                </template>
            </TableCustom>

        </div>
        <el-dialog :title="isEdit ? '编辑': '编辑'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options_edit" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog :title="isAdd ? '新增' : '新增'" v-model="visible_add" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isAdd" :update="addData" />
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { UserInfo } from '@/types/user';
import { Model } from '@/types/model';
import { fetchUserData } from '@/api';
import {FindModelService} from "@/api/model";
import {UpdateModelService} from "@/api/model";
import {AddModelService} from "@/api/model";
import {DelModelService} from "@/api/model";
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOption, FormOptionList } from '@/types/form-option';
import { number } from 'echarts';

const userRole = localStorage.getItem('role') == 'admin';

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '模型ID：', prop: 'name' }
])
const handleSearch = async () => {
    // query.name是否是数字
    if (isNaN(Number(query.name))) {
        ElMessage.error('请输入数字');
        return;
    }
    if (query.name === '') {
        ElMessage.error('请输入模型ID');
        return;
    }
    let req={
        token: localStorage.getItem('token'),
        type: "ID",
        id: parseInt(query.name)
    }
    let result = await FindModelService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};

// 表格相关
let columns = ref([
  //  { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'ID', label: '模型ID' },
    { prop: 'Type', label: '类型' },
    {prop: 'Description', label: '描述'},
    { prop: 'Parameter', label: '参数', width: 250 },
    {prop: 'Url', label: 'URl'},
    { prop: 'token', label: '消耗token数',width:50},
    { prop: 'CreatedAt', label: '创建时间',type: 'date' },
    { prop: 'operator', label: '操作', width: 250 , operate: { view: true, edit: true, delete: true,push: {link: false,label:"继续该会话"},gen: {show: false,label:"下载文件"} }},
])
const page = reactive({
    index: 1,
    size: 10,
    total: 122,
})
const tableData = ref<Model[]>([]);
const getData = async () => {
    let req={
        token: localStorage.getItem('token'),
        type: "UserID"
    }
    let result = await FindModelService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};
getData();

const changePage = (val: number) => {
    page.index = val;
    getData();
};

// 新增弹窗
let options = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'select', label: '类型', prop: 'Type', required: true , opts:[{label: '本地部署模型', value: 'ollama'},{label: '星火', value: 'spark'},{label: '豆包', value: 'doubao'}]},
        { type: 'input', label: 'URL', prop: 'Url', required: true },
        { type: 'input', label: '参数', prop: 'Parameter', required: true },
        { type: 'input', label: '描述', prop: 'Description', required: true },
    ]
})

//编辑弹窗
let options_edit = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'select', label: '类型', prop: 'Type', required: true,opts:[{label: '本地部署模型', value: 'ollama'},{label: '星火', value: 'spark'},{label: '豆包', value: 'doubao'}]},
        { type: 'input', label: 'URL', prop: 'Url', required: true },
        { type: 'input', label: '参数', prop: 'Parameter', required: true, rows: 4 },
        { type: 'input', label: '描述', prop: 'Description', required: true },
    ]
})

const visible = ref(false);
const visible_add = ref(false);
const isEdit = ref(false);
const isAdd = ref(false);
const rowData = ref({});
const handleEdit = async (row: Model) => {
    let data = row;
    rowData.value = data;
    console.log("edit_row_data:", rowData.value);
    isEdit.value = true;
    visible.value = true;
};
const updateData = async (data) => {
    let result ={}
      try{
        let req={
            token:localStorage.getItem("token"),
            id: data.ID,
            type: data.Type,
            url: data.Url,
            parameter: data.Parameter,
            description: data.Description
        };
        result = await UpdateModelService(req)
        if (result["code"] === 0) {
          ElMessage.success("更新成功");
        } else {
          ElMessage.error("更新失败");
        }

      }catch(e){
        console.log(e);
      }
      closeDialog();
      getData();
};

const addData = async (data) => {
    let result ={}
      try{
        let req={
            token:localStorage.getItem("token"),
            type: data.Type,
            url: data.Url,
            parameter: data.Parameter,
            description: data.Description
        };
        result = await AddModelService(req)
        if (result["code"] === 0) {
          ElMessage.success("新增成功");
        } else {
          ElMessage.error("新增失败");
        }

      }catch(e){
        console.log(e);
      }
    closeDialog();
    getData();
};


const closeDialog = () => {
    visible.value = false;
    visible_add.value = false;
    isEdit.value = false;
};

const handleGenOperate = async (row: File) => {
    console.log("gen row:", row);
}

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [

    ]
});
const handleView =async (row: Model) => {
    viewData.value.row = row;
    viewData.value.list = [
        {
            prop: 'ID',
            label: '模型ID',
        },
        {
            prop: 'Type',
            label: '类型',
        },
        {
            prop: 'Description',
            label: '描述',
        },
        {
            prop: 'Parameter',
            label: '参数',
        },
        {
            prop: 'Url',
            label: 'URL',
        },
        {
            prop: 'CreatedAt',
            label: '创建时间',
            type: 'date'
        },
        {
            prop: 'UpdatedAt',
            label: '更新时间',
            type: 'date'
        },
    ]
    visible1.value = true;
};

// 删除相关
const handleDelete = async (row: Model) => {
    let req={
        token: localStorage.getItem('token'),
        id: row.ID,
    }
    try{
        let result = await DelModelService(req);
        if(result["code"] === 0){
            ElMessage.success("删除成功");
            getData();
        }else{
            ElMessage.error("删除失败");
        }
    }catch(e){
        console.log(e);
    }
}
</script>

<style scoped></style>