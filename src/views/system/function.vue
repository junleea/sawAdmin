<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit">
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
import { Function } from '@/types/function';
import {FindFunctionService} from "@/api/function";
import {UpdateFunctionService} from "@/api/function";
import {AddFunctionService} from "@/api/function";
import {DelFunctionService} from "@/api/function";
import {FindModelService} from "@/api/model";
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOption, FormOptionList } from '@/types/form-option';

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
    let req={
        token: localStorage.getItem('token'),
        type: "ID",
        id: parseInt(query.name)
    }
    let result = await FindFunctionService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};

// 表格相关
let columns = ref([
    // { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'ID', label: '功能ID' },
    {prop: 'Name', label: '名称'},
    {prop: "ModelID", label: "模型ID"},
    { prop: 'Function', label: '功能' },
    { prop: 'Info', label: '描述信息' },
    { prop: 'CreatedAt', label: '创建时间',type: 'date' },
    { prop: 'operator', label: '操作', width: 250 , operate: { view: true, edit: true, delete: true,push: {link: false,label:"继续该会话"} }},
])
const page = reactive({
    index: 1,
    size: 10,
    total: 122,
})
const tableData = ref<Function[]>([]);
const model_select_opts = ref([]);
const getData = async () => {
    let req={
        token: localStorage.getItem('token'),
        type: "UserID"
    }
    let modelResult = await FindModelService(req);
    for (let i = 0; i < modelResult.data.length; i++) {
        model_select_opts.value.push({
            label: modelResult.data[i].Type + ":" + modelResult.data[i].Description,
            value: modelResult.data[i].ID
        })
    }
    let result = await FindFunctionService(req);
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
        { type: 'input', label: '名称', prop: 'Name', required: true },
        { type: 'select', label: '模型', prop: 'ModelID', required: true, opts:model_select_opts.value },
        { type: 'input', label: '功能', prop: 'Function', required: true },
        { type: 'input', label: '描述', prop: 'Info', required: true },
    ]
})

//编辑弹窗
let options_edit = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '名称', prop: 'Name', required: true },
        { type: 'select', label: '模型', prop: 'ModelID', required: true, opts:model_select_opts.value, multiple: true},
        { type: 'input', label: '功能', prop: 'Function', required: true },
        { type: 'input', label: '描述', prop: 'Info', required: true },
    ]
})

const visible = ref(false);
const visible_add = ref(false);
const isEdit = ref(false);
const isAdd = ref(false);
const rowData = ref({});
const handleEdit = async (row: Function) => {
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
            name: data.Name,
            model_id: data.ModelID,
            function: data.Function,
            info: data.Info
        };
        result = await UpdateFunctionService(req)
        if (result['code'] === 0) {
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
            name: data.Name,
            model_id: data.ModelID,
            function: data.Function,
            info: data.Info
        }
        result = await AddFunctionService(req)
        if (result['code'] === 0) {
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

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [

    ]
});
const handleView =async (row: Function) => {
    viewData.value.row = row;
    viewData.value.list = [
        {
            prop: 'ID',
            label: '功能ID',
        },
        {
            prop: 'Name',
            label: '名称',
        },
        {
            prop: 'Function',
            label: '功能',
        },
        {
            prop: 'ModelID',
            label: '模型ID',
        },
        {
            prop: 'Info',
            label: '描述',
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
const handleDelete = async (row: Function) => {
    let req={
        token: localStorage.getItem('token'),
        id: row.ID,
    }
    try{
        let result = await DelFunctionService(req);
        if(result['code'] === 0){
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